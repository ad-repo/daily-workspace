"""
API routes for sprint and quarterly goals with date-based queries
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix='/api/goals', tags=['goals'])


def calculate_days_remaining(end_date_str: str, from_date_str: str) -> int:
    """Calculate days remaining from a specific date to the end date."""
    try:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        from_date = datetime.strptime(from_date_str, '%Y-%m-%d').date()
        delta = (end_date - from_date).days
        return delta
    except Exception:
        return 0


def validate_date_range(start_date: str, end_date: str) -> bool:
    """Validate that end_date is after start_date."""
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        return end > start
    except Exception:
        return False


def check_overlap(db: Session, model_class, start_date: str, end_date: str, exclude_id: int | None = None) -> bool:
    """Check if a goal would overlap with existing goals."""
    query = db.query(model_class).filter(model_class.start_date <= end_date, model_class.end_date >= start_date)
    if exclude_id:
        query = query.filter(model_class.id != exclude_id)

    return query.count() > 0


# Sprint Goal Endpoints


@router.get('/sprint', response_model=list[schemas.GoalResponse])
def get_all_sprint_goals(db: Session = Depends(get_db)):
    """Get all sprint goals."""
    goals = db.query(models.SprintGoal).order_by(models.SprintGoal.start_date).all()
    return [
        {
            'id': goal.id,
            'text': goal.text,
            'start_date': goal.start_date,
            'end_date': goal.end_date,
            'created_at': goal.created_at,
            'updated_at': goal.updated_at,
            'days_remaining': None,  # Not applicable for batch fetch
        }
        for goal in goals
    ]


@router.get('/sprint/{date}', response_model=schemas.GoalResponse)
def get_sprint_for_date(date: str, db: Session = Depends(get_db)):
    """Get the sprint goal for a specific date (active or upcoming)."""
    # First try to find active goal (date is within range)
    goal = (
        db.query(models.SprintGoal)
        .filter(models.SprintGoal.start_date <= date, models.SprintGoal.end_date >= date)
        .first()
    )

    # If no active goal, find the next upcoming goal
    if not goal:
        goal = (
            db.query(models.SprintGoal)
            .filter(models.SprintGoal.start_date > date)
            .order_by(models.SprintGoal.start_date)
            .first()
        )

    if not goal:
        raise HTTPException(status_code=404, detail='No sprint goal found for this date')

    # Calculate days remaining from the given date
    days_remaining = calculate_days_remaining(goal.end_date, date)

    return {
        'id': goal.id,
        'text': goal.text,
        'start_date': goal.start_date,
        'end_date': goal.end_date,
        'created_at': goal.created_at,
        'updated_at': goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.post('/sprint', response_model=schemas.GoalResponse, status_code=201)
def create_sprint_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    """Create a new sprint goal."""
    # Validate date range
    if not validate_date_range(goal.start_date, goal.end_date):
        raise HTTPException(status_code=400, detail='end_date must be after start_date')

    # Check for overlaps
    if check_overlap(db, models.SprintGoal, goal.start_date, goal.end_date):
        raise HTTPException(
            status_code=400,
            detail=f'A sprint goal already exists that overlaps with {goal.start_date} to {goal.end_date}',
        )

    db_goal = models.SprintGoal(text=goal.text, start_date=goal.start_date, end_date=goal.end_date)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    # Calculate days remaining from start date
    days_remaining = calculate_days_remaining(db_goal.end_date, db_goal.start_date)

    return {
        'id': db_goal.id,
        'text': db_goal.text,
        'start_date': db_goal.start_date,
        'end_date': db_goal.end_date,
        'created_at': db_goal.created_at,
        'updated_at': db_goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.put('/sprint/{goal_id}', response_model=schemas.GoalResponse)
def update_sprint_goal(goal_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    """Update a sprint goal (end dates always editable for error correction)."""
    db_goal = db.query(models.SprintGoal).filter(models.SprintGoal.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail='Sprint goal not found')

    # Update fields
    if goal_update.text is not None:
        db_goal.text = goal_update.text

    # If dates are being updated, validate them
    new_start = goal_update.start_date if goal_update.start_date is not None else db_goal.start_date
    new_end = goal_update.end_date if goal_update.end_date is not None else db_goal.end_date

    if not validate_date_range(new_start, new_end):
        raise HTTPException(status_code=400, detail='end_date must be after start_date')

    # Check for overlaps (excluding this goal)
    if check_overlap(db, models.SprintGoal, new_start, new_end, exclude_id=goal_id):
        raise HTTPException(
            status_code=400, detail=f'A sprint goal already exists that overlaps with {new_start} to {new_end}'
        )

    if goal_update.start_date is not None:
        db_goal.start_date = goal_update.start_date
    if goal_update.end_date is not None:
        db_goal.end_date = goal_update.end_date

    db_goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_goal)

    # Calculate days remaining from today
    today = datetime.now().date().strftime('%Y-%m-%d')
    days_remaining = calculate_days_remaining(db_goal.end_date, today)

    return {
        'id': db_goal.id,
        'text': db_goal.text,
        'start_date': db_goal.start_date,
        'end_date': db_goal.end_date,
        'created_at': db_goal.created_at,
        'updated_at': db_goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.delete('/sprint/{goal_id}')
def delete_sprint_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a sprint goal."""
    db_goal = db.query(models.SprintGoal).filter(models.SprintGoal.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail='Sprint goal not found')

    db.delete(db_goal)
    db.commit()

    return {'message': 'Sprint goal deleted successfully'}


