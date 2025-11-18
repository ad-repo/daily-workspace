"""Sample goals fixture data for testing."""

from datetime import datetime, timedelta


def get_sample_sprint_goals():
    """
    Returns sprint goals with various date ranges for testing.
    """
    today = datetime(2025, 11, 7)

    goals = [
        {
            'text': 'Past sprint - Q3 wrap-up',
            'start_date': (today - timedelta(days=30)).strftime('%Y-%m-%d'),
            'end_date': (today - timedelta(days=16)).strftime('%Y-%m-%d'),
        },
        {
            'text': 'Current sprint - Feature X implementation',
            'start_date': (today - timedelta(days=7)).strftime('%Y-%m-%d'),
            'end_date': (today + timedelta(days=7)).strftime('%Y-%m-%d'),
        },
        {
            'text': 'Future sprint - Product launch',
            'start_date': (today + timedelta(days=14)).strftime('%Y-%m-%d'),
            'end_date': (today + timedelta(days=28)).strftime('%Y-%m-%d'),
        },
    ]
    return goals


def get_sample_quarterly_goals():
    """
    Returns quarterly goals with various date ranges for testing.
    """
    datetime(2025, 11, 7)

    goals = [
        {
            'text': 'Q3 2025 - Platform stability',
            'start_date': '2025-07-01',
            'end_date': '2025-09-30',
        },
        {
            'text': 'Q4 2025 - Revenue growth',
            'start_date': '2025-10-01',
            'end_date': '2025-12-31',
        },
        {
            'text': 'Q1 2026 - Market expansion',
            'start_date': '2026-01-01',
            'end_date': '2026-03-31',
        },
    ]
    return goals


def get_overlapping_sprint_goal():
    """Returns a sprint goal that overlaps with existing goals for testing validation."""
    return {
        'text': 'Overlapping sprint',
        'start_date': '2025-11-05',
        'end_date': '2025-11-12',  # Overlaps with current sprint
    }


def get_invalid_date_range_goal():
    """Returns a goal with end_date before start_date for testing validation."""
    return {
        'text': 'Invalid goal',
        'start_date': '2025-11-15',
        'end_date': '2025-11-10',  # Invalid: end before start
    }
