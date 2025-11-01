# Database Migration Guide

This guide will help you upgrade your Track the Thing database to support new features.

## Latest Update: Title Field for Note Entries

**Version:** 001  
**Date:** 2025-10-30  
**Feature:** Added optional title field to note entries

### What Changed?

- Note entries now have an optional one-line title field displayed at the top of each card
- Existing entries will have an empty title by default
- The title is saved automatically as you type

### How to Upgrade

#### Option 1: Using Docker (Recommended)

If you're using Docker, migrations will run automatically when you restart the containers:

```bash
# Pull the latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d
```

The migration will run automatically on startup!

#### Option 2: Manual Migration (Local Development)

If you're running the backend locally without Docker:

```bash
# Navigate to the backend directory
cd backend

# Run migrations
python3 migrations/run_migrations.py
```

You should see output like:

```
============================================================
Running Database Migrations
============================================================

Found 1 migration(s):
  - 001_add_title_field.py

------------------------------------------------------------
Running migration: 001_add_title_field.py
------------------------------------------------------------
Connecting to database: /path/to/daily_notes.db
✓ Column 'title' already exists in note_entries table. Nothing to do.
✓ Migration 001_add_title_field.py completed successfully

============================================================
✓ All migrations completed successfully!
============================================================
```

#### Option 3: Manual SQL (Advanced Users)

If you prefer to run the migration manually:

```bash
# Connect to your database
sqlite3 backend/data/daily_notes.db

# Run this SQL command
ALTER TABLE note_entries ADD COLUMN title VARCHAR DEFAULT '';

# Exit sqlite3
.quit
```

### Verifying the Migration

After running the migration:

1. Open the daily-notes application in your browser
2. Create a new note entry or open an existing one
3. You should see a title input field at the top of each entry card
4. Try typing a title - it will save automatically

### Backup Your Data (Recommended)

Before running any migration, it's always a good idea to backup your database:

```bash
# Backup the database
cp backend/data/daily_notes.db backend/data/daily_notes.db.backup-$(date +%Y%m%d)
```

**Important:** After running the migration, create a new backup through the app's Settings page. The backup format has been updated to version 4.0 to include the new title field. Old backups (version 3.0) can still be restored, but they won't have title data.

### Label Management

The Settings page now includes a Label Management section where you can:
- View all your labels
- Delete labels you no longer need
- Deleting a label will automatically remove it from all associated notes and entries

The database uses CASCADE deletion, so removing a label is safe and won't leave orphaned references.

### Troubleshooting

#### Migration says "Database not found"

Make sure you're running the migration from the correct directory and that your database exists at one of these paths:
- `backend/data/daily_notes.db`
- `backend/daily_notes.db`

#### Migration fails with an error

1. Check that you have write permissions to the database file
2. Make sure the database isn't locked by another process
3. Try stopping the backend service first, then run the migration

#### Title field doesn't appear in the UI

1. Clear your browser cache
2. Do a hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check that the frontend has been rebuilt/restarted

### Rolling Back (If Needed)

If you need to remove the title field:

```bash
cd backend
python3 migrations/001_add_title_field.py down
```

**Note:** This will delete all title data from your entries.

## Future Migrations

As new features are added, new migrations will be created. Always run `migrations/run_migrations.py` to apply all pending migrations.

## Getting Help

If you encounter issues:
1. Check the migration logs for error messages
2. Verify your database backup is safe
3. Check the GitHub issues for similar problems
4. Create a new issue with the error details

