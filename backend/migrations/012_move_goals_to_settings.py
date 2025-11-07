#!/usr/bin/env python3
"""
Migration: Move sprint and quarterly goals to app_settings table
Version: 012
Date: 2025-11-06

This migration:
1. Creates app_settings table for persistent goals
2. Migrates existing sprint_goals and quarterly_goals from daily_notes (taking the most recent)
3. Removes sprint_goals and quarterly_goals columns from daily_notes
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


def table_exists(cursor, table_name):
    """Check if a table exists."""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
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
        # Step 1: Create app_settings table if it doesn't exist
        if not table_exists(cursor, 'app_settings'):
            print("Creating app_settings table...")
            cursor.execute("""
                CREATE TABLE app_settings (
                    id INTEGER PRIMARY KEY,
                    sprint_goals TEXT DEFAULT '',
                    quarterly_goals TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✓ Created app_settings table")
        else:
            print("✓ app_settings table already exists")
        
        # Step 2: Migrate data from daily_notes to app_settings
        # Get the most recent non-empty sprint_goals and quarterly_goals
        cursor.execute("""
            SELECT sprint_goals, quarterly_goals 
            FROM daily_notes 
            WHERE sprint_goals != '' OR quarterly_goals != ''
            ORDER BY date DESC 
            LIMIT 1
        """)
        row = cursor.fetchone()
        
        if row:
            sprint_goals, quarterly_goals = row
            print(f"Found existing goals to migrate: sprint='{sprint_goals[:50]}...', quarterly='{quarterly_goals[:50]}...'")
        else:
            sprint_goals, quarterly_goals = '', ''
            print("No existing goals found to migrate")
        
        # Insert or update app_settings (ensure only one row exists)
        cursor.execute("SELECT COUNT(*) FROM app_settings")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Inserting goals into app_settings...")
            cursor.execute("""
                INSERT INTO app_settings (id, sprint_goals, quarterly_goals)
                VALUES (1, ?, ?)
            """, (sprint_goals, quarterly_goals))
            print("✓ Migrated goals to app_settings")
        else:
            print("✓ app_settings already has data, skipping migration")
        
        # Step 3: Remove sprint_goals and quarterly_goals from daily_notes
        if column_exists(cursor, 'daily_notes', 'sprint_goals') or column_exists(cursor, 'daily_notes', 'quarterly_goals'):
            print("Removing goal columns from daily_notes table...")
            print("Note: This requires recreating the table.")
            
            # Drop backup table if it exists from a previous failed run
            cursor.execute("DROP TABLE IF EXISTS daily_notes_backup")
            
            # Create backup of daily_notes
            cursor.execute("""
                CREATE TABLE daily_notes_backup AS 
                SELECT id, date, fire_rating, daily_goal, created_at, updated_at
                FROM daily_notes
            """)
            
            # Get all label associations if the table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='note_labels'")
            note_labels_exists = cursor.fetchone() is not None
            
            if note_labels_exists:
                cursor.execute("SELECT note_id, label_id FROM note_labels WHERE note_id IN (SELECT id FROM daily_notes)")
                note_labels_data = cursor.fetchall()
            else:
                note_labels_data = []
            
            # Drop original table
            cursor.execute("DROP TABLE daily_notes")
            
            # Recreate table without sprint/quarterly goals
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
            
            # Restore label associations
            if note_labels_data:
                for note_id, label_id in note_labels_data:
                    cursor.execute("INSERT INTO note_labels (note_id, label_id) VALUES (?, ?)", 
                                 (note_id, label_id))
            
            print("✓ Removed goal columns from daily_notes table")
        else:
            print("✓ Goal columns already removed from daily_notes")
        
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
        print("Rolling back migration...")
        print("Note: This will add sprint_goals and quarterly_goals back to daily_notes")
        
        # Get current goals from app_settings
        cursor.execute("SELECT sprint_goals, quarterly_goals FROM app_settings WHERE id = 1")
        row = cursor.fetchone()
        sprint_goals, quarterly_goals = row if row else ('', '')
        
        # Add columns back to daily_notes if they don't exist
        if not column_exists(cursor, 'daily_notes', 'sprint_goals'):
            cursor.execute("ALTER TABLE daily_notes ADD COLUMN sprint_goals TEXT DEFAULT ''")
            print("✓ Added sprint_goals column back to daily_notes")
        
        if not column_exists(cursor, 'daily_notes', 'quarterly_goals'):
            cursor.execute("ALTER TABLE daily_notes ADD COLUMN quarterly_goals TEXT DEFAULT ''")
            print("✓ Added quarterly_goals column back to daily_notes")
        
        # Update all daily_notes with the saved goals
        if sprint_goals or quarterly_goals:
            cursor.execute("UPDATE daily_notes SET sprint_goals = ?, quarterly_goals = ?", 
                         (sprint_goals, quarterly_goals))
            print(f"✓ Restored goals to all daily_notes")
        
        # Drop app_settings table
        if table_exists(cursor, 'app_settings'):
            cursor.execute("DROP TABLE app_settings")
            print("✓ Dropped app_settings table")
        
        conn.commit()
        print("✓ Rollback completed successfully")
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
        print("Running migration: Move goals to app_settings")
        success = migrate_up(db_path)
    elif command == "down":
        print("Rolling back migration: Move goals back to daily_notes")
        success = migrate_down(db_path)
    else:
        print(f"Unknown command: {command}")
        print("Usage: python 012_move_goals_to_settings.py [up|down]")
        sys.exit(1)
    
    if success:
        print("\nMigration completed successfully!")
        sys.exit(0)
    else:
        print("\nMigration failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

