"""
API routes for application settings (sprint goals, quarterly goals, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=schemas.AppSettingsResponse)
def get_app_settings(db: Session = Depends(get_db)):
    """Get application settings (sprint goals, quarterly goals, dates)"""
    settings = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    
    if not settings:
        # Create default settings if they don't exist
        settings = models.AppSettings(
            id=1,
            sprint_goals="",
            quarterly_goals="",
            sprint_start_date="",
            sprint_end_date="",
            quarterly_start_date="",
            quarterly_end_date=""
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "id": settings.id,
        "sprint_goals": settings.sprint_goals,
        "quarterly_goals": settings.quarterly_goals,
        "sprint_start_date": settings.sprint_start_date or "",
        "sprint_end_date": settings.sprint_end_date or "",
        "quarterly_start_date": settings.quarterly_start_date or "",
        "quarterly_end_date": settings.quarterly_end_date or "",
        "created_at": settings.created_at.isoformat(),
        "updated_at": settings.updated_at.isoformat()
    }


@router.patch("", response_model=schemas.AppSettingsResponse)
def update_app_settings(
    settings_update: schemas.AppSettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update application settings"""
    settings = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    
    if not settings:
        # Create if doesn't exist
        settings = models.AppSettings(
            id=1,
            sprint_goals=settings_update.sprint_goals or "",
            quarterly_goals=settings_update.quarterly_goals or "",
            sprint_start_date=settings_update.sprint_start_date or "",
            sprint_end_date=settings_update.sprint_end_date or "",
            quarterly_start_date=settings_update.quarterly_start_date or "",
            quarterly_end_date=settings_update.quarterly_end_date or ""
        )
        db.add(settings)
    else:
        # Update existing
        if settings_update.sprint_goals is not None:
            settings.sprint_goals = settings_update.sprint_goals
        if settings_update.quarterly_goals is not None:
            settings.quarterly_goals = settings_update.quarterly_goals
        if settings_update.sprint_start_date is not None:
            settings.sprint_start_date = settings_update.sprint_start_date
        if settings_update.sprint_end_date is not None:
            settings.sprint_end_date = settings_update.sprint_end_date
        if settings_update.quarterly_start_date is not None:
            settings.quarterly_start_date = settings_update.quarterly_start_date
        if settings_update.quarterly_end_date is not None:
            settings.quarterly_end_date = settings_update.quarterly_end_date
    
    db.commit()
    db.refresh(settings)
    return {
        "id": settings.id,
        "sprint_goals": settings.sprint_goals,
        "quarterly_goals": settings.quarterly_goals,
        "sprint_start_date": settings.sprint_start_date or "",
        "sprint_end_date": settings.sprint_end_date or "",
        "quarterly_start_date": settings.quarterly_start_date or "",
        "quarterly_end_date": settings.quarterly_end_date or "",
        "created_at": settings.created_at.isoformat(),
        "updated_at": settings.updated_at.isoformat()
    }

