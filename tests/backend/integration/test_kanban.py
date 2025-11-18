"""
Integration tests for Kanban API endpoints
"""

import random
import time

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def unique_name(prefix: str) -> str:
    """Generate unique name for tests"""
    return f'{prefix}_{int(time.time() * 1000)}_{random.randint(1000, 9999)}'


def test_initialize_kanban(client: TestClient, db_session: Session):
    """Test initializing Kanban board with default columns"""
    response = client.post('/api/lists/kanban/initialize')
    assert response.status_code == 200, f'Failed: {response.text}'
    data = response.json()
    assert data['message'] == 'Kanban board initialized successfully'
    assert len(data['columns']) == 3
    assert data['columns'][0]['name'] == 'To Do'
    assert data['columns'][1]['name'] == 'In Progress'
    assert data['columns'][2]['name'] == 'Done'


def test_initialize_kanban_twice_fails(client: TestClient, db_session: Session):
    """Test that initializing Kanban twice fails"""
    client.post('/api/lists/kanban/initialize')
    response = client.post('/api/lists/kanban/initialize')
    assert response.status_code == 400
    assert 'already initialized' in response.json()['detail']


def test_get_kanban_boards(client: TestClient, db_session: Session):
    """Test getting all Kanban board columns"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(board['is_kanban'] for board in data)
    assert data[0]['kanban_order'] == 0
    assert data[1]['kanban_order'] == 1
    assert data[2]['kanban_order'] == 2


def test_kanban_columns_not_in_regular_lists(client: TestClient, db_session: Session):
    """Test that Kanban columns don't appear in regular lists"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Create a regular list
    name = unique_name('Regular List')
    client.post('/api/lists', json={'name': name, 'description': 'Regular', 'color': '#3b82f6'})

    # Get regular lists
    response = client.get('/api/lists')
    assert response.status_code == 200
    data = response.json()

    # Should only have the regular list, not Kanban columns
    assert len(data) == 1
    assert data[0]['name'] == name
    assert not data[0].get('is_kanban', False)


def test_regular_lists_not_in_kanban(client: TestClient, db_session: Session):
    """Test that regular lists don't appear in Kanban boards"""
    # Create a regular list
    name = unique_name('Regular List')
    client.post('/api/lists', json={'name': name, 'description': 'Regular', 'color': '#3b82f6'})

    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    assert response.status_code == 200
    data = response.json()

    # Should only have Kanban columns, not regular list
    assert len(data) == 3
    assert all(board['name'] in ['To Do', 'In Progress', 'Done'] for board in data)


def test_create_custom_kanban_column(client: TestClient, db_session: Session):
    """Test creating a custom Kanban column"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Create custom column
    name = unique_name('Review')
    response = client.post(
        '/api/lists',
        json={
            'name': name,
            'description': 'Under review',
            'color': '#9333ea',
            'is_kanban': True,
            'kanban_order': 3,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == name
    assert data['is_kanban']
    assert data['kanban_order'] == 3

    # Verify it appears in Kanban boards
    response = client.get('/api/lists/kanban')
    assert response.status_code == 200
    boards = response.json()
    assert len(boards) == 4
    assert boards[3]['name'] == name


def test_reorder_kanban_columns(client: TestClient, db_session: Session):
    """Test reordering Kanban columns"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get current boards
    response = client.get('/api/lists/kanban')
    boards = response.json()

    # Reorder: swap first and last
    reorder_data = [
        {'id': boards[2]['id'], 'order_index': 0},  # Done -> first
        {'id': boards[1]['id'], 'order_index': 1},  # In Progress -> middle
        {'id': boards[0]['id'], 'order_index': 2},  # To Do -> last
    ]
    response = client.put('/api/lists/kanban/reorder', json={'lists': reorder_data})
    assert response.status_code == 200

    # Verify new order
    response = client.get('/api/lists/kanban')
    boards = response.json()
    assert boards[0]['name'] == 'Done'
    assert boards[1]['name'] == 'In Progress'
    assert boards[2]['name'] == 'To Do'


