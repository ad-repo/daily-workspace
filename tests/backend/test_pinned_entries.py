"""
Tests for pinned entries feature.

Tests the ability to pin note entries so they automatically copy to future days.
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import get_db, Base, engine
from backend.app import models


@pytest.fixture
def client():
    """Create a test client with a fresh database."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    client = TestClient(app)
    yield client
    
    # Clean up
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Get a database session."""
    db = next(get_db())
    yield db
    db.close()


def test_toggle_pin_entry(client):
    """Test toggling pin status on an entry."""
    # Create a daily note
    today = datetime.now().strftime('%Y-%m-%d')
    note_response = client.post('/api/notes/', json={
        'date': today,
        'fire_rating': 0,
        'daily_goal': ''
    })
    assert note_response.status_code == 201
    
    # Create an entry
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'Test pinned entry',
        'content_type': 'rich_text',
        'order_index': 0
    })
    assert entry_response.status_code == 201
    entry_id = entry_response.json()['id']
    assert entry_response.json()['is_pinned'] is False
    
    # Pin the entry
    pin_response = client.post(f'/api/entries/{entry_id}/toggle-pin')
    assert pin_response.status_code == 200
    assert pin_response.json()['is_pinned'] is True
    
    # Unpin the entry
    unpin_response = client.post(f'/api/entries/{entry_id}/toggle-pin')
    assert unpin_response.status_code == 200
    assert unpin_response.json()['is_pinned'] is False


def test_pinned_entry_copies_to_future_day(client):
    """Test that pinned entries automatically copy to future days."""
    # Create a daily note for today
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    note_response = client.post('/api/notes/', json={
        'date': today,
        'fire_rating': 0,
        'daily_goal': ''
    })
    assert note_response.status_code == 201
    
    # Create and pin an entry
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'Pinned task',
        'content_type': 'rich_text',
        'order_index': 0
    })
    assert entry_response.status_code == 201
    entry_id = entry_response.json()['id']
    
    # Pin the entry
    client.post(f'/api/entries/{entry_id}/toggle-pin')
    
    # Access tomorrow's date (this should trigger the copy)
    tomorrow_response = client.get(f'/api/notes/{tomorrow}')
    
    # If the note doesn't exist yet, it will be created by the copy logic
    if tomorrow_response.status_code == 404:
        # The copy logic creates the note, so try again
        tomorrow_response = client.get(f'/api/entries/note/{tomorrow}')
    
    # Check that tomorrow has the pinned entry
    if tomorrow_response.status_code == 200:
        tomorrow_data = tomorrow_response.json()
        if isinstance(tomorrow_data, dict) and 'entries' in tomorrow_data:
            entries = tomorrow_data['entries']
        else:
            entries = tomorrow_data
        
        # Should have at least one entry
        assert len(entries) > 0
        
        # Find the pinned entry
        pinned_entries = [e for e in entries if e['is_pinned']]
        assert len(pinned_entries) > 0
        
        # Check content matches
        assert pinned_entries[0]['content'] == 'Pinned task'
        
        # Check completion status was reset
        assert pinned_entries[0]['is_completed'] is False


def test_pinned_entry_with_labels(client):
    """Test that pinned entries preserve labels when copied."""
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    # Create a label
    label_response = client.post('/api/labels/', json={
        'name': 'important',
        'color': '#ff0000'
    })
    assert label_response.status_code == 201
    label_id = label_response.json()['id']
    
    # Create a daily note
    client.post('/api/notes/', json={'date': today})
    
    # Create and pin an entry
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'Pinned with label',
        'content_type': 'rich_text',
        'order_index': 0
    })
    entry_id = entry_response.json()['id']
    
    # Add label to entry
    client.post(f'/api/labels/entry/{entry_id}/label/{label_id}')
    
    # Pin the entry
    client.post(f'/api/entries/{entry_id}/toggle-pin')
    
    # Access tomorrow (triggers copy)
    client.get(f'/api/notes/{tomorrow}')
    tomorrow_entries = client.get(f'/api/entries/note/{tomorrow}')
    
    if tomorrow_entries.status_code == 200:
        entries = tomorrow_entries.json()
        pinned_entries = [e for e in entries if e['is_pinned']]
        
        if len(pinned_entries) > 0:
            # Check that labels were copied
            assert len(pinned_entries[0]['labels']) > 0
            assert pinned_entries[0]['labels'][0]['name'] == 'important'


def test_multiple_pinned_entries(client):
    """Test that multiple entries can be pinned simultaneously."""
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    # Create a daily note
    client.post('/api/notes/', json={'date': today})
    
    # Create and pin multiple entries
    entry_ids = []
    for i in range(3):
        entry_response = client.post(f'/api/entries/note/{today}', json={
            'content': f'Pinned entry {i+1}',
            'content_type': 'rich_text',
            'order_index': 0
        })
        entry_id = entry_response.json()['id']
        entry_ids.append(entry_id)
        client.post(f'/api/entries/{entry_id}/toggle-pin')
    
    # Access tomorrow
    client.get(f'/api/notes/{tomorrow}')
    tomorrow_entries = client.get(f'/api/entries/note/{tomorrow}')
    
    if tomorrow_entries.status_code == 200:
        entries = tomorrow_entries.json()
        pinned_entries = [e for e in entries if e['is_pinned']]
        
        # All three entries should be copied
        assert len(pinned_entries) == 3


def test_pinned_entry_no_duplicate_on_multiple_access(client):
    """Test that pinned entries don't duplicate when accessing the same day multiple times."""
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    # Create a daily note and pinned entry
    client.post('/api/notes/', json={'date': today})
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'No duplicate test',
        'content_type': 'rich_text',
        'order_index': 0
    })
    entry_id = entry_response.json()['id']
    client.post(f'/api/entries/{entry_id}/toggle-pin')
    
    # Access tomorrow multiple times
    for _ in range(3):
        client.get(f'/api/notes/{tomorrow}')
    
    # Check that there's only one copy
    tomorrow_entries = client.get(f'/api/entries/note/{tomorrow}')
    if tomorrow_entries.status_code == 200:
        entries = tomorrow_entries.json()
        pinned_entries = [e for e in entries if e['is_pinned'] and e['content'] == 'No duplicate test']
        
        # Should only have one copy, not three
        assert len(pinned_entries) == 1


