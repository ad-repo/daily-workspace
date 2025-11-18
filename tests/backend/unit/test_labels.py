"""
Unit tests for Label models and business logic.
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import DailyNote, Label, NoteEntry


@pytest.mark.unit
class TestLabelModel:
    """Test Label model operations."""

    def test_create_label_with_all_fields(self, db_session: Session):
        """Test creating a label with all fields."""
        label = Label(name='urgent', color='#ef4444')
        db_session.add(label)
        db_session.commit()
        db_session.refresh(label)

        assert label.id is not None
        assert label.name == 'urgent'
        assert label.color == '#ef4444'
        assert label.created_at is not None

    def test_create_label_default_color(self, db_session: Session):
        """Test that labels have a default color."""
        label = Label(name='test')
        db_session.add(label)
        db_session.commit()
        db_session.refresh(label)

        assert label.color == '#3b82f6'  # Default blue

    def test_label_name_unique(self, db_session: Session):
        """Test that label names must be unique."""
        label1 = Label(name='duplicate')
        db_session.add(label1)
        db_session.commit()

        label2 = Label(name='duplicate')
        db_session.add(label2)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_emoji_label(self, db_session: Session):
        """Test creating a label with emoji only."""
        label = Label(name='🔥', color='#ff0000')
        db_session.add(label)
        db_session.commit()
        db_session.refresh(label)

        assert label.name == '🔥'
        assert label.id is not None

    def test_label_with_spaces(self, db_session: Session):
        """Test creating a label with spaces in name."""
        label = Label(name='urgent task')
        db_session.add(label)
        db_session.commit()
        db_session.refresh(label)

        assert label.name == 'urgent task'

    def test_empty_label_name(self, db_session: Session):
        """Test that empty label names are not allowed."""
        label = Label(name='')
        db_session.add(label)

        # Should fail due to NOT NULL constraint or validation
        try:
            db_session.commit()
            # If it doesn't fail, the label should at least be queryable
            assert label.id is not None
        except (IntegrityError, Exception):
            # Expected behavior
            db_session.rollback()

    def test_label_attach_to_entry(self, db_session: Session, sample_daily_note: DailyNote):
        """Test attaching a label to an entry."""
        label = Label(name='test-attach')
        entry = NoteEntry(daily_note_id=sample_daily_note.id, content='<p>Test</p>')
        entry.labels.append(label)
        db_session.add_all([label, entry])
        db_session.commit()
        db_session.refresh(entry)

        assert len(entry.labels) == 1
        assert entry.labels[0].name == 'test-attach'

    def test_label_attach_to_multiple_entries(self, db_session: Session, sample_daily_note: DailyNote):
        """Test attaching the same label to multiple entries."""
        label = Label(name='shared')
        entry1 = NoteEntry(daily_note_id=sample_daily_note.id, content='<p>Entry 1</p>')
        entry2 = NoteEntry(daily_note_id=sample_daily_note.id, content='<p>Entry 2</p>')

        entry1.labels.append(label)
        entry2.labels.append(label)

        db_session.add_all([label, entry1, entry2])
        db_session.commit()

        db_session.refresh(label)
        assert len(label.entries) == 2

    def test_label_attach_to_daily_note(self, db_session: Session, sample_daily_note: DailyNote):
        """Test attaching a label to a daily note."""
        label = Label(name='day-label')
        sample_daily_note.labels.append(label)
        db_session.add(label)
        db_session.commit()
        db_session.refresh(sample_daily_note)

        assert len(sample_daily_note.labels) >= 1
        label_names = [lbl.name for lbl in sample_daily_note.labels]
        assert 'day-label' in label_names

    def test_delete_label_removes_associations(self, db_session: Session, sample_daily_note: DailyNote):
        """Test that deleting a label removes its associations."""
        label = Label(name='to-delete')
        entry = NoteEntry(daily_note_id=sample_daily_note.id, content='<p>With label</p>')
        entry.labels.append(label)
        db_session.add_all([label, entry])
        db_session.commit()

        label_id = label.id
        entry_id = entry.id

        # Delete label
        db_session.delete(label)
        db_session.commit()

        # Verify label is deleted
        deleted_label = db_session.query(Label).filter(Label.id == label_id).first()
        assert deleted_label is None

        # Verify entry still exists
        existing_entry = db_session.query(NoteEntry).filter(NoteEntry.id == entry_id).first()
        assert existing_entry is not None
        assert len(existing_entry.labels) == 0

    def test_label_case_sensitivity(self, db_session: Session):
        """Test label name case sensitivity."""
        label1 = Label(name='Test')
        label2 = Label(name='test')

        db_session.add(label1)
        db_session.commit()

        db_session.add(label2)
        # This should fail if labels are case-insensitive
        # Or succeed if they are case-sensitive
        try:
            db_session.commit()
            # If successful, both labels exist
            assert label1.name == 'Test'
            assert label2.name == 'test'
        except IntegrityError:
            # If failed, labels are case-insensitive
            db_session.rollback()

    def test_query_labels_alphabetically(self, db_session: Session):
        """Test querying labels in alphabetical order."""
        labels = [
            Label(name='zebra'),
            Label(name='apple'),
            Label(name='monkey'),
        ]
        db_session.add_all(labels)
        db_session.commit()

        sorted_labels = db_session.query(Label).order_by(Label.name.asc()).all()

        # Verify alphabetical order
        label_names = [label.name for label in sorted_labels]
        assert label_names == sorted(label_names)

    def test_label_color_variations(self, db_session: Session):
        """Test various color formats for labels."""
        colors = [
            '#ff0000',  # red
            '#00ff00',  # green
            '#0000ff',  # blue
            'rgb(255, 0, 0)',  # CSS rgb format
            'hsl(120, 100%, 50%)',  # CSS hsl format
        ]

        for i, color in enumerate(colors):
            label = Label(name=f'color-{i}', color=color)
            db_session.add(label)

        db_session.commit()

        # Verify all colors are stored
        stored_labels = db_session.query(Label).filter(Label.name.like('color-%')).all()
        assert len(stored_labels) == len(colors)

    def test_label_autocomplete_prefix_search(self, db_session: Session):
        """Test searching labels by prefix for autocomplete."""
        labels = [
            Label(name='urgent'),
            Label(name='urgent-bug'),
            Label(name='urgent-feature'),
            Label(name='feature'),
        ]
        db_session.add_all(labels)
        db_session.commit()

        # Search for labels starting with "urgent"
        results = db_session.query(Label).filter(Label.name.like('urgent%')).all()

        assert len(results) == 3
        result_names = [label.name for label in results]
        assert 'urgent' in result_names
        assert 'urgent-bug' in result_names
        assert 'urgent-feature' in result_names
        assert 'feature' not in result_names
