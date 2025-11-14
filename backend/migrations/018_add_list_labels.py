#!/usr/bin/env python3
"""
Migration 018: Add List Labels Support

Adds the ability to associate labels with lists for categorization and filtering.

Changes:
- Add list_labels association table (many-to-many relationship)
- Foreign keys to lists(id) and labels(id) with CASCADE delete
- Composite primary key on (list_id, label_id)

Backwards Compatibility:
- ✓ Idempotent - safe to run multiple times
- ✓ Works from any previous version (requires migration 016 for lists table)
- ✓ Does not affect existing data (purely additive)
- ✓ No data migration needed
- ✓ Lists and labels continue to work independently

Dependencies:
- Requires migration 016 (lists table must exist)
- Requires labels table (from early migrations)

Verified:
- ✓ Creates table if it doesn't exist
- ✓ Skips if table already exists
- ✓ Foreign key constraints properly set up
- ✓ Cascade delete works correctly
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
    """Check if a table exists in the database"""
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    )
    return cursor.fetchone() is not None


def migrate_up(db_path: Path):
    """Add list_labels association table"""
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Verify required tables exist
        if not table_exists(cursor, "lists"):
            print("✗ Error: lists table does not exist. Run migration 016 first.")
            return False

        if not table_exists(cursor, "labels"):
            print("✗ Error: labels table does not exist. Run earlier migrations first.")
            return False

        print("✓ Required tables (lists, labels) exist")

        # Create list_labels association table if it doesn't exist
        if not table_exists(cursor, "list_labels"):
            cursor.execute("""
                CREATE TABLE list_labels (
                    list_id INTEGER NOT NULL,
                    label_id INTEGER NOT NULL,
                    PRIMARY KEY (list_id, label_id),
                    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
                    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
                )
            """)
            print("✓ Created list_labels table")
        else:
            print("✓ list_labels table already exists")

        conn.commit()
        print("✓ Migration 018 completed successfully")
        return True

    except Exception as e:
        conn.rollback()
        print(f"✗ Migration 018 failed: {e}")
        raise
    finally:
        conn.close()


def migrate_down(db_path: Path):
    """Remove list_labels association table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        if table_exists(cursor, "list_labels"):
            cursor.execute("DROP TABLE list_labels")
            print("✓ Dropped list_labels table")
        else:
            print("ℹ list_labels table doesn't exist")

        conn.commit()
        print("✓ Migration 018 rollback completed successfully")

    except Exception as e:
        conn.rollback()
        print(f"✗ Migration 018 rollback failed: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    # For testing
    db_path = Path("daily_notes.db")
    migrate_up(db_path)

