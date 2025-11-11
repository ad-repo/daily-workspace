"""
Integration tests for Lists API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app import models
from datetime import datetime


client = TestClient(app)


def test_create_list(db: Session):
    """Test creating a new list"""
    response = client.post(
        '/api/lists',
        json={
            'name': 'Test List',
            'description': 'A test list',
            'color': '#ff0000',
            'order_index': 0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'Test List'
    assert data['description'] == 'A test list'
    assert data['color'] == '#ff0000'
    assert 'id' in data


def test_create_duplicate_list(db: Session):
    """Test that creating a list with duplicate name fails"""
    client.post(
        '/api/lists',
        json={'name': 'Duplicate List', 'description': '', 'color': '#3b82f6'},
    )
    response = client.post(
        '/api/lists',
        json={'name': 'Duplicate List', 'description': '', 'color': '#3b82f6'},
    )
    assert response.status_code == 400
    assert 'already exists' in response.json()['detail']


def test_get_all_lists(db: Session):
    """Test getting all lists"""
    client.post('/api/lists', json={'name': 'List 1', 'color': '#ff0000'})
    client.post('/api/lists', json={'name': 'List 2', 'color': '#00ff00'})
    
    response = client.get('/api/lists')
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(lst['name'] == 'List 1' for lst in data)


def test_get_list_by_id(db: Session):
    """Test getting a single list with entries"""
    # Create list
    create_response = client.post(
        '/api/lists',
        json={'name': 'Single List', 'color': '#0000ff'},
    )
    list_id = create_response.json()['id']
    
    # Get list
    response = client.get(f'/api/lists/{list_id}')
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'Single List'
    assert 'entries' in data
    assert isinstance(data['entries'], list)


def test_get_nonexistent_list(db: Session):
    """Test getting a list that doesn't exist"""
    response = client.get('/api/lists/99999')
    assert response.status_code == 404


def test_update_list(db: Session):
    """Test updating a list"""
    create_response = client.post(
        '/api/lists',
        json={'name': 'Original Name', 'color': '#ff0000'},
    )
    list_id = create_response.json()['id']
    
    response = client.put(
        f'/api/lists/{list_id}',
        json={'name': 'Updated Name', 'description': 'New description'},
    )
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'Updated Name'
    assert data['description'] == 'New description'


def test_update_list_duplicate_name(db: Session):
    """Test that updating a list to duplicate name fails"""
    client.post('/api/lists', json={'name': 'List A', 'color': '#ff0000'})
    create_response = client.post('/api/lists', json={'name': 'List B', 'color': '#00ff00'})
    list_b_id = create_response.json()['id']
    
    response = client.put(f'/api/lists/{list_b_id}', json={'name': 'List A'})
    assert response.status_code == 400
    assert 'already exists' in response.json()['detail']


def test_delete_list(db: Session):
    """Test deleting a list"""
    create_response = client.post(
        '/api/lists',
        json={'name': 'List to Delete', 'color': '#ff0000'},
    )
    list_id = create_response.json()['id']
    
    response = client.delete(f'/api/lists/{list_id}')
    assert response.status_code == 200
    
    # Verify list is deleted
    get_response = client.get(f'/api/lists/{list_id}')
    assert get_response.status_code == 404


def test_add_entry_to_list(db: Session):
    """Test adding an entry to a list"""
    # Create a daily note and entry
    note_response = client.post('/api/notes/', json={'date': '2025-01-01'})
    note_id = note_response.json()['id']
    
    entry_response = client.post(
        f'/api/entries/note/{note_id}',
        json={'content': 'Test entry', 'content_type': 'rich_text', 'order_index': 0},
    )
    entry_id = entry_response.json()['id']
    
    # Create a list
    list_response = client.post('/api/lists', json={'name': 'My List', 'color': '#ff0000'})
    list_id = list_response.json()['id']
    
    # Add entry to list
    response = client.post(f'/api/lists/{list_id}/entries/{entry_id}')
    assert response.status_code == 200
    
    # Verify entry is in list
    list_get_response = client.get(f'/api/lists/{list_id}')
    entries = list_get_response.json()['entries']
    assert len(entries) == 1
    assert entries[0]['id'] == entry_id


