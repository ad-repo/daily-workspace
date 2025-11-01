# 📦 Complete Backup & Restore Guide

**Track the Thing** - Full Machine Migration System

## Overview

Track the Thing provides a comprehensive backup and restore system that ensures you can completely migrate your workspace from one machine to another with **zero data loss**.

## 🎯 What Gets Backed Up?

### 1. JSON Backup File (Data)
Contains all your workspace data:
- ✅ **Daily Notes** - All your notes with dates, fire ratings, and goals
- ✅ **Note Entries** - Every entry with titles, content, timestamps
- ✅ **Labels** - All your labels with names, colors, and metadata
- ✅ **Entry Labels** - Label associations for each entry
- ✅ **Note Labels** - Label associations for each daily note
- ✅ **Search History** - Your complete search history
- ✅ **Timestamps** - Created/updated dates preserved exactly
- ✅ **Metadata** - Order indices, flags (important, completed, dev-null, report)
- ✅ **File References** - URLs to uploaded images and attachments

**Backup Version:** 4.0 (compatible with v1.0-v4.0)

### 2. ZIP Files Archive (Attachments)
Contains all uploaded files:
- ✅ **Images** - All uploaded images (JPG, PNG, GIF, WebP)
- ✅ **Attachments** - Any files you've uploaded
- ✅ **Original Filenames** - Files are stored with UUID names but references are preserved

## 🚀 How to Use

### Export Your Data (Machine A)

1. **Navigate to Settings** in Track the Thing
2. **Export Data:**
   - Choose format: **JSON** (for backup) or **Markdown** (for LLM analysis)
   - Click "Export Data"
   - Save the JSON file: `track-the-thing-backup-YYYYMMDD-HHMMSS.json`

3. **Export Attachments:**
   - Click "Export Files (ZIP)" in the Attachments section
   - Save the ZIP file: `track-the-thing-files-YYYYMMDD-HHMMSS.zip`

### Full Restore (Machine B) - ⭐ RECOMMENDED

**One-click complete restore:**

1. **Navigate to Settings** on the new machine
2. **Find "Full Restore (Recommended)"** section (purple card)
3. **Upload both files:**
   - Step 1: Choose your JSON backup file
   - Step 2: Choose your ZIP files archive
4. **Click "Restore Everything"**
5. **Done!** All your data and files are restored

**What happens during Full Restore:**
- ✅ Imports all notes, entries, labels, and metadata
- ✅ Restores all label associations
- ✅ Preserves all timestamps and relationships
- ✅ Extracts all uploaded files to the correct location
- ✅ Skips duplicate labels and files (safe to run multiple times)
- ✅ File references in your entries automatically work

### Individual Restore (Alternative)

If you prefer to restore data and files separately:

1. **Restore Data Only:**
   - Click "Choose JSON File" under "Restore Data Only"
   - Select your JSON backup file
   - Click to upload

2. **Restore Files Only:**
   - Click "Restore Files (ZIP)" under "Attachments"
   - Select your ZIP archive
   - Click to upload

**Note:** For a complete migration, you must restore both data and files.

## 🔒 Data Safety Guarantees

### Import Safety
- **Non-destructive by default:** Existing data is preserved
- **Smart deduplication:** Labels with matching names won't be duplicated
- **Skip mode:** Existing daily notes are skipped unless replace flag is set
- **Rollback on error:** Database transactions ensure all-or-nothing imports
- **File safety:** Existing files are never overwritten during restore

### Backward Compatibility
- ✅ **v1.0 backups** - Supported (no title field)
- ✅ **v2.0 backups** - Supported (no dev-null field)
- ✅ **v3.0 backups** - Supported (no title field)
- ✅ **v4.0 backups** - Current version (includes title field)

All older backup versions are automatically upgraded during import.

### What's Preserved
- 📅 **Timestamps** - Created/updated dates remain unchanged
- 🔢 **IDs** - Internal references are automatically remapped
- 🔗 **Relationships** - All label associations are maintained
- 📎 **File References** - Image URLs continue to work after restore
- 🎨 **Formatting** - Rich text and code entries preserved exactly
- 🏷️ **Metadata** - Fire ratings, goals, flags all preserved

