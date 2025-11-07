"""
Migration 013: Add date fields to app_settings for sprint and quarterly goals tracking

Adds:
- sprint_start_date
- sprint_end_date
- quarterly_start_date
- quarterly_end_date
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


def migrate_up(db_path):
    """Apply the migration"""
    print(f"Connecting to database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Warning: Database not found at {db_path}")
        print("Migration will be applied when the database is created.")
        return True
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Adding date fields to app_settings table...")
        
        # Check if columns already exist before adding them
        if not column_exists(cursor, 'app_settings', 'sprint_start_date'):
            cursor.execute("""
                ALTER TABLE app_settings 
                ADD COLUMN sprint_start_date TEXT DEFAULT ''
            """)
            print("✓ Added sprint_start_date")
        else:
            print("✓ sprint_start_date already exists")
        
        if not column_exists(cursor, 'app_settings', 'sprint_end_date'):
            cursor.execute("""
                ALTER TABLE app_settings 
                ADD COLUMN sprint_end_date TEXT DEFAULT ''
            """)
            print("✓ Added sprint_end_date")
        else:
            print("✓ sprint_end_date already exists")
        
        if not column_exists(cursor, 'app_settings', 'quarterly_start_date'):
            cursor.execute("""
                ALTER TABLE app_settings 
                ADD COLUMN quarterly_start_date TEXT DEFAULT ''
            """)
            print("✓ Added quarterly_start_date")
        else:
            print("✓ quarterly_start_date already exists")
        
        if not column_exists(cursor, 'app_settings', 'quarterly_end_date'):
            cursor.execute("""
                ALTER TABLE app_settings 
                ADD COLUMN quarterly_end_date TEXT DEFAULT ''
            """)
            print("✓ Added quarterly_end_date")
        else:
            print("✓ quarterly_end_date already exists")
        
        conn.commit()
        print("✓ Date fields migration completed successfully")
        return True
        
    except Exception as e:
        print(f"✗ Error adding date fields: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def migrate_down(db_path):
    """Reverse the migration"""
    print(f"Connecting to database: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"Warning: Database not found at {db_path}")
        return True
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Removing date fields from app_settings table...")
        
        # SQLite doesn't support DROP COLUMN, so we need to recreate the table
        # Get existing data
        cursor.execute("""
            SELECT id, sprint_goals, quarterly_goals, created_at, updated_at
            FROM app_settings
        """)
        existing_data = cursor.fetchall()
        
        # Drop and recreate table without the date fields
        cursor.execute("DROP TABLE IF EXISTS app_settings_backup")
        cursor.execute("""
            CREATE TABLE app_settings_backup (
                id INTEGER PRIMARY KEY,
                sprint_goals TEXT DEFAULT '',
                quarterly_goals TEXT DEFAULT '',
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        """)
        
        # Copy data
        for row in existing_data:
            cursor.execute("""
                INSERT INTO app_settings_backup 
                (id, sprint_goals, quarterly_goals, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, row)
        
        # Replace table
        cursor.execute("DROP TABLE app_settings")
        cursor.execute("ALTER TABLE app_settings_backup RENAME TO app_settings")
        
        conn.commit()
        print("✓ Date fields removed successfully")
        return True
        
    except Exception as e:
        print(f"✗ Error removing date fields: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def main():
    """Run the migration manually"""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    print(f"Running migration 013 on {db_path}")
    
    success = migrate_up(db_path)
    
    if success:
        print("✅ Migration 013 completed successfully")
    else:
        print("❌ Migration 013 failed")


if __name__ == "__main__":
    main()