def test_remove_entry_from_list(db: Session):
    """Test removing an entry from a list"""
    # Setup: create note, entry, list, and add entry to list
    note_response = client.post('/api/notes/', json={'date': '2025-01-02'})
    note_id = note_response.json()['id']
    
    entry_response = client.post(
        f'/api/entries/note/{note_id}',
        json={'content': 'Test entry', 'content_type': 'rich_text', 'order_index': 0},
    )
    entry_id = entry_response.json()['id']
    
    list_response = client.post('/api/lists', json={'name': 'Remove List', 'color': '#ff0000'})
    list_id = list_response.json()['id']
    
    client.post(f'/api/lists/{list_id}/entries/{entry_id}')
    
    # Remove entry from list
    response = client.delete(f'/api/lists/{list_id}/entries/{entry_id}')
    assert response.status_code == 200
    
    # Verify entry is removed
    list_get_response = client.get(f'/api/lists/{list_id}')
    entries = list_get_response.json()['entries']
    assert len(entries) == 0


def test_entry_in_multiple_lists(db: Session):
    """Test that an entry can belong to multiple lists"""
    # Setup
    note_response = client.post('/api/notes/', json={'date': '2025-01-03'})
    note_id = note_response.json()['id']
    
    entry_response = client.post(
        f'/api/entries/note/{note_id}',
        json={'content': 'Multi-list entry', 'content_type': 'rich_text', 'order_index': 0},
    )
    entry_id = entry_response.json()['id']
    
    list1_response = client.post('/api/lists', json={'name': 'List 1', 'color': '#ff0000'})
    list1_id = list1_response.json()['id']
    
    list2_response = client.post('/api/lists', json={'name': 'List 2', 'color': '#00ff00'})
    list2_id = list2_response.json()['id']
    
    # Add entry to both lists
    client.post(f'/api/lists/{list1_id}/entries/{entry_id}')
    client.post(f'/api/lists/{list2_id}/entries/{entry_id}')
    
    # Verify entry is in both lists
    list1_data = client.get(f'/api/lists/{list1_id}').json()
    list2_data = client.get(f'/api/lists/{list2_id}').json()
    
    assert len(list1_data['entries']) == 1
    assert len(list2_data['entries']) == 1
    assert list1_data['entries'][0]['id'] == entry_id
    assert list2_data['entries'][0]['id'] == entry_id


def test_delete_list_preserves_entries(db: Session):
    """Test that deleting a list doesn't delete the entries"""
    # Setup
    note_response = client.post('/api/notes/', json={'date': '2025-01-04'})
    note_id = note_response.json()['id']
    
    entry_response = client.post(
        f'/api/entries/note/{note_id}',
        json={'content': 'Preserved entry', 'content_type': 'rich_text', 'order_index': 0},
    )
    entry_id = entry_response.json()['id']
    
    list_response = client.post('/api/lists', json={'name': 'Temp List', 'color': '#ff0000'})
    list_id = list_response.json()['id']
    
    client.post(f'/api/lists/{list_id}/entries/{entry_id}')
    
    # Delete list
    client.delete(f'/api/lists/{list_id}')
    
    # Verify entry still exists
    entry_get_response = client.get(f'/api/entries/{entry_id}')
    assert entry_get_response.status_code == 200


def test_archive_list(db: Session):
    """Test archiving a list"""
    list_response = client.post('/api/lists', json={'name': 'Archive Me', 'color': '#ff0000'})
    list_id = list_response.json()['id']
    
    # Archive list
    response = client.put(f'/api/lists/{list_id}', json={'is_archived': True})
    assert response.status_code == 200
    assert response.json()['is_archived'] is True
    
    # Verify archived list is not in default list (without include_archived)
    all_lists = client.get('/api/lists').json()
    assert not any(lst['id'] == list_id for lst in all_lists)
    
    # Verify archived list appears when include_archived=true
    all_lists_with_archived = client.get('/api/lists?include_archived=true').json()
    assert any(lst['id'] == list_id for lst in all_lists_with_archived)

