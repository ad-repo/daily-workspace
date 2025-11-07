"""
API routes for application settings (sprint goals, quarterly goals, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/settings", tags=["settings"])


class AppSettingsResponse(BaseModel):
    id: int
    sprint_goals: str
    quarterly_goals: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class AppSettingsUpdate(BaseModel):
    sprint_goals: Optional[str] = None
    quarterly_goals: Optional[str] = None


@router.get("", response_model=AppSettingsResponse)
def get_app_settings(db: Session = Depends(get_db)):
    """Get application settings (sprint goals, quarterly goals)"""
    settings = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    
    if not settings:
        # Create default settings if they don't exist
        settings = models.AppSettings(
            id=1,
            sprint_goals="",
            quarterly_goals=""
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "id": settings.id,
        "sprint_goals": settings.sprint_goals,
        "quarterly_goals": settings.quarterly_goals,
        "created_at": settings.created_at.isoformat(),
        "updated_at": settings.updated_at.isoformat()
    }


@router.patch("", response_model=AppSettingsResponse)
def update_app_settings(
    settings_update: AppSettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update application settings"""
    settings = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    
    if not settings:
        # Create if doesn't exist
        settings = models.AppSettings(
            id=1,
            sprint_goals=settings_update.sprint_goals or "",
            quarterly_goals=settings_update.quarterly_goals or ""
        )
        db.add(settings)
    else:
        # Update existing
        if settings_update.sprint_goals is not None:
            settings.sprint_goals = settings_update.sprint_goals
        if settings_update.quarterly_goals is not None:
            settings.quarterly_goals = settings_update.quarterly_goals
    
    db.commit()
    db.refresh(settings)
    return {
        "id": settings.id,
        "sprint_goals": settings.sprint_goals,
        "quarterly_goals": settings.quarterly_goals,
        "created_at": settings.created_at.isoformat(),
        "updated_at": settings.updated_at.isoformat()
    }

