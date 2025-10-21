from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from datetime import datetime

router = APIRouter()

@router.get("/note/{date}", response_model=List[schemas.NoteEntry])
def get_entries_for_date(date: str, db: Session = Depends(get_db)):
    """Get all entries for a specific date"""
    note = db.query(models.DailyNote).filter(models.DailyNote.date == date).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found for this date")
    
    # Order by created_at descending (newest first)
    entries = db.query(models.NoteEntry).filter(
        models.NoteEntry.daily_note_id == note.id
    ).order_by(models.NoteEntry.created_at.desc()).all()
    
    return entries

@router.post("/note/{date}", response_model=schemas.NoteEntry, status_code=201)
def create_entry(date: str, entry: schemas.NoteEntryCreate, db: Session = Depends(get_db)):
    """Create a new entry for a specific date"""
    # Get or create daily note for this date
    note = db.query(models.DailyNote).filter(models.DailyNote.date == date).first()
    if not note:
        note = models.DailyNote(date=date)
        db.add(note)
        db.commit()
        db.refresh(note)
    
    db_entry = models.NoteEntry(**entry.model_dump(), daily_note_id=note.id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.put("/{entry_id}", response_model=schemas.NoteEntry)
@router.patch("/{entry_id}", response_model=schemas.NoteEntry)
def update_entry(entry_id: int, entry_update: schemas.NoteEntryUpdate, db: Session = Depends(get_db)):
    """Update a specific entry"""
    db_entry = db.query(models.NoteEntry).filter(models.NoteEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    update_data = entry_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # Handle boolean to integer conversion for SQLite
        if key in ['include_in_report', 'is_important', 'is_completed']:
            setattr(db_entry, key, 1 if value else 0)
        else:
            setattr(db_entry, key, value)
    
    db_entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a specific entry"""
    db_entry = db.query(models.NoteEntry).filter(models.NoteEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(db_entry)
    db.commit()
    return None

@router.get("/{entry_id}", response_model=schemas.NoteEntry)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific entry by ID"""
    entry = db.query(models.NoteEntry).filter(models.NoteEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.post("/merge", response_model=schemas.NoteEntry, status_code=201)
def merge_entries(merge_request: schemas.MergeEntriesRequest, db: Session = Depends(get_db)):
    """Merge multiple entries into a single entry"""
    if len(merge_request.entry_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 entries are required to merge")
    
    # Fetch all entries to merge
    entries = db.query(models.NoteEntry).filter(
        models.NoteEntry.id.in_(merge_request.entry_ids)
    ).order_by(models.NoteEntry.created_at.asc()).all()
    
    if len(entries) != len(merge_request.entry_ids):
        raise HTTPException(status_code=404, detail="One or more entries not found")
    
    # Verify all entries belong to the same day
    daily_note_ids = set(entry.daily_note_id for entry in entries)
    if len(daily_note_ids) > 1:
        raise HTTPException(status_code=400, detail="Cannot merge entries from different days")
    
    # Collect all unique labels from all entries
    all_labels = set()
    for entry in entries:
        all_labels.update(entry.labels)
    
    # Determine content type (use first entry's type, or 'rich_text' if mixed)
    content_types = set(entry.content_type for entry in entries)
    if len(content_types) == 1:
        merged_content_type = entries[0].content_type
    else:
        merged_content_type = "rich_text"  # Default to rich text if mixed types
    
    # Merge content (oldest to newest)
    merged_content = merge_request.separator.join(entry.content for entry in entries)
    
    # Determine merged metadata (OR logic for booleans)
    is_important = any(entry.is_important for entry in entries)
    is_completed = all(entry.is_completed for entry in entries)  # All must be completed
    include_in_report = any(entry.include_in_report for entry in entries)
    
    # Create the merged entry
    merged_entry = models.NoteEntry(
        daily_note_id=entries[0].daily_note_id,
        content=merged_content,
        content_type=merged_content_type,
        order_index=entries[0].order_index,
        include_in_report=1 if include_in_report else 0,
        is_important=1 if is_important else 0,
        is_completed=1 if is_completed else 0,
        created_at=entries[0].created_at  # Use earliest created_at
    )
    
    db.add(merged_entry)
    db.flush()
    
    # Add all unique labels to merged entry
    for label in all_labels:
        if label not in merged_entry.labels:
            merged_entry.labels.append(label)
    
    # Delete original entries if requested
    if merge_request.delete_originals:
        for entry in entries:
            db.delete(entry)
    
    db.commit()
    db.refresh(merged_entry)
    
    return merged_entry

