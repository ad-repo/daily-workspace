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

