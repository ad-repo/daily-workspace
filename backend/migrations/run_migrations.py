#!/usr/bin/env python3
"""
Run all pending database migrations.

This script executes all migration files in order.
"""

import importlib.util
import os
import sys
from pathlib import Path


def get_db_path_from_env():
    """
    Get the database path from DATABASE_URL environment variable.
    Falls back to default paths if not set.
    """
    database_url = os.getenv('DATABASE_URL', '')

    if database_url:
        # Extract path from SQLite URL (format: sqlite:///./path/to/db.db)
        if database_url.startswith('sqlite:///'):
            db_path = database_url.replace('sqlite:///', '')
            # Handle relative paths starting with ./
            if db_path.startswith('./'):
                db_path = db_path[2:]
            return Path(db_path)

    # Fallback to default paths
    possible_paths = [
        Path("/app/data/daily_notes.db"),  # Docker container path
        Path(__file__).parent.parent / "data" / "daily_notes.db",
        Path.cwd() / "data" / "daily_notes.db",
    ]

    for path in possible_paths:
        if path.exists():
            return path

    # Return first path as default if none exist
    return possible_paths[0]


def load_migration(migration_file):
    """Dynamically load a migration module."""
    spec = importlib.util.spec_from_file_location(
        migration_file.stem,
        migration_file
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def get_migration_files():
    """Get all migration files in order."""
    migrations_dir = Path(__file__).parent
    migration_files = sorted(migrations_dir.glob("[0-9][0-9][0-9]_*.py"))
    return migration_files


def main():
    """Run all migrations."""
    print("=" * 60)
    print("Running Database Migrations")
    print("=" * 60)
    print()

    # Get database path from environment
    db_path = get_db_path_from_env()
    print(f"Database: {db_path}")
    print()

    migration_files = get_migration_files()

    if not migration_files:
        print("No migration files found.")
        return 0

    print(f"Found {len(migration_files)} migration(s):")
    for mf in migration_files:
        print(f"  - {mf.name}")
    print()

    failed_migrations = []

    for migration_file in migration_files:
        print("-" * 60)
        print(f"Running migration: {migration_file.name}")
        print("-" * 60)

        try:
            migration = load_migration(migration_file)
            # Use the common db_path instead of calling migration.get_db_path()
            success = migration.migrate_up(db_path)

            if not success:
                failed_migrations.append(migration_file.name)
                print(f"✗ Migration {migration_file.name} failed!")
            else:
                print(f"✓ Migration {migration_file.name} completed successfully")

        except Exception as e:
            failed_migrations.append(migration_file.name)
            print(f"✗ Error running migration {migration_file.name}: {e}")

        print()

    print("=" * 60)
    if failed_migrations:
        print(f"✗ {len(failed_migrations)} migration(s) failed:")
        for name in failed_migrations:
            print(f"  - {name}")
        print("=" * 60)
        return 1
    else:
        print("✓ All migrations completed successfully!")
        print("=" * 60)
        return 0


if __name__ == "__main__":
    sys.exit(main())

