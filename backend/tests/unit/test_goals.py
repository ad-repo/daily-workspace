"""
Unit tests for SprintGoal and QuarterlyGoal models
"""

import pytest
from sqlalchemy.orm import Session

from app.models import QuarterlyGoal, SprintGoal


@pytest.mark.unit
class TestSprintGoalModel:
    """Test SprintGoal model CRUD operations and behavior."""

    def test_create_sprint_goal(self, db_session: Session):
        """Test creating a sprint goal with all required fields."""
        goal = SprintGoal(text='Complete API testing', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        assert goal.id is not None
        assert goal.text == 'Complete API testing'
        assert goal.start_date == '2025-11-01'
        assert goal.end_date == '2025-11-14'
        assert goal.created_at is not None
        assert goal.updated_at is not None

    def test_sprint_goal_timestamps(self, db_session: Session):
        """Test created_at and updated_at timestamps."""
        goal = SprintGoal(text='Sprint goal', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        created_at = goal.created_at

        # Update the goal
        goal.text = 'Updated sprint goal'
        db_session.commit()

        # created_at should remain same, updated_at should change
        assert goal.created_at == created_at
        # Note: updated_at manual update is done in API, not model

    def test_update_sprint_goal_text(self, db_session: Session):
        """Test updating sprint goal text."""
        goal = SprintGoal(text='Original text', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        goal.text = 'Updated text'
        db_session.commit()

        assert goal.text == 'Updated text'

    def test_update_sprint_goal_dates(self, db_session: Session):
        """Test updating sprint goal dates."""
        goal = SprintGoal(text='Sprint goal', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        goal.start_date = '2025-11-05'
        goal.end_date = '2025-11-20'
        db_session.commit()

        assert goal.start_date == '2025-11-05'
        assert goal.end_date == '2025-11-20'

    def test_delete_sprint_goal(self, db_session: Session):
        """Test deleting a sprint goal."""
        goal = SprintGoal(text='To be deleted', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        goal_id = goal.id
        db_session.delete(goal)
        db_session.commit()

        deleted_goal = db_session.query(SprintGoal).filter(SprintGoal.id == goal_id).first()
        assert deleted_goal is None

    def test_query_sprint_goals_by_date_range(self, db_session: Session):
        """Test querying sprint goals within a date range."""
        # Create multiple sprint goals
        goals = [
            SprintGoal(text='Sprint 1', start_date='2025-10-01', end_date='2025-10-14'),
            SprintGoal(text='Sprint 2', start_date='2025-11-01', end_date='2025-11-14'),
            SprintGoal(text='Sprint 3', start_date='2025-12-01', end_date='2025-12-14'),
        ]
        for goal in goals:
            db_session.add(goal)
        db_session.commit()

        # Query goals that cover November 10
        date = '2025-11-10'
        active_goal = (
            db_session.query(SprintGoal).filter(SprintGoal.start_date <= date, SprintGoal.end_date >= date).first()
        )

        assert active_goal is not None
        assert active_goal.text == 'Sprint 2'

    def test_sprint_goal_ordering(self, db_session: Session):
        """Test querying sprint goals ordered by start_date."""
        goals = [
            SprintGoal(text='Sprint C', start_date='2025-12-01', end_date='2025-12-14'),
            SprintGoal(text='Sprint A', start_date='2025-10-01', end_date='2025-10-14'),
            SprintGoal(text='Sprint B', start_date='2025-11-01', end_date='2025-11-14'),
        ]
        for goal in goals:
            db_session.add(goal)
        db_session.commit()

        ordered_goals = db_session.query(SprintGoal).order_by(SprintGoal.start_date).all()

        assert len(ordered_goals) == 3
        assert ordered_goals[0].text == 'Sprint A'
        assert ordered_goals[1].text == 'Sprint B'
        assert ordered_goals[2].text == 'Sprint C'

    def test_sprint_goal_with_empty_text(self, db_session: Session):
        """Test creating sprint goal with empty text."""
        goal = SprintGoal(text='', start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        assert goal.text == ''
        assert goal.id is not None

    def test_sprint_goal_with_long_text(self, db_session: Session):
        """Test creating sprint goal with very long text."""
        long_text = 'A' * 1000
        goal = SprintGoal(text=long_text, start_date='2025-11-01', end_date='2025-11-14')
        db_session.add(goal)
        db_session.commit()

        assert goal.text == long_text
        assert len(goal.text) == 1000


@pytest.mark.unit
class TestQuarterlyGoalModel:
    """Test QuarterlyGoal model CRUD operations and behavior."""

    def test_create_quarterly_goal(self, db_session: Session):
        """Test creating a quarterly goal with all required fields."""
        goal = QuarterlyGoal(text='Q4 2025 Goals', start_date='2025-10-01', end_date='2025-12-31')
        db_session.add(goal)
        db_session.commit()

        assert goal.id is not None
        assert goal.text == 'Q4 2025 Goals'
        assert goal.start_date == '2025-10-01'
        assert goal.end_date == '2025-12-31'
        assert goal.created_at is not None
        assert goal.updated_at is not None

    def test_quarterly_goal_timestamps(self, db_session: Session):
        """Test created_at and updated_at timestamps."""
        goal = QuarterlyGoal(text='Quarterly goal', start_date='2025-10-01', end_date='2025-12-31')
        db_session.add(goal)
        db_session.commit()

        created_at = goal.created_at

        # Update the goal
        goal.text = 'Updated quarterly goal'
        db_session.commit()

        # created_at should remain same
        assert goal.created_at == created_at

    def test_update_quarterly_goal_text(self, db_session: Session):
        """Test updating quarterly goal text."""
        goal = QuarterlyGoal(text='Original text', start_date='2025-10-01', end_date='2025-12-31')
        db_session.add(goal)
        db_session.commit()

        goal.text = 'Updated text'
        db_session.commit()

        assert goal.text == 'Updated text'

    def test_update_quarterly_goal_dates(self, db_session: Session):
        """Test updating quarterly goal dates."""
        goal = QuarterlyGoal(text='Quarterly goal', start_date='2025-10-01', end_date='2025-12-31')
        db_session.add(goal)
        db_session.commit()

        goal.start_date = '2025-11-01'
        goal.end_date = '2026-01-31'
        db_session.commit()

        assert goal.start_date == '2025-11-01'
        assert goal.end_date == '2026-01-31'

    def test_delete_quarterly_goal(self, db_session: Session):
        """Test deleting a quarterly goal."""
        goal = QuarterlyGoal(text='To be deleted', start_date='2025-10-01', end_date='2025-12-31')
        db_session.add(goal)
        db_session.commit()

        goal_id = goal.id
        db_session.delete(goal)
        db_session.commit()

        deleted_goal = db_session.query(QuarterlyGoal).filter(QuarterlyGoal.id == goal_id).first()
        assert deleted_goal is None

    def test_query_quarterly_goals_by_date_range(self, db_session: Session):
        """Test querying quarterly goals within a date range."""
        # Create multiple quarterly goals
        goals = [
            QuarterlyGoal(text='Q1 2025', start_date='2025-01-01', end_date='2025-03-31'),
            QuarterlyGoal(text='Q2 2025', start_date='2025-04-01', end_date='2025-06-30'),
            QuarterlyGoal(text='Q3 2025', start_date='2025-07-01', end_date='2025-09-30'),
            QuarterlyGoal(text='Q4 2025', start_date='2025-10-01', end_date='2025-12-31'),
        ]
        for goal in goals:
            db_session.add(goal)
        db_session.commit()

        # Query goals that cover November 10
        date = '2025-11-10'
        active_goal = (
            db_session.query(QuarterlyGoal)
            .filter(QuarterlyGoal.start_date <= date, QuarterlyGoal.end_date >= date)
            .first()
        )

        assert active_goal is not None
        assert active_goal.text == 'Q4 2025'

    def test_quarterly_goal_ordering(self, db_session: Session):
        """Test querying quarterly goals ordered by start_date."""
        goals = [
            QuarterlyGoal(text='Q4', start_date='2025-10-01', end_date='2025-12-31'),
            QuarterlyGoal(text='Q2', start_date='2025-04-01', end_date='2025-06-30'),
            QuarterlyGoal(text='Q3', start_date='2025-07-01', end_date='2025-09-30'),
            QuarterlyGoal(text='Q1', start_date='2025-01-01', end_date='2025-03-31'),
        ]
        for goal in goals:
            db_session.add(goal)
        db_session.commit()

        ordered_goals = db_session.query(QuarterlyGoal).order_by(QuarterlyGoal.start_date).all()

        assert len(ordered_goals) == 4
        assert ordered_goals[0].text == 'Q1'
        assert ordered_goals[1].text == 'Q2'
        assert ordered_goals[2].text == 'Q3'
        assert ordered_goals[3].text == 'Q4'

    def test_multiple_quarterly_goals(self, db_session: Session):
        """Test creating and querying multiple quarterly goals."""
        goals = [
            QuarterlyGoal(text='Goal 1', start_date='2025-01-01', end_date='2025-03-31'),
            QuarterlyGoal(text='Goal 2', start_date='2025-04-01', end_date='2025-06-30'),
            QuarterlyGoal(text='Goal 3', start_date='2025-07-01', end_date='2025-09-30'),
        ]
        for goal in goals:
            db_session.add(goal)
        db_session.commit()

        all_goals = db_session.query(QuarterlyGoal).all()
        assert len(all_goals) == 3

    def test_quarterly_goal_unique_id(self, db_session: Session):
        """Test that each quarterly goal gets a unique ID."""
        goal1 = QuarterlyGoal(text='Goal 1', start_date='2025-01-01', end_date='2025-03-31')
        goal2 = QuarterlyGoal(text='Goal 2', start_date='2025-04-01', end_date='2025-06-30')

        db_session.add(goal1)
        db_session.add(goal2)
        db_session.commit()

        assert goal1.id != goal2.id


@pytest.mark.unit
class TestGoalModelComparison:
    """Test similarities and differences between Sprint and Quarterly goals."""

    def test_sprint_and_quarterly_independent(self, db_session: Session):
        """Test that sprint and quarterly goals are stored independently."""
        sprint = SprintGoal(text='Sprint', start_date='2025-11-01', end_date='2025-11-14')
        quarterly = QuarterlyGoal(text='Quarterly', start_date='2025-10-01', end_date='2025-12-31')

        db_session.add(sprint)
        db_session.add(quarterly)
        db_session.commit()

        sprint_count = db_session.query(SprintGoal).count()
        quarterly_count = db_session.query(QuarterlyGoal).count()

        assert sprint_count == 1
        assert quarterly_count == 1

    def test_overlapping_sprint_and_quarterly(self, db_session: Session):
        """Test that sprint and quarterly goals can overlap (they're independent)."""
        # A sprint that falls within a quarterly goal is allowed
        quarterly = QuarterlyGoal(text='Q4 Goals', start_date='2025-10-01', end_date='2025-12-31')
        sprint = SprintGoal(text='Sprint in Q4', start_date='2025-11-01', end_date='2025-11-14')

        db_session.add(quarterly)
        db_session.add(sprint)
        db_session.commit()

        # Both should exist
        assert quarterly.id is not None
        assert sprint.id is not None

        # Query both for same date
        date = '2025-11-10'
        active_sprint = (
            db_session.query(SprintGoal).filter(SprintGoal.start_date <= date, SprintGoal.end_date >= date).first()
        )
        active_quarterly = (
            db_session.query(QuarterlyGoal)
            .filter(QuarterlyGoal.start_date <= date, QuarterlyGoal.end_date >= date)
            .first()
        )

        assert active_sprint is not None
        assert active_quarterly is not None
