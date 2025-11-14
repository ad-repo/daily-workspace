#!/usr/bin/env python3
"""
Migration 019: Add Kanban Board Support

Adds the ability to use lists as Kanban board columns with workflow states.

Changes:
- Add is_kanban column to lists table (Integer, default 0)
- Add kanban_order column to lists table (Integer, default 0)
- Update existing lists to have is_kanban=0 (maintain backwards compatibility)

Backwards Compatibility:
- ✓ Idempotent - safe to run multiple times
- ✓ Works from any previous version (requires migration 016 for lists table)
- ✓ Does not affect existing data (purely additive with safe defaults)
- ✓ Existing lists remain as regular lists (is_kanban=0)
- ✓ Lists and Kanban boards work independently

Dependencies:
- Requires migration 016 (lists table must exist)

Verified:
- ✓ Adds columns if they don't exist
- ✓ Skips if columns already exist
- ✓ Sets safe defaults for existing data
- ✓ Maintains data integrity
"""

import sqlite3
from pathlib import Path


def get_db_path():
    """Get the database path, checking multiple possible locations."""
    possible_paths = [
        Path("/app/data/daily_notes.db"),  # Docker container path
        Path("data/daily_notes.db"),  # Relative path
        Path("daily_notes.db"),  # Current directory
    ]

    for path in possible_paths:
        if path.exists():
            return path

    # If no database exists, use the default Docker path
    return Path("/app/data/daily_notes.db")


def table_exists(cursor, table_name: str) -> bool:
    """Check if a table exists in the database."""
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    )
    return cursor.fetchone() is not None


def column_exists(cursor, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns


def migrate_up(db_path: Path) -> bool:
    """
    Add Kanban support columns to lists table.
    
    Returns:
        bool: True if migration succeeded, False otherwise
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if lists table exists (required dependency)
        if not table_exists(cursor, 'lists'):
            print("❌ Error: lists table does not exist. Run migration 016 first.")
            return False
        
        # Add is_kanban column if it doesn't exist
        if not column_exists(cursor, 'lists', 'is_kanban'):
            print("Adding is_kanban column to lists table...")
            cursor.execute("""
                ALTER TABLE lists
                ADD COLUMN is_kanban INTEGER DEFAULT 0
            """)
            print("✓ Added is_kanban column")
        else:
            print("✓ is_kanban column already exists")
        
        # Add kanban_order column if it doesn't exist
        if not column_exists(cursor, 'lists', 'kanban_order'):
            print("Adding kanban_order column to lists table...")
            cursor.execute("""
                ALTER TABLE lists
                ADD COLUMN kanban_order INTEGER DEFAULT 0
            """)
            print("✓ Added kanban_order column")
        else:
            print("✓ kanban_order column already exists")
        
        # Ensure existing lists have is_kanban=0 (safe default)
        cursor.execute("""
            UPDATE lists
            SET is_kanban = 0
            WHERE is_kanban IS NULL
        """)
        
        # Ensure existing lists have kanban_order=0 (safe default)
        cursor.execute("""
            UPDATE lists
            SET kanban_order = 0
            WHERE kanban_order IS NULL
        """)
        
        conn.commit()
        print("✓ Migration 019 completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Migration 019 failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def migrate_down(db_path: Path) -> bool:
    """
    Remove Kanban support columns from lists table.
    
    Note: SQLite doesn't support DROP COLUMN directly, so this would require
    recreating the table. For safety, we don't implement rollback.
    
    Returns:
        bool: False (rollback not supported)
    """
    print("⚠️  Rollback not supported for this migration (SQLite limitation)")
    print("   To remove Kanban support, manually recreate the lists table")
    return False


if __name__ == '__main__':
    db_path = get_db_path()
    print(f"Running migration 019 on database: {db_path}")
    success = migrate_up(db_path)
    exit(0 if success else 1)

