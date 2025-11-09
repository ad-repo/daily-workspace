from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter()


@router.get('/', response_model=list[schemas.Label])
def get_all_labels(db: Session = Depends(get_db)):
    """Get all labels"""
    labels = db.query(models.Label).order_by(models.Label.name).all()
    return labels


@router.post('/', response_model=schemas.Label, status_code=201)
def create_label(label: schemas.LabelCreate, db: Session = Depends(get_db)):
    """Create a new label"""
    # Validate label name is not empty
    if not label.name or not label.name.strip():
        raise HTTPException(status_code=400, detail='Label name cannot be empty')

    # Check if label already exists
    existing_label = db.query(models.Label).filter(models.Label.name == label.name).first()
    if existing_label:
        raise HTTPException(status_code=400, detail='Label already exists')

    db_label = models.Label(**label.model_dump())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label


@router.delete('/{label_id}', status_code=204)
def delete_label(label_id: int, db: Session = Depends(get_db)):
    """Delete a label"""
    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail='Label not found')

    db.delete(label)
    db.commit()
    return None


@router.post('/note/{date}/label/{label_id}', status_code=204)
def add_label_to_note(date: str, label_id: int, db: Session = Depends(get_db)):
    """Add a label to a note"""
    note = db.query(models.DailyNote).filter(models.DailyNote.date == date).first()
    if not note:
        raise HTTPException(status_code=404, detail='Note not found')

    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail='Label not found')

    if label not in note.labels:
        note.labels.append(label)
        db.commit()

    return None


@router.delete('/note/{date}/label/{label_id}', status_code=204)
def remove_label_from_note(date: str, label_id: int, db: Session = Depends(get_db)):
    """Remove a label from a note"""
    note = db.query(models.DailyNote).filter(models.DailyNote.date == date).first()
    if not note:
        raise HTTPException(status_code=404, detail='Note not found')

    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail='Label not found')

    if label in note.labels:
        note.labels.remove(label)
        db.commit()

    return None


@router.post('/entry/{entry_id}/label/{label_id}', status_code=204)
def add_label_to_entry(entry_id: int, label_id: int, db: Session = Depends(get_db)):
    """Add a label to an entry"""
    entry = db.query(models.NoteEntry).filter(models.NoteEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail='Entry not found')

    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail='Label not found')

    if label not in entry.labels:
        entry.labels.append(label)
        db.commit()

    return None


@router.delete('/entry/{entry_id}/label/{label_id}', status_code=204)
def remove_label_from_entry(entry_id: int, label_id: int, db: Session = Depends(get_db)):
    """Remove a label from an entry"""
    entry = db.query(models.NoteEntry).filter(models.NoteEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail='Entry not found')

    label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail='Label not found')

    if label in entry.labels:
        entry.labels.remove(label)
        db.commit()

    return None


@router.get('/search', response_model=list[schemas.DailyNote])
def search_by_label(
    label: str | None = Query(None, description='Label name to search for'), db: Session = Depends(get_db)
):
    """Search notes and entries by label"""
    if not label:
        return []

    # Find the label
    label_obj = db.query(models.Label).filter(models.Label.name == label.lower()).first()
    if not label_obj:
        return []

    # Get all notes with this label
    notes_with_label = db.query(models.DailyNote).filter(models.DailyNote.labels.contains(label_obj)).all()

    # Get all entries with this label and their parent notes
    entries_with_label = db.query(models.NoteEntry).filter(models.NoteEntry.labels.contains(label_obj)).all()

    # Get unique notes from entries
    note_ids_from_entries = set(entry.daily_note_id for entry in entries_with_label)
    notes_from_entries = db.query(models.DailyNote).filter(models.DailyNote.id.in_(note_ids_from_entries)).all()

    # Combine and deduplicate
    all_notes = {note.id: note for note in notes_with_label}
    for note in notes_from_entries:
        all_notes[note.id] = note

    return sorted(all_notes.values(), key=lambda n: n.date, reverse=True)
