"""
Tests for migration 016 - Add Lists Feature
"""
import pytest
import sqlite3
import os
from pathlib import Path

from backend.migrations.migration_016_add_lists_feature import migrate_up, migrate_down, table_exists


@pytest.fixture
def temp_db(tmp_path):
    """Create a temporary test database"""
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Create minimal schema for testing (note_entries table must exist for foreign key)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS note_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    
    return str(db_path)


def test_migrate_up_creates_lists_table(temp_db):
    """Test that migration creates lists table"""
    result = migrate_up(temp_db)
    assert result is True
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    assert table_exists(cursor, 'lists')
    
    # Check columns
    cursor.execute("PRAGMA table_info(lists)")
    columns = {row[1] for row in cursor.fetchall()}
    assert 'id' in columns
    assert 'name' in columns
    assert 'description' in columns
    assert 'color' in columns
    assert 'order_index' in columns
    assert 'is_archived' in columns
    assert 'created_at' in columns
    assert 'updated_at' in columns
    
    conn.close()


def test_migrate_up_creates_entry_lists_table(temp_db):
    """Test that migration creates entry_lists association table"""
    result = migrate_up(temp_db)
    assert result is True
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    assert table_exists(cursor, 'entry_lists')
    
    # Check columns
    cursor.execute("PRAGMA table_info(entry_lists)")
    columns = {row[1] for row in cursor.fetchall()}
    assert 'entry_id' in columns
    assert 'list_id' in columns
    assert 'order_index' in columns
    assert 'created_at' in columns
    
    conn.close()


def test_migrate_up_creates_indexes(temp_db):
    """Test that migration creates indexes"""
    result = migrate_up(temp_db)
    assert result is True
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    # Check for indexes
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
    indexes = {row[0] for row in cursor.fetchall()}
    
    assert 'idx_lists_name' in indexes
    assert 'idx_lists_order' in indexes
    assert 'idx_entry_lists_entry' in indexes
    assert 'idx_entry_lists_list' in indexes
    
    conn.close()


def test_migrate_up_idempotent(temp_db):
    """Test that running migration twice doesn't fail"""
    result1 = migrate_up(temp_db)
    assert result1 is True
    
    result2 = migrate_up(temp_db)
    assert result2 is True
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    assert table_exists(cursor, 'lists')
    assert table_exists(cursor, 'entry_lists')
    
    conn.close()


def test_migrate_down_removes_tables(temp_db):
    """Test that rollback removes tables"""
    migrate_up(temp_db)
    result = migrate_down(temp_db)
    assert result is True
    
    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    assert not table_exists(cursor, 'lists')
    assert not table_exists(cursor, 'entry_lists')
    
    conn.close()


def test_migrate_down_idempotent(temp_db):
    """Test that running rollback twice doesn't fail"""
    migrate_up(temp_db)
    result1 = migrate_down(temp_db)
    assert result1 is True
    
    result2 = migrate_down(temp_db)
    assert result2 is True


def test_migrate_up_nonexistent_db():
    """Test that migration handles nonexistent database gracefully"""
    result = migrate_up("/nonexistent/path/db.db")
    assert result is True  # Should return True and print warning

