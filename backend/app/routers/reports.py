from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas

router = APIRouter()

def get_week_bounds(date: datetime):
    """Get the Wednesday-to-Wednesday bounds for a given date"""
    # Find the Wednesday before or on this date
    days_since_wednesday = (date.weekday() - 2) % 7
    week_start = date - timedelta(days=days_since_wednesday)
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Week ends next Wednesday (7 days later)
    week_end = week_start + timedelta(days=7)
    
    return week_start, week_end

@router.get("/generate")
def generate_report(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (defaults to today)"),
    db: Session = Depends(get_db)
):
    """Generate a weekly report from Wednesday to Wednesday"""
    
    # Parse date or use today
    if date:
        try:
            report_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            report_date = datetime.now()
    else:
        report_date = datetime.now()
    
    # Get week bounds
    week_start, week_end = get_week_bounds(report_date)
    
    # Format dates for database query (YYYY-MM-DD)
    start_date_str = week_start.strftime("%Y-%m-%d")
    end_date_str = week_end.strftime("%Y-%m-%d")
    
    # Query all notes in the week range
    notes = db.query(models.DailyNote).filter(
        models.DailyNote.date >= start_date_str,
        models.DailyNote.date < end_date_str
    ).order_by(models.DailyNote.date).all()
    
    # Filter entries marked for report
    report_data = {
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": (week_end - timedelta(days=1)).strftime("%Y-%m-%d"),
        "generated_at": datetime.now().isoformat(),
        "entries": []
    }
    
    for note in notes:
        for entry in note.entries:
            if entry.include_in_report:
                report_data["entries"].append({
                    "date": note.date,
                    "entry_id": entry.id,
                    "content": entry.content,
                    "content_type": entry.content_type,
                    "labels": [{"name": label.name, "color": label.color} for label in entry.labels],
                    "created_at": entry.created_at.isoformat(),
                    "is_completed": bool(entry.is_completed)
                })
    
    return report_data

@router.get("/all-entries")
def generate_all_entries_report(db: Session = Depends(get_db)):
    """Generate a report of ALL entries (no date or filter restrictions)"""
    
    # Get all notes, ordered by date
    notes = db.query(models.DailyNote).order_by(models.DailyNote.date.asc()).all()
    
    report_data = {
        "generated_at": datetime.now().isoformat(),
        "entries": []
    }
    
    for note in notes:
        for entry in note.entries:
            # Include ALL entries (no filter)
            report_data["entries"].append({
                "date": note.date,
                "entry_id": entry.id,
                "content": entry.content,
                "content_type": entry.content_type,
                "labels": [{"name": label.name, "color": label.color} for label in entry.labels],
                "created_at": entry.created_at.isoformat(),
                "is_completed": bool(entry.is_completed),
                "is_important": bool(entry.is_important)
            })
    
    return report_data

@router.get("/weeks")
def get_available_weeks(db: Session = Depends(get_db)):
    """Get list of weeks that have report entries"""
    
    # Get all entries marked for reports
    entries_with_reports = db.query(models.NoteEntry).filter(
        models.NoteEntry.include_in_report == 1
    ).all()
    
    if not entries_with_reports:
        return {"weeks": []}
    
    # Get unique weeks
    weeks = set()
    for entry in entries_with_reports:
        note = entry.daily_note
        note_date = datetime.strptime(note.date, "%Y-%m-%d")
        week_start, week_end = get_week_bounds(note_date)
        weeks.add((week_start.strftime("%Y-%m-%d"), (week_end - timedelta(days=1)).strftime("%Y-%m-%d")))
    
    # Sort and format
    sorted_weeks = sorted(list(weeks), reverse=True)
    return {
        "weeks": [
            {
                "start": start,
                "end": end,
                "label": f"{start} to {end}"
            }
            for start, end in sorted_weeks
        ]
    }

