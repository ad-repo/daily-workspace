"""
Integration tests for Kanban board functionality.
Tests the Kanban-specific endpoints and behavior.
"""
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_initialize_kanban_creates_default_columns(client: TestClient, db_session: Session):
    """Test that initializing Kanban creates To Do, In Progress, Done columns."""
    response = client.post('/api/lists/kanban/initialize')
    assert response.status_code == 200
    
    data = response.json()
    assert 'message' in data
    assert 'columns' in data
    assert len(data['columns']) == 3
    
    # Verify column names
    column_names = [col['name'] for col in data['columns']]
    assert 'To Do' in column_names
    assert 'In Progress' in column_names
    assert 'Done' in column_names
    
    # Verify they have kanban_order
    for col in data['columns']:
        assert 'kanban_order' in col


def test_initialize_kanban_fails_if_already_initialized(client: TestClient, db_session: Session):
    """Test that initializing Kanban twice fails."""
    # First initialization
    response1 = client.post('/api/lists/kanban/initialize')
    assert response1.status_code == 200
    
    # Second initialization should fail
    response2 = client.post('/api/lists/kanban/initialize')
    assert response2.status_code == 400
    assert 'already initialized' in response2.json()['detail'].lower()


def test_get_kanban_boards_returns_only_kanban_lists(client: TestClient, db_session: Session):
    """Test that GET /api/lists/kanban returns only Kanban columns."""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')
    
    # Create a regular list
    timestamp = datetime.now().isoformat()
    regular_list_data = {'name': f'Regular List {timestamp}', 'color': '#ff0000', 'is_kanban': False}
    client.post('/api/lists', json=regular_list_data)
    
    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    assert response.status_code == 200
    
    boards = response.json()
    assert len(boards) == 3  # Only the 3 Kanban columns
    
    # Verify all are Kanban lists
    for board in boards:
        assert board['is_kanban'] is True


def test_regular_lists_endpoint_excludes_kanban_columns(client: TestClient, db_session: Session):
    """Test that GET /api/lists excludes Kanban columns."""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')
    
    # Create a regular list
    timestamp = datetime.now().isoformat()
    regular_list_data = {'name': f'Regular List {timestamp}', 'color': '#ff0000', 'is_kanban': False}
    client.post('/api/lists', json=regular_list_data)
    
    # Get regular lists
    response = client.get('/api/lists')
    assert response.status_code == 200
    
    lists = response.json()
    assert len(lists) == 1  # Only the regular list
    
    # Verify none are Kanban lists
    for lst in lists:
        assert lst['is_kanban'] is False