# Quarterly Goal Endpoints


@router.get('/quarterly', response_model=list[schemas.GoalResponse])
def get_all_quarterly_goals(db: Session = Depends(get_db)):
    """Get all quarterly goals."""
    goals = db.query(models.QuarterlyGoal).order_by(models.QuarterlyGoal.start_date).all()
    return [
        {
            'id': goal.id,
            'text': goal.text,
            'start_date': goal.start_date,
            'end_date': goal.end_date,
            'created_at': goal.created_at,
            'updated_at': goal.updated_at,
            'days_remaining': None,  # Not applicable for batch fetch
        }
        for goal in goals
    ]


@router.get('/quarterly/{date}', response_model=schemas.GoalResponse)
def get_quarterly_for_date(date: str, db: Session = Depends(get_db)):
    """Get the quarterly goal for a specific date (active or upcoming)."""
    # First try to find active goal (date is within range)
    goal = (
        db.query(models.QuarterlyGoal)
        .filter(models.QuarterlyGoal.start_date <= date, models.QuarterlyGoal.end_date >= date)
        .first()
    )

    # If no active goal, find the next upcoming goal
    if not goal:
        goal = (
            db.query(models.QuarterlyGoal)
            .filter(models.QuarterlyGoal.start_date > date)
            .order_by(models.QuarterlyGoal.start_date)
            .first()
        )

    if not goal:
        raise HTTPException(status_code=404, detail='No quarterly goal found for this date')

    # Calculate days remaining from the given date
    days_remaining = calculate_days_remaining(goal.end_date, date)

    return {
        'id': goal.id,
        'text': goal.text,
        'start_date': goal.start_date,
        'end_date': goal.end_date,
        'created_at': goal.created_at,
        'updated_at': goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.post('/quarterly', response_model=schemas.GoalResponse, status_code=201)
def create_quarterly_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    """Create a new quarterly goal."""
    # Validate date range
    if not validate_date_range(goal.start_date, goal.end_date):
        raise HTTPException(status_code=400, detail='end_date must be after start_date')

    # Check for overlaps
    if check_overlap(db, models.QuarterlyGoal, goal.start_date, goal.end_date):
        raise HTTPException(
            status_code=400,
            detail=f'A quarterly goal already exists that overlaps with {goal.start_date} to {goal.end_date}',
        )

    db_goal = models.QuarterlyGoal(text=goal.text, start_date=goal.start_date, end_date=goal.end_date)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    # Calculate days remaining from start date
    days_remaining = calculate_days_remaining(db_goal.end_date, db_goal.start_date)

    return {
        'id': db_goal.id,
        'text': db_goal.text,
        'start_date': db_goal.start_date,
        'end_date': db_goal.end_date,
        'created_at': db_goal.created_at,
        'updated_at': db_goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.put('/quarterly/{goal_id}', response_model=schemas.GoalResponse)
def update_quarterly_goal(goal_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    """Update a quarterly goal (end dates always editable for error correction)."""
    db_goal = db.query(models.QuarterlyGoal).filter(models.QuarterlyGoal.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail='Quarterly goal not found')

    # Update fields
    if goal_update.text is not None:
        db_goal.text = goal_update.text

    # If dates are being updated, validate them
    new_start = goal_update.start_date if goal_update.start_date is not None else db_goal.start_date
    new_end = goal_update.end_date if goal_update.end_date is not None else db_goal.end_date

    if not validate_date_range(new_start, new_end):
        raise HTTPException(status_code=400, detail='end_date must be after start_date')

    # Check for overlaps (excluding this goal)
    if check_overlap(db, models.QuarterlyGoal, new_start, new_end, exclude_id=goal_id):
        raise HTTPException(
            status_code=400, detail=f'A quarterly goal already exists that overlaps with {new_start} to {new_end}'
        )

    if goal_update.start_date is not None:
        db_goal.start_date = goal_update.start_date
    if goal_update.end_date is not None:
        db_goal.end_date = goal_update.end_date

    db_goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_goal)

    # Calculate days remaining from today
    today = datetime.now().date().strftime('%Y-%m-%d')
    days_remaining = calculate_days_remaining(db_goal.end_date, today)

    return {
        'id': db_goal.id,
        'text': db_goal.text,
        'start_date': db_goal.start_date,
        'end_date': db_goal.end_date,
        'created_at': db_goal.created_at,
        'updated_at': db_goal.updated_at,
        'days_remaining': days_remaining,
    }


@router.delete('/quarterly/{goal_id}')
def delete_quarterly_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a quarterly goal."""
    db_goal = db.query(models.QuarterlyGoal).filter(models.QuarterlyGoal.id == goal_id).first()

    if not db_goal:
        raise HTTPException(status_code=404, detail='Quarterly goal not found')

    db.delete(db_goal)
    db.commit()

    return {'message': 'Quarterly goal deleted successfully'}
