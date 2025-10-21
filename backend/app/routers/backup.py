from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
import json
import io
from datetime import datetime
import re
from html import unescape

router = APIRouter()

@router.get("/export")
async def export_data(db: Session = Depends(get_db)):
    """Export all data as JSON"""
    
    # Get all notes with entries and labels
    notes = db.query(models.DailyNote).all()
    labels = db.query(models.Label).all()
    search_history = db.query(models.SearchHistory).order_by(models.SearchHistory.created_at.desc()).all()
    
    export_data = {
        "version": "3.0",
        "exported_at": datetime.utcnow().isoformat(),
        "search_history": [
            {
                "query": item.query,
                "created_at": item.created_at.isoformat()
            }
            for item in search_history
        ],
        "labels": [
            {
                "id": label.id,
                "name": label.name,
                "color": label.color,
                "created_at": label.created_at.isoformat()
            }
            for label in labels
        ],
        "notes": [
            {
                "date": note.date,
                "fire_rating": note.fire_rating,
                "daily_goal": note.daily_goal,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
                "labels": [label.id for label in note.labels],
                "entries": [
                    {
                        "content": entry.content,
                        "content_type": entry.content_type,
                        "order_index": entry.order_index,
                        "include_in_report": bool(entry.include_in_report),
                        "is_important": bool(entry.is_important),
                        "is_completed": bool(entry.is_completed),
                        "created_at": entry.created_at.isoformat(),
                        "updated_at": entry.updated_at.isoformat(),
                        "labels": [label.id for label in entry.labels]
                    }
                    for entry in note.entries
                ]
            }
            for note in notes
        ]
    }
    
    # Create JSON file in memory
    json_data = json.dumps(export_data, indent=2)
    
    # Return as downloadable file
    return StreamingResponse(
        io.BytesIO(json_data.encode()),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=pull-your-poop-together-backup-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.json"
        }
    )

def html_to_markdown(html_content: str) -> str:
    """Convert HTML content to markdown"""
    if not html_content:
        return ""
    
    # Unescape HTML entities
    text = unescape(html_content)
    
    # Convert headers
    text = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h6[^>]*>(.*?)</h6>', r'###### \1\n', text, flags=re.DOTALL)
    
    # Convert bold
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    
    # Convert italic
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text, flags=re.DOTALL)
    
    # Convert links
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)
    
    # Convert code blocks
    text = re.sub(r'<pre[^>]*><code[^>]*>(.*?)</code></pre>', r'```\n\1\n```', text, flags=re.DOTALL)
    
    # Convert inline code
    text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', text, flags=re.DOTALL)
    
    # Convert blockquotes
    text = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', lambda m: '\n'.join('> ' + line for line in m.group(1).strip().split('\n')) + '\n', text, flags=re.DOTALL)
    
    # Convert lists
    text = re.sub(r'<ul[^>]*>(.*?)</ul>', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'<ol[^>]*>(.*?)</ol>', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', text, flags=re.DOTALL)
    
    # Convert line breaks
    text = re.sub(r'<br\s*/?>', '\n', text)
    
    # Convert paragraphs
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)
    
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Clean up multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

@router.get("/export-markdown")
async def export_markdown(db: Session = Depends(get_db)):
    """Export all data as Markdown for LLM consumption"""
    
    # Get all notes with entries and labels, sorted by date
    notes = db.query(models.DailyNote).order_by(models.DailyNote.date).all()
    labels = db.query(models.Label).all()
    
    # Build markdown content
    markdown_lines = []
    markdown_lines.append("# Daily Workspace Export")
    markdown_lines.append(f"\nExported: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
    markdown_lines.append("---\n")
    
    # Add label index
    if labels:
        markdown_lines.append("## Labels\n")
        for label in labels:
            markdown_lines.append(f"- **{label.name}**")
        markdown_lines.append("\n---\n")
    
    # Add notes
    for note in notes:
        if not note.entries and not note.daily_goal:
            continue
            
        markdown_lines.append(f"\n## {note.date}\n")
        
        # Add daily goal if present
        if note.daily_goal:
            markdown_lines.append(f"**Daily Goals:** {note.daily_goal}\n")
        
        # Add note labels if present
        if note.labels:
            label_names = [label.name for label in note.labels]
            markdown_lines.append(f"**Day Labels:** {', '.join(label_names)}\n")
        
        # Add entries
        if note.entries:
            for idx, entry in enumerate(note.entries, 1):
                markdown_lines.append(f"\n### Entry {idx}")
                markdown_lines.append(f"*Created: {entry.created_at.strftime('%Y-%m-%d %H:%M:%S')}*\n")
                
                # Add entry metadata
                metadata = []
                if entry.is_important:
                    metadata.append("⭐ Important")
                if entry.is_completed:
                    metadata.append("✓ Completed")
                if entry.include_in_report:
                    metadata.append("📄 In Report")
                
                if metadata:
                    markdown_lines.append(f"**Status:** {' | '.join(metadata)}\n")
                
                # Add entry labels
                if entry.labels:
                    label_names = [label.name for label in entry.labels]
                    markdown_lines.append(f"**Labels:** {', '.join(label_names)}\n")
                
                # Add content
                if entry.content_type == 'code':
                    markdown_lines.append(f"\n```\n{entry.content}\n```\n")
                else:
                    # Convert HTML to markdown
                    content_md = html_to_markdown(entry.content)
                    markdown_lines.append(f"\n{content_md}\n")
        
        markdown_lines.append("\n---\n")
    
    # Join all lines
    markdown_content = "\n".join(markdown_lines)
    
    # Return as downloadable file
    return StreamingResponse(
        io.BytesIO(markdown_content.encode('utf-8')),
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename=daily-workspace-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.md"
        }
    )