def test_reorder_non_kanban_list_fails(client: TestClient, db_session: Session):
    """Test that reordering a non-Kanban list fails"""
    # Create a regular list
    name = unique_name('Regular List')
    response = client.post('/api/lists', json={'name': name, 'description': 'Regular', 'color': '#3b82f6'})
    list_id = response.json()['id']

    # Try to reorder it as Kanban
    response = client.put('/api/lists/kanban/reorder', json={'lists': [{'id': list_id, 'order_index': 0}]})
    assert response.status_code == 400
    assert 'not a Kanban column' in response.json()['detail']


def test_add_entry_to_kanban_column(client: TestClient, db_session: Session):
    """Test adding an entry to a Kanban column"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    boards = response.json()
    todo_id = boards[0]['id']

    # Create a daily note
    date = f'2025-01-{random.randint(1, 28):02d}'
    client.post(f'/api/notes/{date}')

    # Create an entry
    entry_response = client.post(
        f'/api/entries/note/{date}',
        json={'content': 'Test task', 'content_type': 'rich_text'},
    )
    entry_id = entry_response.json()['id']

    # Add entry to Kanban column
    response = client.post(f'/api/lists/{todo_id}/entries/{entry_id}')
    assert response.status_code == 200

    # Verify entry is in column
    response = client.get(f'/api/lists/{todo_id}')
    assert response.status_code == 200
    data = response.json()
    assert len(data['entries']) == 1
    assert data['entries'][0]['id'] == entry_id


def test_move_entry_between_kanban_columns(client: TestClient, db_session: Session):
    """Test moving an entry from one Kanban column to another"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    boards = response.json()
    todo_id = boards[0]['id']
    in_progress_id = boards[1]['id']

    # Create a daily note
    date = f'2025-01-{random.randint(1, 28):02d}'
    client.post(f'/api/notes/{date}')

    # Create an entry
    entry_response = client.post(
        f'/api/entries/note/{date}',
        json={'content': 'Test task', 'content_type': 'rich_text'},
    )
    entry_id = entry_response.json()['id']

    # Add entry to To Do
    client.post(f'/api/lists/{todo_id}/entries/{entry_id}')

    # Move to In Progress
    client.post(f'/api/lists/{in_progress_id}/entries/{entry_id}')

    # Verify it's in In Progress
    response = client.get(f'/api/lists/{in_progress_id}')
    data = response.json()
    assert len(data['entries']) == 1
    assert data['entries'][0]['id'] == entry_id

    # Verify it's NO LONGER in To Do (Kanban exclusivity - entries can only be in one Kanban column)
    response = client.get(f'/api/lists/{todo_id}')
    data = response.json()
    assert len(data['entries']) == 0  # Should be removed from old column


