"""Sample app settings fixture data for testing."""


def get_sample_app_settings():
    """Returns sample app_settings data with all fields populated."""
    return {
        'sprint_goals': 'Legacy sprint goals from app_settings',
        'quarterly_goals': 'Legacy quarterly goals from app_settings',
        'sprint_start_date': '2025-11-01',
        'sprint_end_date': '2025-11-14',
        'quarterly_start_date': '2025-10-01',
        'quarterly_end_date': '2025-12-31',
    }


def get_empty_app_settings():
    """Returns empty app_settings for testing fresh installations."""
    return {
        'sprint_goals': '',
        'quarterly_goals': '',
        'sprint_start_date': '',
        'sprint_end_date': '',
        'quarterly_start_date': '',
        'quarterly_end_date': '',
    }
