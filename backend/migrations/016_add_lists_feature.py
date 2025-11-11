#!/usr/bin/env python3
"""
Migration 016: Add Lists Feature

Creates tables for Trello-style lists/boards where note entries can be organized as cards.

Changes:
- Create lists table (id, name, description, color, order_index, is_archived, created_at, updated_at)
- Create entry_lists association table (entry_id, list_id, order_index, created_at)
- Add indexes for performance

Backwards Compatibility:
- Idempotent - safe to run multiple times
- Works from any previous version
- Does not affect existing data (purely additive)

Verified:
- ✓ Creates tables if they don't exist
- ✓ Skips creation if tables already exist
- ✓ Foreign key integrity maintained
- ✓ Indexes created for query performance
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


def table_exists(cursor, table_name):
    """Check if a table exists."""
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
    """, (table_name,))
    return cursor.fetchone() is not None


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
        # Step 1: Create lists table
        if not table_exists(cursor, 'lists'):
            print("Creating lists table...")
            cursor.execute("""
                CREATE TABLE lists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    color TEXT DEFAULT '#3b82f6',
                    order_index INTEGER DEFAULT 0,
                    is_archived INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✓ Created lists table")
        else:
            print("✓ lists table already exists")
        
        # Step 2: Create entry_lists association table
        if not table_exists(cursor, 'entry_lists'):
            print("Creating entry_lists association table...")
            cursor.execute("""
                CREATE TABLE entry_lists (
                    entry_id INTEGER NOT NULL,
                    list_id INTEGER NOT NULL,
                    order_index INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (entry_id, list_id),
                    FOREIGN KEY (entry_id) REFERENCES note_entries(id) ON DELETE CASCADE,
                    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
                )
            """)
            print("✓ Created entry_lists association table")
        else:
            print("✓ entry_lists association table already exists")
        
        # Step 3: Create indexes for performance
        if not index_exists(cursor, 'idx_lists_name'):
            print("Creating index on lists.name...")
            cursor.execute("CREATE INDEX idx_lists_name ON lists(name)")
            print("✓ Created index idx_lists_name")
        else:
            print("✓ Index idx_lists_name already exists")
        
        if not index_exists(cursor, 'idx_lists_order'):
            print("Creating index on lists.order_index...")
            cursor.execute("CREATE INDEX idx_lists_order ON lists(order_index)")
            print("✓ Created index idx_lists_order")
        else:
            print("✓ Index idx_lists_order already exists")
        
        if not index_exists(cursor, 'idx_entry_lists_entry'):
            print("Creating index on entry_lists.entry_id...")
            cursor.execute("CREATE INDEX idx_entry_lists_entry ON entry_lists(entry_id)")
            print("✓ Created index idx_entry_lists_entry")
        else:
            print("✓ Index idx_entry_lists_entry already exists")
        
        if not index_exists(cursor, 'idx_entry_lists_list'):
            print("Creating index on entry_lists.list_id...")
            cursor.execute("CREATE INDEX idx_entry_lists_list ON entry_lists(list_id)")
            print("✓ Created index idx_entry_lists_list")
        else:
            print("✓ Index idx_entry_lists_list already exists")
        
        conn.commit()
        print("✓ Migration 016 completed successfully")
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
        print("Dropping lists tables and indexes...")
        
        # Drop indexes first
        cursor.execute("DROP INDEX IF EXISTS idx_entry_lists_list")
        print("✓ Dropped index idx_entry_lists_list")
        
        cursor.execute("DROP INDEX IF EXISTS idx_entry_lists_entry")
        print("✓ Dropped index idx_entry_lists_entry")
        
        cursor.execute("DROP INDEX IF EXISTS idx_lists_order")
        print("✓ Dropped index idx_lists_order")
        
        cursor.execute("DROP INDEX IF EXISTS idx_lists_name")
        print("✓ Dropped index idx_lists_name")
        
        # Drop tables
        cursor.execute("DROP TABLE IF EXISTS entry_lists")
        print("✓ Dropped entry_lists table")
        
        cursor.execute("DROP TABLE IF EXISTS lists")
        print("✓ Dropped lists table")
        
        conn.commit()
        print("✓ Migration 016 rollback completed")
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