## 📊 Export Formats

### JSON Export (v4.0)
**Purpose:** Complete backup for restore  
**Use Case:** Machine migration, disaster recovery, archival

**Structure:**
```json
{
  "version": "4.0",
  "exported_at": "2025-10-31T12:00:00Z",
  "search_history": [...],
  "labels": [...],
  "notes": [
    {
      "date": "2025-10-31",
      "fire_rating": 3,
      "daily_goal": "Complete project",
      "entries": [
        {
          "title": "Entry Title",
          "content": "<p>Rich text content</p>",
          "content_type": "rich_text",
          "labels": [1, 2, 3],
          "created_at": "2025-10-31T10:00:00Z",
          ...
        }
      ],
      "labels": [1, 2]
    }
  ]
}
```

### Markdown Export
**Purpose:** Human-readable, LLM-friendly format  
**Use Case:** Analysis, sharing, documentation, AI processing

**Structure:**
```markdown
# Track the Thing Export
Export Date: October 31, 2025

## 2025-10-31 (🔥🔥🔥)
**Daily Goal:** Complete project

### Entry Title
Labels: 🏷️ work, 🏷️ important

Rich text content here...
```

## 🛠️ Technical Details

### File Storage
- **Location:** `data/uploads/` directory
- **Naming:** Files are stored with UUID-based names (e.g., `abc-123-def.png`)
- **References:** Entry content contains URLs like `/api/uploads/files/abc-123-def.png`
- **Restore:** Files are extracted with their UUID names preserved
- **Result:** All image and file links in your entries work immediately after restore

### Database Schema
- **SQLite database** with automatic migrations
- **Cascade deletion** for labels (removing label cleans up associations)
- **Foreign key constraints** ensure data integrity
- **Migration system** handles schema changes automatically

### API Endpoints

#### Export
- `GET /api/backup/export` - Export JSON backup (v4.0)
- `GET /api/backup/export-markdown` - Export Markdown format
- `GET /api/uploads/download-all` - Download all files as ZIP

#### Restore
- `POST /api/backup/import` - Import JSON backup (data only)
- `POST /api/uploads/restore-files` - Restore files from ZIP
- `POST /api/backup/full-restore` - Full restore (data + files in one call)

## 💡 Best Practices

### Regular Backups
1. **Export both files** (JSON + ZIP) regularly
2. **Store in multiple locations** (cloud storage, external drive)
3. **Test restore** periodically on a development machine
4. **Keep old backups** for historical data recovery

### Machine Migration
1. **Install Track the Thing** on the new machine
2. **Start containers** to create the database structure
3. **Use Full Restore** to import everything at once
4. **Verify** that images display correctly in your entries
5. **Continue working** - you're fully migrated!

### Troubleshooting

**Images not showing after restore:**
- Ensure you restored the ZIP files archive
- Check that files were extracted to `data/uploads/`
- Verify the backend container has access to this directory

**Import fails with "Invalid JSON":**
- Verify the file is a valid JSON backup (not Markdown)
- Check the file wasn't corrupted during transfer
- Ensure you selected the right file format

**Duplicate labels:**
- Labels with matching names are automatically deduplicated
- New labels are created only if the name doesn't exist

**Want to replace existing data:**
- The `replace` flag (advanced) allows overwriting existing notes
- **Use with caution** - this is destructive
- Default behavior is safe (skip existing notes)

## 🎉 Success Indicators

After a successful restore, you should see:
- ✅ All your daily notes appear in the calendar
- ✅ All entries display with correct titles and content
- ✅ Images and attachments load properly
- ✅ Labels are applied to the correct entries and notes
- ✅ Search history is populated
- ✅ Timestamps match your original data

## 📞 Support

If you encounter any issues with backup or restore:
1. Check the browser console for error messages
2. Check Docker logs: `docker-compose logs backend`
3. Verify file permissions on `data/uploads/` directory
4. Ensure both containers are running
5. Review this guide for common troubleshooting steps

---

**Last Updated:** October 31, 2025  
**Backup Version:** 4.0  
**Application:** Track the Thing 🎯