def test_entry_only_in_one_kanban_column_at_a_time(client: TestClient, db_session: Session):
    """Test that an entry can only be in one Kanban column at a time"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    boards = response.json()
    todo_id = boards[0]['id']
    in_progress_id = boards[1]['id']
    done_id = boards[2]['id']

    # Create a daily note and entry
    date = f'2025-01-{random.randint(1, 28):02d}'
    client.post(f'/api/notes/{date}')
    entry_response = client.post(
        f'/api/entries/note/{date}',
        json={'content': 'Test task for exclusivity', 'content_type': 'rich_text'},
    )
    entry_id = entry_response.json()['id']

    # Add entry to To Do
    client.post(f'/api/lists/{todo_id}/entries/{entry_id}')
    response = client.get(f'/api/lists/{todo_id}')
    assert len(response.json()['entries']) == 1

    # Add same entry to In Progress - should remove from To Do
    client.post(f'/api/lists/{in_progress_id}/entries/{entry_id}')

    # Verify it's in In Progress
    response = client.get(f'/api/lists/{in_progress_id}')
    assert len(response.json()['entries']) == 1

    # Verify it's NOT in To Do anymore
    response = client.get(f'/api/lists/{todo_id}')
    assert len(response.json()['entries']) == 0

    # Add same entry to Done - should remove from In Progress
    client.post(f'/api/lists/{done_id}/entries/{entry_id}')

    # Verify it's in Done
    response = client.get(f'/api/lists/{done_id}')
    assert len(response.json()['entries']) == 1

    # Verify it's NOT in In Progress anymore
    response = client.get(f'/api/lists/{in_progress_id}')
    assert len(response.json()['entries']) == 0

    # Verify it's NOT in To Do
    response = client.get(f'/api/lists/{todo_id}')
    assert len(response.json()['entries']) == 0


def test_entry_can_be_in_multiple_regular_lists(client: TestClient, db_session: Session):
    """Test that an entry can be in multiple regular (non-Kanban) lists simultaneously"""
    # Create two regular lists
    list1_response = client.post('/api/lists', json={'name': unique_name('List A'), 'description': 'First list'})
    list1_id = list1_response.json()['id']

    list2_response = client.post('/api/lists', json={'name': unique_name('List B'), 'description': 'Second list'})
    list2_id = list2_response.json()['id']

    # Create a daily note and entry
    date = f'2025-01-{random.randint(1, 28):02d}'
    client.post(f'/api/notes/{date}')
    entry_response = client.post(
        f'/api/entries/note/{date}',
        json={'content': 'Test task for multiple lists', 'content_type': 'rich_text'},
    )
    entry_id = entry_response.json()['id']

    # Add entry to List A
    client.post(f'/api/lists/{list1_id}/entries/{entry_id}')
    response = client.get(f'/api/lists/{list1_id}')
    assert len(response.json()['entries']) == 1

    # Add same entry to List B - should remain in both
    client.post(f'/api/lists/{list2_id}/entries/{entry_id}')

    # Verify it's in List B
    response = client.get(f'/api/lists/{list2_id}')
    assert len(response.json()['entries']) == 1

    # Verify it's STILL in List A (regular lists allow multiple memberships)
    response = client.get(f'/api/lists/{list1_id}')
    assert len(response.json()['entries']) == 1


def test_entry_in_kanban_and_regular_lists_simultaneously(client: TestClient, db_session: Session):
    """Test that an entry can be in ONE Kanban column AND multiple regular lists at the same time"""
    # Initialize Kanban
    client.post('/api/lists/kanban/initialize')

    # Get Kanban boards
    response = client.get('/api/lists/kanban')
    boards = response.json()
    todo_id = boards[0]['id']
    in_progress_id = boards[1]['id']

    # Create two regular lists
    list1_response = client.post('/api/lists', json={'name': unique_name('List A'), 'description': 'First list'})
    list1_id = list1_response.json()['id']

    list2_response = client.post('/api/lists', json={'name': unique_name('List B'), 'description': 'Second list'})
    list2_id = list2_response.json()['id']

    # Create a daily note and entry
    date = f'2025-01-{random.randint(1, 28):02d}'
    client.post(f'/api/notes/{date}')
    entry_response = client.post(
        f'/api/entries/note/{date}',
        json={'content': 'Test task for mixed lists', 'content_type': 'rich_text'},
    )
    entry_id = entry_response.json()['id']

    # Add entry to Kanban To Do
    client.post(f'/api/lists/{todo_id}/entries/{entry_id}')

    # Add entry to regular List A
    client.post(f'/api/lists/{list1_id}/entries/{entry_id}')

    # Add entry to regular List B
    client.post(f'/api/lists/{list2_id}/entries/{entry_id}')

    # Verify it's in Kanban To Do
    response = client.get(f'/api/lists/{todo_id}')
    assert len(response.json()['entries']) == 1

    # Verify it's in both regular lists
    response = client.get(f'/api/lists/{list1_id}')
    assert len(response.json()['entries']) == 1
    response = client.get(f'/api/lists/{list2_id}')
    assert len(response.json()['entries']) == 1

    # Now move to Kanban In Progress - should remove from To Do but stay in regular lists
    client.post(f'/api/lists/{in_progress_id}/entries/{entry_id}')

    # Verify it's in Kanban In Progress
    response = client.get(f'/api/lists/{in_progress_id}')
    assert len(response.json()['entries']) == 1

    # Verify it's NOT in Kanban To Do anymore
    response = client.get(f'/api/lists/{todo_id}')
    assert len(response.json()['entries']) == 0

    # Verify it's STILL in both regular lists
    response = client.get(f'/api/lists/{list1_id}')
    assert len(response.json()['entries']) == 1
    response = client.get(f'/api/lists/{list2_id}')
    assert len(response.json()['entries']) == 1
