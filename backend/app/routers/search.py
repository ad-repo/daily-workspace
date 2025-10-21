from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.SearchResult])
def search_entries(
    q: Optional[str] = Query(None, description="Search query for content"),
    label_ids: Optional[str] = Query(None, description="Comma-separated label IDs to filter by"),
    db: Session = Depends(get_db)
):
    """
    Global search across all entries.
    Can search by text content and/or filter by labels.
    """
    # Start with base query that loads relationships
    query = db.query(models.NoteEntry).options(
        joinedload(models.NoteEntry.labels),
        joinedload(models.NoteEntry.daily_note)
    )
    
    # Filter by text content if provided
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(models.NoteEntry.content.ilike(search_term))
    
    # Filter by labels if provided
    if label_ids and label_ids.strip():
        try:
            label_id_list = [int(lid.strip()) for lid in label_ids.split(',') if lid.strip()]
            if label_id_list:
                # Join with entry_labels table to filter by labels
                query = query.join(models.NoteEntry.labels).filter(
                    models.Label.id.in_(label_id_list)
                ).distinct()
        except ValueError:
            pass  # Invalid label IDs, ignore
    
    # Order by most recent first
    query = query.order_by(models.NoteEntry.created_at.desc())
    
    # Limit results to prevent overwhelming response
    results = query.limit(100).all()
    
    # Build search results with date from daily_note
    search_results = []
    for entry in results:
        result_dict = {
            "id": entry.id,
            "daily_note_id": entry.daily_note_id,
            "content": entry.content,
            "content_type": entry.content_type,
            "order_index": entry.order_index,
            "created_at": entry.created_at,
            "updated_at": entry.updated_at,
            "labels": entry.labels,
            "include_in_report": bool(entry.include_in_report),
            "is_important": bool(entry.is_important),
            "is_completed": bool(entry.is_completed),
            "is_dev_null": bool(entry.is_dev_null),
            "date": entry.daily_note.date if entry.daily_note else "Unknown"
        }
        search_results.append(result_dict)
    
    return search_results