@router.post("/import")
async def import_data(
    file: UploadFile = File(...),
    replace: bool = False,
    db: Session = Depends(get_db)
):
    """Import data from JSON backup file"""
    
    try:
        content = await file.read()
        data = json.loads(content)
        
        # Validate data structure
        if "version" not in data or "notes" not in data:
            raise HTTPException(status_code=400, detail="Invalid backup file format")
        
        stats = {
            "labels_imported": 0,
            "notes_imported": 0,
            "entries_imported": 0,
            "labels_skipped": 0,
            "notes_skipped": 0,
            "search_history_imported": 0
        }
        
        # Import search history
        search_history_data = data.get("search_history", [])
        for history_item in search_history_data:
            # Check if this query already exists
            existing = db.query(models.SearchHistory).filter(
                models.SearchHistory.query == history_item["query"],
                models.SearchHistory.created_at == datetime.fromisoformat(history_item["created_at"])
            ).first()
            
            if not existing:
                new_history = models.SearchHistory(
                    query=history_item["query"],
                    created_at=datetime.fromisoformat(history_item["created_at"])
                )
                db.add(new_history)
                stats["search_history_imported"] += 1
        
        db.commit()
        
        # Import labels (support both old "tags" and new "labels" format)
        label_id_mapping = {}
        labels_data = data.get("labels", data.get("tags", []))
        for label_data in labels_data:
            existing_label = db.query(models.Label).filter(models.Label.name == label_data["name"]).first()
            if existing_label:
                label_id_mapping[label_data["id"]] = existing_label.id
                stats["labels_skipped"] += 1
            else:
                new_label = models.Label(
                    name=label_data["name"],
                    color=label_data.get("color", "#3b82f6")
                )
                db.add(new_label)
                db.flush()
                label_id_mapping[label_data["id"]] = new_label.id
                stats["labels_imported"] += 1
        
        db.commit()
        
        # Import notes
        for note_data in data["notes"]:
            existing_note = db.query(models.DailyNote).filter(
                models.DailyNote.date == note_data["date"]
            ).first()
            
            if existing_note:
                if replace:
                    # Delete existing entries
                    db.query(models.NoteEntry).filter(
                        models.NoteEntry.daily_note_id == existing_note.id
                    ).delete()
                    existing_note.labels.clear()
                    note = existing_note
                    note.fire_rating = note_data.get("fire_rating", 0)
                    note.daily_goal = note_data.get("daily_goal", "")
                else:
                    stats["notes_skipped"] += 1
                    continue
            else:
                note = models.DailyNote(
                    date=note_data["date"],
                    fire_rating=note_data.get("fire_rating", 0),
                    daily_goal=note_data.get("daily_goal", "")
                )
                db.add(note)
                stats["notes_imported"] += 1
            
            db.flush()
            
            # Add entries
            for entry_data in note_data.get("entries", []):
                entry = models.NoteEntry(
                    daily_note_id=note.id,
                    content=entry_data["content"],
                    content_type=entry_data.get("content_type", "rich_text"),
                    order_index=entry_data.get("order_index", 0),
                    include_in_report=1 if entry_data.get("include_in_report", False) else 0,
                    is_important=1 if entry_data.get("is_important", False) else 0,
                    is_completed=1 if entry_data.get("is_completed", False) else 0
                )
                db.add(entry)
                db.flush()
                
                # Add entry labels
                for old_label_id in entry_data.get("labels", []):
                    if old_label_id in label_id_mapping:
                        label = db.query(models.Label).filter(
                            models.Label.id == label_id_mapping[old_label_id]
                        ).first()
                        if label and label not in entry.labels:
                            entry.labels.append(label)
                
                stats["entries_imported"] += 1
            
            # Add note labels (support both old "tags" and new "labels" format)
            note_labels = note_data.get("labels", note_data.get("tags", []))
            for old_label_id in note_labels:
                if old_label_id in label_id_mapping:
                    label = db.query(models.Label).filter(
                        models.Label.id == label_id_mapping[old_label_id]
                    ).first()
                    if label and label not in note.labels:
                        note.labels.append(label)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Data imported successfully",
            "stats": stats
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