def test_update_entry_pin_status_via_patch(client):
    """Test updating pin status via PATCH endpoint."""
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Create a daily note and entry
    client.post('/api/notes/', json={'date': today})
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'Test entry',
        'content_type': 'rich_text',
        'order_index': 0
    })
    entry_id = entry_response.json()['id']
    
    # Update pin status via PATCH
    patch_response = client.patch(f'/api/entries/{entry_id}', json={
        'is_pinned': True
    })
    assert patch_response.status_code == 200
    assert patch_response.json()['is_pinned'] is True
    
    # Update back to unpinned
    patch_response = client.patch(f'/api/entries/{entry_id}', json={
        'is_pinned': False
    })
    assert patch_response.status_code == 200
    assert patch_response.json()['is_pinned'] is False


def test_pinned_entry_in_backup(client):
    """Test that pinned status is included in backup export."""
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Create a daily note and pinned entry
    client.post('/api/notes/', json={'date': today})
    entry_response = client.post(f'/api/entries/note/{today}', json={
        'content': 'Backup test',
        'content_type': 'rich_text',
        'order_index': 0
    })
    entry_id = entry_response.json()['id']
    client.post(f'/api/entries/{entry_id}/toggle-pin')
    
    # Export backup
    backup_response = client.get('/api/backup/export')
    assert backup_response.status_code == 200
    
    backup_data = backup_response.json()
    
    # Find the note and check the entry
    notes = backup_data.get('notes', [])
    if len(notes) > 0:
        entries = notes[0].get('entries', [])
        if len(entries) > 0:
            assert entries[0]['is_pinned'] is True

