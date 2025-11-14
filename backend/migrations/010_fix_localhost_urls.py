#!/usr/bin/env python3
"""
Migration: Fix localhost URLs in note content
Version: 010
Date: 2025-11-02

This migration replaces hardcoded localhost URLs with relative paths,
making images and videos work across different network configurations.
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


def migrate_up(db_path):
    """Apply the migration."""
    print(f"Connecting to database: {db_path}")

    if not os.path.exists(db_path):
        print(f"Warning: Database not found at {db_path}")
        return True

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("Fixing localhost URLs in note content...")

        # First replacement: src="http://localhost:8000/api/ -> src="/api/
        cursor.execute("""
            UPDATE note_entries
            SET content = REPLACE(content, 'src="http://localhost:8000/api/', 'src="/api/')
            WHERE content LIKE '%localhost:8000%'
        """)

        # Second replacement: src="http://localhost:8000 -> src="
        cursor.execute("""
            UPDATE note_entries
            SET content = REPLACE(content, 'src="http://localhost:8000', 'src="')
            WHERE content LIKE '%localhost:8000%'
        """)

        # Third replacement: http://localhost:8000/api/ -> /api/
        cursor.execute("""
            UPDATE note_entries
            SET content = REPLACE(content, 'http://localhost:8000/api/', '/api/')
            WHERE content LIKE '%localhost:8000%'
        """)

        conn.commit()
        print("✓ Successfully fixed localhost URLs in note content")
        return True

    except sqlite3.Error as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
        return False

    finally:
        conn.close()


def migrate_down(db_path):
    """Rollback the migration."""
    print("No downgrade needed - relative paths work everywhere")
    return True


def main():
    """Main entry point for the migration script."""
    if len(sys.argv) > 1:
        command = sys.argv[1]
    else:
        command = "up"

    db_path = get_db_path()

    if command == "up":
        print("Running migration: Fix localhost URLs")
        success = migrate_up(db_path)
    elif command == "down":
        print("Rolling back migration: Fix localhost URLs")
        success = migrate_down(db_path)
    else:
        print(f"Unknown command: {command}")
        print("Usage: python 010_fix_localhost_urls.py [up|down]")
        sys.exit(1)

    if success:
        print("\nMigration completed successfully!")
        sys.exit(0)
    else:
        print("\nMigration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

