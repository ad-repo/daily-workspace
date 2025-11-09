from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter()


class SearchHistoryItem(BaseModel):
    query: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get('/', response_model=list[SearchHistoryItem])
def get_search_history(db: Session = Depends(get_db)):
    """Get all search history, ordered by most recent, with no duplicates"""

    # Get unique queries with their most recent timestamp
    # Subquery to get the max created_at for each query
    subquery = (
        db.query(models.SearchHistory.query, func.max(models.SearchHistory.created_at).label('max_created_at'))
        .group_by(models.SearchHistory.query)
        .subquery()
    )

    # Get full records for those unique queries
    history = (
        db.query(models.SearchHistory)
        .join(
            subquery,
            (models.SearchHistory.query == subquery.c.query)
            & (models.SearchHistory.created_at == subquery.c.max_created_at),
        )
        .order_by(models.SearchHistory.created_at.desc())
        .all()
    )

    return history


@router.post('/', status_code=201)
def add_search_history(query: str, db: Session = Depends(get_db)):
    """Add a search query to history"""

    if not query.strip():
        return {'message': 'Empty query not saved'}

    # Add new search to history
    history_entry = models.SearchHistory(query=query.strip())
    db.add(history_entry)
    db.commit()

    return {'message': 'Search saved to history'}


@router.delete('/', status_code=204)
def clear_search_history(db: Session = Depends(get_db)):
    """Clear all search history"""

    db.query(models.SearchHistory).delete()
    db.commit()

    return None