def test_create_kanban_column_manually(client: TestClient, db_session: Session):
    """Test creating a custom Kanban column."""
    timestamp = datetime.now().isoformat()
    kanban_column_data = {
        'name': f'Review {timestamp}',
        'description': 'Under review',
        'color': '#9333ea',
        'is_kanban': True,
        'kanban_order': 0,
    }
    
    response = client.post('/api/lists', json=kanban_column_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data['is_kanban'] is True
    assert data['kanban_order'] == 0
    assert data['name'] == f'Review {timestamp}'


def test_add_entry_to_kanban_column(client: TestClient, db_session: Session):
    """Test adding an entry to a Kanban column."""
    # Initialize Kanban
    init_response = client.post('/api/lists/kanban/initialize')
    columns = init_response.json()['columns']
    todo_column_id = columns[0]['id']
    
    # Create a daily note and entry
    date = datetime.now().strftime('%Y-%m-%d')
    note_response = client.post('/api/notes/', json={'date': date})
    assert note_response.status_code == 201
    
    entry_data = {'content': 'Test task', 'content_type': 'rich_text', 'order_index': 0}
    entry_response = client.post(f'/api/entries/note/{date}', json=entry_data)
    assert entry_response.status_code == 201
    entry_id = entry_response.json()['id']
    
    # Add entry to Kanban column
    add_response = client.post(f'/api/lists/{todo_column_id}/entries/{entry_id}')
    assert add_response.status_code == 200
    
    # Verify entry is in column
    column_response = client.get(f'/api/lists/{todo_column_id}')
    assert column_response.status_code == 200
    column_data = column_response.json()
    assert len(column_data['entries']) == 1
    assert column_data['entries'][0]['id'] == entry_id


def test_move_entry_between_kanban_columns(client: TestClient, db_session: Session):
    """Test moving an entry from one Kanban column to another."""
    # Initialize Kanban
    init_response = client.post('/api/lists/kanban/initialize')
    columns = init_response.json()['columns']
    todo_column_id = columns[0]['id']
    in_progress_column_id = columns[1]['id']
    
    # Create a daily note and entry
    date = datetime.now().strftime('%Y-%m-%d')
    note_response = client.post('/api/notes/', json={'date': date})
    assert note_response.status_code == 201
    
    entry_data = {'content': 'Test task', 'content_type': 'rich_text', 'order_index': 0}
    entry_response = client.post(f'/api/entries/note/{date}', json=entry_data)
    assert entry_response.status_code == 201
    entry_id = entry_response.json()['id']
    
    # Add entry to To Do column
    client.post(f'/api/lists/{todo_column_id}/entries/{entry_id}')
    
    # Move to In Progress column
    client.post(f'/api/lists/{in_progress_column_id}/entries/{entry_id}')
    
    # Verify entry is in both columns (entries can be in multiple lists)
    todo_response = client.get(f'/api/lists/{todo_column_id}')
    in_progress_response = client.get(f'/api/lists/{in_progress_column_id}')
    
    assert len(todo_response.json()['entries']) == 1
    assert len(in_progress_response.json()['entries']) == 1


def test_reorder_kanban_columns(client: TestClient, db_session: Session):
    """Test reordering Kanban columns."""
    # Initialize Kanban
    init_response = client.post('/api/lists/kanban/initialize')
    columns = init_response.json()['columns']
    
    # Reverse the order
    reorder_data = {
        'lists': [
            {'id': columns[2]['id'], 'order_index': 0},
            {'id': columns[1]['id'], 'order_index': 1},
            {'id': columns[0]['id'], 'order_index': 2},
        ]
    }
    
    response = client.put('/api/lists/kanban/reorder', json=reorder_data)
    assert response.status_code == 200
    
    # Verify new order
    boards_response = client.get('/api/lists/kanban')
    boards = boards_response.json()
    
    # Should be sorted by kanban_order
    assert boards[0]['name'] == 'Done'
    assert boards[1]['name'] == 'In Progress'
    assert boards[2]['name'] == 'To Do'


def test_delete_kanban_column_preserves_entries(client: TestClient, db_session: Session):
    """Test that deleting a Kanban column doesn't delete entries."""
    # Initialize Kanban
    init_response = client.post('/api/lists/kanban/initialize')
    columns = init_response.json()['columns']
    todo_column_id = columns[0]['id']
    
    # Create a daily note and entry
    date = datetime.now().strftime('%Y-%m-%d')
    note_response = client.post('/api/notes/', json={'date': date})
    assert note_response.status_code == 201
    
    entry_data = {'content': 'Test task', 'content_type': 'rich_text', 'order_index': 0}
    entry_response = client.post(f'/api/entries/note/{date}', json=entry_data)
    assert entry_response.status_code == 201
    entry_id = entry_response.json()['id']
    
    # Add entry to column
    client.post(f'/api/lists/{todo_column_id}/entries/{entry_id}')
    
    # Delete column
    delete_response = client.delete(f'/api/lists/{todo_column_id}')
    assert delete_response.status_code == 200
    
    # Verify entry still exists
    entry_get_response = client.get(f'/api/entries/{entry_id}')
    assert entry_get_response.status_code == 200


def test_kanban_columns_ordered_by_kanban_order(client: TestClient, db_session: Session):
    """Test that Kanban columns are returned in kanban_order."""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')
    
    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    boards = response.json()
    
    # Verify order
    assert boards[0]['kanban_order'] == 0
    assert boards[1]['kanban_order'] == 1
    assert boards[2]['kanban_order'] == 2
    
    # Verify they're sorted
    for i in range(len(boards) - 1):
        assert boards[i]['kanban_order'] <= boards[i + 1]['kanban_order']

