#!/usr/bin/env python3
"""
Migration: Add title field to note_entries table
Version: 001
Date: 2025-10-30

This migration adds a 'title' column to the note_entries table
to allow users to add optional titles to their note entries.
"""

import os
import sqlite3
import sys
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
        # Check if the column already exists
        if column_exists(cursor, 'note_entries', 'title'):
            print("✓ Column 'title' already exists in note_entries table. Nothing to do.")
            return True

        # Add the title column
        print("Adding 'title' column to note_entries table...")
        cursor.execute("""
            ALTER TABLE note_entries
            ADD COLUMN title VARCHAR DEFAULT ''
        """)

        conn.commit()
        print("✓ Successfully added 'title' column to note_entries table")
        return True

    except sqlite3.Error as e:
        print(f"✗ Migration failed: {e}")
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
        # Check if the column exists
        if not column_exists(cursor, 'note_entries', 'title'):
            print("✓ Column 'title' does not exist. Nothing to do.")
            return True

        # SQLite doesn't support DROP COLUMN directly in older versions
        # We need to recreate the table without the title column
        print("Removing 'title' column from note_entries table...")
        print("Note: This requires recreating the table.")

        # Get the current table structure (for reference/debugging if needed)
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='note_entries'")
        _ = cursor.fetchone()[0]  # Store for potential debugging

        # Create a backup of the data
        cursor.execute("""
            CREATE TABLE note_entries_backup AS
            SELECT id, daily_note_id, content, content_type, order_index,
                   created_at, updated_at, include_in_report, is_important,
                   is_completed, is_dev_null
            FROM note_entries
        """)

        # Drop the original table
        cursor.execute("DROP TABLE note_entries")

        # Recreate the table without title column
        cursor.execute("""
            CREATE TABLE note_entries (
                id INTEGER NOT NULL,
                daily_note_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                content_type VARCHAR,
                order_index INTEGER,
                created_at DATETIME,
                updated_at DATETIME,
                include_in_report INTEGER DEFAULT 0,
                is_important INTEGER DEFAULT 0,
                is_completed INTEGER DEFAULT 0,
                is_dev_null INTEGER DEFAULT 0,
                PRIMARY KEY (id),
                FOREIGN KEY(daily_note_id) REFERENCES daily_notes (id)
            )
        """)

        # Restore the data
        cursor.execute("""
            INSERT INTO note_entries
            SELECT * FROM note_entries_backup
        """)

        # Drop the backup table
        cursor.execute("DROP TABLE note_entries_backup")

        # Recreate indexes
        cursor.execute("CREATE INDEX ix_note_entries_id ON note_entries (id)")

        conn.commit()
        print("✓ Successfully removed 'title' column from note_entries table")
        return True

    except sqlite3.Error as e:
        print(f"✗ Rollback failed: {e}")
        conn.rollback()
        return False

    finally:
        conn.close()


def main():
    """Main entry point for the migration script."""
    if len(sys.argv) > 1:
        command = sys.argv[1]
    else:
        command = "up"

    db_path = get_db_path()

    if command == "up":
        print("Running migration: Add title field to note_entries")
        success = migrate_up(db_path)
    elif command == "down":
        print("Rolling back migration: Remove title field from note_entries")
        success = migrate_down(db_path)
    else:
        print(f"Unknown command: {command}")
        print("Usage: python 001_add_title_field.py [up|down]")
        sys.exit(1)

    if success:
        print("\nMigration completed successfully!")
        sys.exit(0)
    else:
        print("\nMigration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

