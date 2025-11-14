#!/usr/bin/env python3
"""
Migration 019: Add Kanban support to lists table
- Adds is_kanban column (0 = regular list, 1 = Kanban column)
- Adds kanban_order column for ordering Kanban columns
"""

import sqlite3
from pathlib import Path


def get_db_path():
    """Get the database path, respecting DATABASE_URL environment variable."""
    import os

    db_url = os.environ.get('DATABASE_URL', '')
    if db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
        return Path(db_path)

    # Default to daily_notes.db in backend directory
    backend_dir = Path(__file__).parent.parent
    return backend_dir / 'daily_notes.db'


def table_exists(cursor, table_name: str) -> bool:
    """Check if a table exists in the database."""
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    )
    return cursor.fetchone() is not None


def column_exists(cursor, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns


def migrate_up(db_path: Path) -> bool:
    """
    Add is_kanban and kanban_order columns to the lists table.
    """
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        if not table_exists(cursor, 'lists'):
            print("Table 'lists' does not exist. Skipping migration 019.")
            return False

        # Add is_kanban column
        if not column_exists(cursor, 'lists', 'is_kanban'):
            cursor.execute("ALTER TABLE lists ADD COLUMN is_kanban INTEGER DEFAULT 0")
            print("Added 'is_kanban' column to 'lists' table.")
        else:
            print("'is_kanban' column already exists in 'lists' table. Skipping.")

        # Add kanban_order column
        if not column_exists(cursor, 'lists', 'kanban_order'):
            cursor.execute(
                "ALTER TABLE lists ADD COLUMN kanban_order INTEGER DEFAULT 0"
            )
            print("Added 'kanban_order' column to 'lists' table.")
        else:
            print("'kanban_order' column already exists in 'lists' table. Skipping.")

        conn.commit()
    return True


def migrate_down(db_path: Path) -> bool:
    """
    Remove is_kanban and kanban_order columns from the lists table.
    Note: SQLite doesn't support DROP COLUMN directly, so this would require
    recreating the table. For safety, we just document the process.
    """
    print("Downgrade for 019: Removing columns in SQLite requires table recreation.")
    print("To downgrade:")
    print("1. Create a new table without is_kanban and kanban_order columns")
    print("2. Copy data from the old table to the new table")
    print("3. Drop the old table")
    print("4. Rename the new table to 'lists'")
    print("Skipping actual column removal for safety.")
    return True


if __name__ == '__main__':
    db_path = get_db_path()
    print(f"Running migration 019 on database: {db_path}")
    success = migrate_up(db_path)
    if success:
        print("✓ Migration 019_add_kanban_support.py completed successfully")
    else:
        print("✗ Migration 019_add_kanban_support.py failed or skipped")

