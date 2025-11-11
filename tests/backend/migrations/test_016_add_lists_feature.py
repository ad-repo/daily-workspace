"""
Tests for migration 016 - Add Lists Feature
"""
import pytest
import sqlite3
import os
import sys
import importlib.util
from pathlib import Path

# Add migrations directory to path
backend_path = os.getenv('BACKEND_PATH', str(Path(__file__).parent.parent.parent.parent / 'backend'))
sys.path.insert(0, backend_path)

# Import the migration module
migration_file = Path(backend_path) / 'migrations' / '016_add_lists_feature.py'
spec = importlib.util.spec_from_file_location("migration_016", migration_file)
migration_016 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration_016)

migrate_up = migration_016.migrate_up
migrate_down = migration_016.migrate_down
table_exists = migration_016.table_exists


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


def test_upgrade_from_version_015(tmp_path):
    """Test upgrading from version 015 (with goals tables) to version 016"""
    # Create database with version 015 schema
    db_path = str(tmp_path / "test_v015.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create schema up to version 015 (simplified - just the essential tables)
    cursor.execute("""
        CREATE TABLE note_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_note_id INTEGER NOT NULL,
            title TEXT DEFAULT '',
            content TEXT NOT NULL,
            content_type TEXT DEFAULT 'rich_text',
            order_index INTEGER DEFAULT 0,
            include_in_report INTEGER DEFAULT 0,
            is_important INTEGER DEFAULT 0,
            is_completed INTEGER DEFAULT 0,
            is_dev_null INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE daily_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            fire_rating INTEGER DEFAULT 0,
            daily_goal TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Version 015: Goals tables
    cursor.execute("""
        CREATE TABLE goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_type TEXT NOT NULL,
            text TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add some test data
    cursor.execute("INSERT INTO daily_notes (date) VALUES ('2024-01-01')")
    cursor.execute("INSERT INTO note_entries (daily_note_id, content) VALUES (1, 'Test entry')")
    cursor.execute("INSERT INTO goals (goal_type, text) VALUES ('daily', 'Test goal')")
    
    conn.commit()
    conn.close()
    
    # Now run migration 016
    success = migrate_up(db_path)
    assert success, "Migration should succeed from version 015"
    
    # Verify new tables exist alongside old ones
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    assert table_exists(cursor, 'lists'), "lists table should exist"
    assert table_exists(cursor, 'entry_lists'), "entry_lists table should exist"
    assert table_exists(cursor, 'goals'), "existing goals table should still exist"
    assert table_exists(cursor, 'note_entries'), "existing note_entries table should still exist"
    
    # Verify existing data is intact
    cursor.execute("SELECT COUNT(*) FROM note_entries")
    assert cursor.fetchone()[0] == 1, "Existing entries should be preserved"
    
    cursor.execute("SELECT COUNT(*) FROM goals")
    assert cursor.fetchone()[0] == 1, "Existing goals should be preserved"
    
    conn.close()


def test_upgrade_from_older_version_without_goals(tmp_path):
    """Test upgrading from pre-goals version (before v015) to version 016"""
    # Create database with older schema (no goals tables)
    db_path = str(tmp_path / "test_old.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create minimal old schema
    cursor.execute("""
        CREATE TABLE note_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_note_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE daily_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add test data
    cursor.execute("INSERT INTO daily_notes (date) VALUES ('2023-01-01')")
    cursor.execute("INSERT INTO note_entries (daily_note_id, content) VALUES (1, 'Old entry')")
    
    conn.commit()
    conn.close()
    
    # Run migration 016
    success = migrate_up(db_path)
    assert success, "Migration should succeed from older version"
    
    # Verify new tables were added
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    assert table_exists(cursor, 'lists'), "lists table should be created"
    assert table_exists(cursor, 'entry_lists'), "entry_lists table should be created"
    
    # Verify old data is intact
    cursor.execute("SELECT content FROM note_entries")
    assert cursor.fetchone()[0] == 'Old entry', "Old data should be preserved"
    
    conn.close()


def test_migration_with_existing_data(tmp_path):
    """Test that migration works when note_entries already contains data"""
    # Create database with data
    db_path = str(tmp_path / "test_data.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create base schema
    cursor.execute("""
        CREATE TABLE note_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_note_id INTEGER NOT NULL,
            content TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE daily_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL
        )
    """)
    
    # Add some entries
    cursor.execute("INSERT INTO daily_notes (date) VALUES ('2024-11-11')")
    cursor.execute("""
        INSERT INTO note_entries (daily_note_id, content) 
        VALUES (1, 'Entry 1'), (1, 'Entry 2'), (1, 'Entry 3')
    """)
    conn.commit()
    conn.close()
    
    # Run migration
    success = migrate_up(db_path)
    assert success, "Migration should succeed with existing data"
    
    # Verify we can create lists and add entries to them
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO lists (name, description, color) 
        VALUES ('Test List', 'Test Description', '#ff0000')
    """)
    
    cursor.execute("""
        INSERT INTO entry_lists (entry_id, list_id, order_index)
        VALUES (1, 1, 0), (2, 1, 1)
    """)
    conn.commit()
    
    # Verify foreign keys work
    cursor.execute("""
        SELECT e.content, el.order_index 
        FROM note_entries e
        JOIN entry_lists el ON e.id = el.entry_id
        WHERE el.list_id = 1
        ORDER BY el.order_index
    """)
    results = cursor.fetchall()
    assert len(results) == 2, "Should have 2 entries in the list"
    assert results[0][0] == 'Entry 1', "First entry should be 'Entry 1'"
    
    conn.close()

