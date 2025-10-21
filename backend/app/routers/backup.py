from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
import json
import io
from datetime import datetime

router = APIRouter()

@router.get("/export")
async def export_data(db: Session = Depends(get_db)):
    """Export all data as JSON"""
    
    # Get all notes with entries and tags
    notes = db.query(models.DailyNote).all()
    tags = db.query(models.Tag).all()
    
    export_data = {
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "tags": [
            {
                "id": tag.id,
                "name": tag.name,
                "color": tag.color,
                "created_at": tag.created_at.isoformat()
            }
            for tag in tags
        ],
        "notes": [
            {
                "date": note.date,
                "fire_rating": note.fire_rating,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
                "tags": [tag.id for tag in note.tags],
                "entries": [
                    {
                        "content": entry.content,
                        "content_type": entry.content_type,
                        "order_index": entry.order_index,
                        "created_at": entry.created_at.isoformat(),
                        "updated_at": entry.updated_at.isoformat()
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
            "Content-Disposition": f"attachment; filename=daily-workspace-backup-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.json"
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
            "tags_imported": 0,
            "notes_imported": 0,
            "entries_imported": 0,
            "tags_skipped": 0,
            "notes_skipped": 0
        }
        
        # Import tags first
        tag_id_mapping = {}
        for tag_data in data.get("tags", []):
            existing_tag = db.query(models.Tag).filter(models.Tag.name == tag_data["name"]).first()
            if existing_tag:
                tag_id_mapping[tag_data["id"]] = existing_tag.id
                stats["tags_skipped"] += 1
            else:
                new_tag = models.Tag(
                    name=tag_data["name"],
                    color=tag_data.get("color", "#3b82f6")
                )
                db.add(new_tag)
                db.flush()
                tag_id_mapping[tag_data["id"]] = new_tag.id
                stats["tags_imported"] += 1
        
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
                    existing_note.tags.clear()
                    note = existing_note
                else:
                    stats["notes_skipped"] += 1
                    continue
            else:
                note = models.DailyNote(
                    date=note_data["date"],
                    fire_rating=note_data.get("fire_rating", 0)
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
                    order_index=entry_data.get("order_index", 0)
                )
                db.add(entry)
                stats["entries_imported"] += 1
            
            # Add tags
            for old_tag_id in note_data.get("tags", []):
                if old_tag_id in tag_id_mapping:
                    tag = db.query(models.Tag).filter(
                        models.Tag.id == tag_id_mapping[old_tag_id]
                    ).first()
                    if tag and tag not in note.tags:
                        note.tags.append(tag)
        
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

