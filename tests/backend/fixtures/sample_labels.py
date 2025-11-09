"""Sample labels fixture data for testing."""


def get_sample_labels_data():
    """
    Returns 10 sample labels (text and emoji).
    """
    labels = [
        {'name': 'urgent', 'color': '#ef4444'},
        {'name': 'bug', 'color': '#dc2626'},
        {'name': 'feature', 'color': '#3b82f6'},
        {'name': 'documentation', 'color': '#10b981'},
        {'name': 'testing', 'color': '#8b5cf6'},
        {'name': '🔥', 'color': '#f59e0b'},
        {'name': '⭐', 'color': '#fbbf24'},
        {'name': '✅', 'color': '#22c55e'},
        {'name': '🚀', 'color': '#6366f1'},
        {'name': '💀', 'color': '#6b7280'},
    ]
    return labels


def get_label_by_name(name: str):
    """Get a specific label by name."""
    labels = get_sample_labels_data()
    return next((label for label in labels if label['name'] == name), None)
