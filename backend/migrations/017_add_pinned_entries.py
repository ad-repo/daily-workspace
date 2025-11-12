#!/usr/bin/env python3
"""
Migration 017: Add Pinned Entries Feature

Adds the ability to pin note entries so they automatically carry forward to the next day.

Changes:
- Add is_pinned column to note_entries table (INTEGER DEFAULT 0)
- Add index on is_pinned for efficient querying of pinned entries

Backwards Compatibility:
- Idempotent - safe to run multiple times
- Works from any previous version
- Does not affect existing data (purely additive)
- Default value of 0 (not pinned) for all existing entries

Verified:
- ✓ Adds column if it doesn't exist
- ✓ Skips if column already exists
- ✓ Creates index for query performance
"""

import sqlite3
import os
from pathlib import Path


def get_db_path():
    """Get the database path, checking multiple possible locations."""
    possible_paths = [
        Path(__file__).parent.parent / "data" / "daily_notes.db",
        Path(__file__).parent.parent / "daily_notes.db",
        Path.cwd() / "data" / "daily_notes.db",
        Path.cwd() / "daily_notes.db",
    ]
    
    for path in possible_paths:
        if path.exists():
            return str(path)
    
    # If no database exists, return the preferred location
    return str(possible_paths[0])


def column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns


def index_exists(cursor, index_name):
    """Check if an index exists."""
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name=?
    """, (index_name,))
    return cursor.fetchone() is not None


def migrate_up(db_path):
    """Apply the migration."""
    print(f"Connecting to database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Warning: Database not found at {db_path}")
        print("Migration will be applied when the database is created.")
        return True
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Step 1: Add is_pinned column to note_entries
        if not column_exists(cursor, 'note_entries', 'is_pinned'):
            print("Adding is_pinned column to note_entries table...")
            cursor.execute("""
                ALTER TABLE note_entries 
                ADD COLUMN is_pinned INTEGER DEFAULT 0
            """)
            print("✓ Added is_pinned column")
        else:
            print("✓ is_pinned column already exists")
        
        # Step 2: Create index on is_pinned for efficient querying
        if not index_exists(cursor, 'idx_note_entries_pinned'):
            print("Creating index on note_entries.is_pinned...")
            cursor.execute("CREATE INDEX idx_note_entries_pinned ON note_entries(is_pinned)")
            print("✓ Created index idx_note_entries_pinned")
        else:
            print("✓ Index idx_note_entries_pinned already exists")
        
        conn.commit()
        print("✓ Migration 017 completed successfully")
        return True
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False
        
    finally:
        conn.close()


def migrate_down(db_path):
    """Rollback the migration."""
    print(f"Connecting to database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Warning: Database not found at {db_path}")
        return True
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Rolling back pinned entries feature...")
        
        # Drop index
        cursor.execute("DROP INDEX IF EXISTS idx_note_entries_pinned")
        print("✓ Dropped index idx_note_entries_pinned")
        
        # Note: SQLite doesn't support DROP COLUMN directly
        # We would need to recreate the table to remove the column
        # For safety, we'll leave the column but document it as unused
        print("⚠ Note: is_pinned column remains in table (SQLite limitation)")
        print("   Column will be ignored by application")
        
        conn.commit()
        print("✓ Migration 017 rollback completed")
        return True
        
    except Exception as e:
        print(f"✗ Rollback failed: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()


def main():
    """Run the migration manually."""
    import sys
    
    db_path = get_db_path()
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        success = migrate_down(db_path)
    else:
        success = migrate_up(db_path)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()

