"""
Integration tests for Search API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import DailyNote, Label, NoteEntry


@pytest.mark.integration
class TestSearchAPI:
    """Test /api/search/ endpoint."""

    def test_search_empty_database(self, client: TestClient):
        """Test GET /api/search/ with no data returns empty list."""
        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_search_no_parameters_returns_all(self, client: TestClient, db_session: Session):
        """Test search with no parameters returns all entries (up to limit)."""
        # Create multiple entries
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Entry 1</p>'),
            NoteEntry(daily_note_id=note.id, content='<p>Entry 2</p>'),
            NoteEntry(daily_note_id=note.id, content='<p>Entry 3</p>'),
        ]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_search_by_text_content(self, client: TestClient, db_session: Session):
        """Test searching by text content."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Python programming</p>'),
            NoteEntry(daily_note_id=note.id, content='<p>JavaScript development</p>'),
            NoteEntry(daily_note_id=note.id, content='<p>Python testing</p>'),
        ]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/?q=Python')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        # Verify both Python entries are returned
        contents = [e['content'] for e in data]
        assert '<p>Python programming</p>' in contents
        assert '<p>Python testing</p>' in contents

    def test_search_case_insensitive(self, client: TestClient, db_session: Session):
        """Test that search is case-insensitive."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Important WORK item</p>')
        db_session.add(entry)
        db_session.commit()

        # Search with lowercase should find uppercase content
        response = client.get('/api/search/?q=work')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert 'WORK' in data[0]['content']

    def test_search_by_single_label(self, client: TestClient, db_session: Session):
        """Test filtering by single label ID."""
        note = DailyNote(date='2025-11-07')
        label1 = Label(name='work', color='#3b82f6')
        label2 = Label(name='personal', color='#10b981')
        db_session.add_all([note, label1, label2])
        db_session.commit()

        # Create entries with different labels
        entry1 = NoteEntry(daily_note_id=note.id, content='<p>Work entry</p>')
        entry1.labels.append(label1)
        entry2 = NoteEntry(daily_note_id=note.id, content='<p>Personal entry</p>')
        entry2.labels.append(label2)
        entry3 = NoteEntry(daily_note_id=note.id, content='<p>No labels</p>')
        db_session.add_all([entry1, entry2, entry3])
        db_session.commit()

        response = client.get(f'/api/search/?label_ids={label1.id}')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]['content'] == '<p>Work entry</p>'

    def test_search_by_multiple_labels(self, client: TestClient, db_session: Session):
        """Test filtering by multiple label IDs (comma-separated)."""
        note = DailyNote(date='2025-11-07')
        label1 = Label(name='work', color='#3b82f6')
        label2 = Label(name='urgent', color='#ef4444')
        label3 = Label(name='personal', color='#10b981')
        db_session.add_all([note, label1, label2, label3])
        db_session.commit()

        # Create entries
        entry1 = NoteEntry(daily_note_id=note.id, content='<p>Work entry</p>')
        entry1.labels.append(label1)
        entry2 = NoteEntry(daily_note_id=note.id, content='<p>Urgent entry</p>')
        entry2.labels.append(label2)
        entry3 = NoteEntry(daily_note_id=note.id, content='<p>Personal entry</p>')
        entry3.labels.append(label3)
        db_session.add_all([entry1, entry2, entry3])
        db_session.commit()

        # Search for work OR urgent
        response = client.get(f'/api/search/?label_ids={label1.id},{label2.id}')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        contents = [e['content'] for e in data]
        assert '<p>Work entry</p>' in contents
        assert '<p>Urgent entry</p>' in contents

    def test_search_by_is_important(self, client: TestClient, db_session: Session):
        """Test filtering by is_important flag."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Important 1</p>', is_important=1),
            NoteEntry(daily_note_id=note.id, content='<p>Not important</p>', is_important=0),
            NoteEntry(daily_note_id=note.id, content='<p>Important 2</p>', is_important=1),
        ]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/?is_important=true')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(e['is_important'] for e in data)

    def test_search_by_is_completed(self, client: TestClient, db_session: Session):
        """Test filtering by is_completed flag."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Completed 1</p>', is_completed=1),
            NoteEntry(daily_note_id=note.id, content='<p>Not completed</p>', is_completed=0),
            NoteEntry(daily_note_id=note.id, content='<p>Completed 2</p>', is_completed=1),
        ]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/?is_completed=true')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(e['is_completed'] for e in data)

    def test_search_combined_filters(self, client: TestClient, db_session: Session):
        """Test combining multiple filters (text + label + flags)."""
        note = DailyNote(date='2025-11-07')
        label = Label(name='work', color='#3b82f6')
        db_session.add_all([note, label])
        db_session.commit()

        # Create various entries
        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Python work task</p>', is_important=1),
            NoteEntry(daily_note_id=note.id, content='<p>JavaScript work</p>', is_important=0),
            NoteEntry(daily_note_id=note.id, content='<p>Python personal</p>', is_important=1),
        ]
        entries[0].labels.append(label)
        entries[1].labels.append(label)
        db_session.add_all(entries)
        db_session.commit()

        # Search for: Python + work label + important
        response = client.get(f'/api/search/?q=Python&label_ids={label.id}&is_important=true')

        assert response.status_code == 200
        data = response.json()
        # Should only match first entry (Python + work + important)
        assert len(data) == 1
        assert 'Python work task' in data[0]['content']

    def test_search_ordered_by_recent_first(self, client: TestClient, db_session: Session):
        """Test that search results are ordered by most recent first."""
        import time

        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        # Create entries with delays to ensure different created_at
        entry1 = NoteEntry(daily_note_id=note.id, content='<p>First</p>')
        db_session.add(entry1)
        db_session.commit()
        time.sleep(0.01)

        entry2 = NoteEntry(daily_note_id=note.id, content='<p>Second</p>')
        db_session.add(entry2)
        db_session.commit()
        time.sleep(0.01)

        entry3 = NoteEntry(daily_note_id=note.id, content='<p>Third</p>')
        db_session.add(entry3)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Most recent should be first
        assert 'Third' in data[0]['content']
        assert 'Second' in data[1]['content']
        assert 'First' in data[2]['content']

    def test_search_includes_date_from_daily_note(self, client: TestClient, db_session: Session):
        """Test that search results include date from daily_note."""
        note = DailyNote(date='2025-11-15')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Test entry</p>')
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]['date'] == '2025-11-15'

    def test_search_includes_labels_in_results(self, client: TestClient, db_session: Session):
        """Test that search results include label information."""
        note = DailyNote(date='2025-11-07')
        label1 = Label(name='work', color='#3b82f6')
        label2 = Label(name='urgent', color='#ef4444')
        db_session.add_all([note, label1, label2])
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Entry with labels</p>')
        entry.labels.extend([label1, label2])
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert 'labels' in data[0]
        assert len(data[0]['labels']) == 2

    def test_search_includes_all_flags(self, client: TestClient, db_session: Session):
        """Test that search results include all flag fields."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(
            daily_note_id=note.id,
            content='<p>Test</p>',
            is_important=1,
            is_completed=1,
            include_in_report=1,
        )
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        result = data[0]
        assert result['is_important'] is True
        assert result['is_completed'] is True
        assert result['include_in_report'] is True

    def test_search_empty_query_string(self, client: TestClient, db_session: Session):
        """Test search with empty string returns all entries."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Test</p>')
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/?q=')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_whitespace_only_query(self, client: TestClient, db_session: Session):
        """Test search with whitespace-only query returns all entries."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Test</p>')
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/?q=   ')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_invalid_label_ids_ignored(self, client: TestClient, db_session: Session):
        """Test that invalid label IDs are gracefully ignored."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Test</p>')
        db_session.add(entry)
        db_session.commit()

        # Send invalid label IDs
        response = client.get('/api/search/?label_ids=invalid,not-a-number')

        # Should not crash, just return results without label filtering
        assert response.status_code == 200

    def test_search_no_results_matching_criteria(self, client: TestClient, db_session: Session):
        """Test search with criteria that matches nothing returns empty list."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Python code</p>')
        db_session.add(entry)
        db_session.commit()

        response = client.get('/api/search/?q=JavaScript')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_search_limit_100_results(self, client: TestClient, db_session: Session):
        """Test that search limits results to 100 entries."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        # Create 150 entries
        entries = [NoteEntry(daily_note_id=note.id, content=f'<p>Entry {i}</p>') for i in range(150)]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/')

        assert response.status_code == 200
        data = response.json()
        # Should be limited to 100
        assert len(data) == 100

    def test_search_partial_text_match(self, client: TestClient, db_session: Session):
        """Test that search matches partial text (substring)."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entry = NoteEntry(daily_note_id=note.id, content='<p>Comprehensive testing</p>')
        db_session.add(entry)
        db_session.commit()

        # Search for partial word
        response = client.get('/api/search/?q=comprehen')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert 'Comprehensive' in data[0]['content']

    def test_search_false_flags(self, client: TestClient, db_session: Session):
        """Test filtering by false flag values (not important, not completed)."""
        note = DailyNote(date='2025-11-07')
        db_session.add(note)
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note.id, content='<p>Important</p>', is_important=1),
            NoteEntry(daily_note_id=note.id, content='<p>Not important</p>', is_important=0),
        ]
        db_session.add_all(entries)
        db_session.commit()

        # Search for NOT important
        response = client.get('/api/search/?is_important=false')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]['is_important'] is False

    def test_search_across_multiple_dates(self, client: TestClient, db_session: Session):
        """Test that search works across entries from different dates."""
        note1 = DailyNote(date='2025-11-01')
        note2 = DailyNote(date='2025-11-15')
        note3 = DailyNote(date='2025-11-30')
        db_session.add_all([note1, note2, note3])
        db_session.commit()

        entries = [
            NoteEntry(daily_note_id=note1.id, content='<p>Python in Nov 1</p>'),
            NoteEntry(daily_note_id=note2.id, content='<p>Python in Nov 15</p>'),
            NoteEntry(daily_note_id=note3.id, content='<p>Python in Nov 30</p>'),
        ]
        db_session.add_all(entries)
        db_session.commit()

        response = client.get('/api/search/?q=Python')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Verify entries from all three dates
        dates = [e['date'] for e in data]
        assert '2025-11-01' in dates
        assert '2025-11-15' in dates
        assert '2025-11-30' in dates
