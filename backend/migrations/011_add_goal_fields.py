#!/usr/bin/env python3
"""
Migration: Add sprint_goals and quarterly_goals fields to daily_notes table
Version: 011
Date: 2025-11-06

This migration adds 'sprint_goals' and 'quarterly_goals' columns to the daily_notes table
to allow users to track sprint and quarterly objectives.
"""

import sqlite3
import sys
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
        # Check and add sprint_goals column
        if not column_exists(cursor, 'daily_notes', 'sprint_goals'):
            print("Adding 'sprint_goals' column to daily_notes table...")
            cursor.execute("""
                ALTER TABLE daily_notes 
                ADD COLUMN sprint_goals TEXT DEFAULT ''
            """)
            print("✓ Successfully added 'sprint_goals' column")
        else:
            print("✓ Column 'sprint_goals' already exists. Skipping.")
        
        # Check and add quarterly_goals column
        if not column_exists(cursor, 'daily_notes', 'quarterly_goals'):
            print("Adding 'quarterly_goals' column to daily_notes table...")
            cursor.execute("""
                ALTER TABLE daily_notes 
                ADD COLUMN quarterly_goals TEXT DEFAULT ''
            """)
            print("✓ Successfully added 'quarterly_goals' column")
        else:
            print("✓ Column 'quarterly_goals' already exists. Skipping.")
        
        conn.commit()
        print("✓ Migration completed successfully")
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
        print("Note: SQLite requires recreating the table to remove columns.")
        print("This migration will preserve all existing data.")
        
        # Get current table structure
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_notes'")
        result = cursor.fetchone()
        if not result:
            print("✓ Table 'daily_notes' does not exist. Nothing to do.")
            return True
        
        # Create backup with only the columns we want to keep
        cursor.execute("""
            CREATE TABLE daily_notes_backup AS 
            SELECT id, date, fire_rating, daily_goal, created_at, updated_at
            FROM daily_notes
        """)
        
        # Drop original table
        cursor.execute("DROP TABLE daily_notes")
        
        # Recreate table without sprint_goals and quarterly_goals
        cursor.execute("""
            CREATE TABLE daily_notes (
                id INTEGER NOT NULL, 
                date VARCHAR NOT NULL, 
                fire_rating INTEGER DEFAULT 0, 
                daily_goal TEXT DEFAULT '', 
                created_at DATETIME, 
                updated_at DATETIME, 
                PRIMARY KEY (id), 
                UNIQUE (date)
            )
        """)
        
        # Restore data
        cursor.execute("""
            INSERT INTO daily_notes 
            SELECT * FROM daily_notes_backup
        """)
        
        # Drop backup
        cursor.execute("DROP TABLE daily_notes_backup")
        
        # Recreate indexes
        cursor.execute("CREATE INDEX ix_daily_notes_id ON daily_notes (id)")
        cursor.execute("CREATE INDEX ix_daily_notes_date ON daily_notes (date)")
        
        conn.commit()
        print("✓ Successfully removed goal fields from daily_notes table")
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
        print("Running migration: Add goal fields to daily_notes")
        success = migrate_up(db_path)
    elif command == "down":
        print("Rolling back migration: Remove goal fields from daily_notes")
        success = migrate_down(db_path)
    else:
        print(f"Unknown command: {command}")
        print("Usage: python 011_add_goal_fields.py [up|down]")
        sys.exit(1)
    
    if success:
        print("\nMigration completed successfully!")
        sys.exit(0)
    else:
        print("\nMigration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

