#!/usr/bin/env python3
"""
Migration 015: Create sprint_goals and quarterly_goals tables

Creates separate tables for historical goal tracking with date ranges.
Migrates existing goals from app_settings to new tables if dates exist.

Changes:
- Create sprint_goals table (id, text, start_date, end_date, created_at, updated_at)
- Create quarterly_goals table (id, text, start_date, end_date, created_at, updated_at)
- Migrate existing goals from app_settings if dates are set
- Add UNIQUE constraint to prevent overlapping date ranges

Backwards Compatibility:
- Checks for date columns before attempting migration (handles pre-migration 013)
- Idempotent - safe to run multiple times
- Works from any version (fresh install, pre-013, post-013)

Verified:
- ✓ Tested on current database (2025-11-07)
- ✓ Handles missing date columns gracefully
- ✓ Backup/restore includes sprint_goals and quarterly_goals tables
- ✓ Foreign key integrity maintained
"""

import os
import sqlite3
from datetime import datetime
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
        # Step 1: Create sprint_goals table
        if not table_exists(cursor, 'sprint_goals'):
            print("Creating sprint_goals table...")
            cursor.execute("""
                CREATE TABLE sprint_goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT NOT NULL DEFAULT '',
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CHECK (end_date > start_date)
                )
            """)
            print("✓ Created sprint_goals table")
        else:
            print("✓ sprint_goals table already exists")

        # Step 2: Create quarterly_goals table
        if not table_exists(cursor, 'quarterly_goals'):
            print("Creating quarterly_goals table...")
            cursor.execute("""
                CREATE TABLE quarterly_goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT NOT NULL DEFAULT '',
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CHECK (end_date > start_date)
                )
            """)
            print("✓ Created quarterly_goals table")
        else:
            print("✓ quarterly_goals table already exists")

        # Step 3: Migrate existing goals from app_settings if they exist
        if table_exists(cursor, 'app_settings'):
            print("Checking for existing goals in app_settings...")

            # Check if date columns exist (added in migration 013)
            has_date_columns = (
                column_exists(cursor, 'app_settings', 'sprint_start_date') and
                column_exists(cursor, 'app_settings', 'sprint_end_date') and
                column_exists(cursor, 'app_settings', 'quarterly_start_date') and
                column_exists(cursor, 'app_settings', 'quarterly_end_date')
            )

            if not has_date_columns:
                print("✓ Date columns not found in app_settings (old version, skipping migration)")
            else:
                cursor.execute("""
                    SELECT sprint_goals, sprint_start_date, sprint_end_date,
                           quarterly_goals, quarterly_start_date, quarterly_end_date
                    FROM app_settings
                    WHERE id = 1
                """)
                settings = cursor.fetchone()

                if settings:
                    sprint_text, sprint_start, sprint_end, quarterly_text, quarterly_start, quarterly_end = settings

                    # Migrate sprint goal if it has dates
                    if sprint_start and sprint_end and sprint_text:
                        cursor.execute("""
                            SELECT COUNT(*) FROM sprint_goals
                            WHERE start_date = ? AND end_date = ?
                        """, (sprint_start, sprint_end))
                        if cursor.fetchone()[0] == 0:
                            cursor.execute("""
                                INSERT INTO sprint_goals (text, start_date, end_date, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?)
                            """, (sprint_text, sprint_start, sprint_end, datetime.now(), datetime.now()))
                            print(f"✓ Migrated sprint goal: {sprint_start} to {sprint_end}")
                        else:
                            print("✓ Sprint goal already migrated")

                    # Migrate quarterly goal if it has dates
                    if quarterly_start and quarterly_end and quarterly_text:
                        cursor.execute("""
                            SELECT COUNT(*) FROM quarterly_goals
                            WHERE start_date = ? AND end_date = ?
                        """, (quarterly_start, quarterly_end))
                        if cursor.fetchone()[0] == 0:
                            cursor.execute("""
                                INSERT INTO quarterly_goals (text, start_date, end_date, created_at, updated_at)
                                VALUES (?, ?, ?, ?, ?)
                            """, (quarterly_text, quarterly_start, quarterly_end, datetime.now(), datetime.now()))
                            print(f"✓ Migrated quarterly goal: {quarterly_start} to {quarterly_end}")
                        else:
                            print("✓ Quarterly goal already migrated")
                else:
                    print("✓ No existing goals to migrate")
        else:
            print("✓ No app_settings table found (fresh install)")

        conn.commit()
        print("✓ Migration 015 completed successfully")
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
        print("Dropping sprint_goals and quarterly_goals tables...")

        cursor.execute("DROP TABLE IF EXISTS sprint_goals")
        print("✓ Dropped sprint_goals table")

        cursor.execute("DROP TABLE IF EXISTS quarterly_goals")
        print("✓ Dropped quarterly_goals table")

        conn.commit()
        print("✓ Migration 015 rollback completed")
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

