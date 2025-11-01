# Backward Compatibility & Data Safety

## ✅ Migration Safety Guarantees

### Current Version: 4.0

This version is **100% backward compatible** with older installations.

## Migration Safety

### The `title` Field Migration (001)

**✅ SAFE TO RUN** - This migration is:

1. **Idempotent**: Can be run multiple times safely
   - Checks if `title` column exists before adding it
   - Returns success if already applied
   - No data loss if run twice

2. **Non-Destructive**: Only adds, never removes
   - Adds `title VARCHAR DEFAULT ''` to `note_entries`
   - Existing columns unchanged
   - All existing data preserved
   - Default empty string for new column

3. **Zero Data Loss**: 
   - No data deletion
   - No data modification
   - Only adds new optional field

### Running on Older Databases

```bash
# From v3.0 → v4.0
python migrations/run_migrations.py
```

**Result:**
- Adds title column to note_entries
- All existing entries have empty titles
- All other data unchanged
- Ready to use immediately

## Backup/Restore Compatibility

### Import Matrix

| Backup Version | Current Version | Compatible? | Notes |
|----------------|----------------|-------------|-------|
| v1.0 (tags)    | v4.0           | ✅ Yes      | Tags imported as labels |
| v2.0           | v4.0           | ✅ Yes      | Direct import |
| v3.0           | v4.0           | ✅ Yes      | Titles default to empty |
| v4.0           | v4.0           | ✅ Yes      | Full fidelity |

### Backward Compatibility Features

1. **Old Field Names Supported**
   ```json
   // v1.0 used "tags" - still works
   { "tags": [...] }  // Maps to "labels"
   
   // v4.0 uses "labels"
   { "labels": [...] }
   ```

2. **Missing Fields Handled**
   ```python
   # Import handles missing title gracefully
   title=entry_data.get("title", "")  # Defaults to empty
   ```

3. **Version Check**
   ```python
   # Import validates but accepts all versions
   if "version" not in data:
       # Still imports, treats as v1.0
   ```

## Data Safety Checklist

### Before Upgrading

- [x] ✅ Migration is idempotent
- [x] ✅ Migration checks existing schema
- [x] ✅ No destructive operations
- [x] ✅ Backup system works
- [x] ✅ Import handles old formats
- [x] ✅ Default values for new fields

### Upgrade Process (Zero Downtime)

1. **Backup Current Database**
   ```bash
   cp backend/data/daily_notes.db backend/data/daily_notes.db.backup
   ```

2. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

3. **Run Migrations**
   ```bash
   # Option 1: Manual
   python backend/migrations/run_migrations.py
   
   # Option 2: Docker (automatic)
   docker-compose down
   docker-compose up -d
   ```

4. **Verify**
   - Check Settings page loads
   - Create a test entry with title
   - View existing entries (titles empty)

5. **Create New Backup**
   - Settings → Export Data (v4.0 format)

## Rollback Plan

If you need to rollback (shouldn't be necessary):

### Option 1: Restore from Backup
```bash
# Stop services
docker-compose down

# Restore old database
cp backend/data/daily_notes.db.backup backend/data/daily_notes.db

# Start services
docker-compose up -d
```

### Option 2: Remove Title Column
```bash
# Run migration rollback
python backend/migrations/001_add_title_field.py down
```

**Note**: Only rollback if you haven't used titles. Rollback deletes title data.

## Import Testing

### Test Case 1: v3.0 Backup → v4.0
```json
{
  "version": "3.0",
  "notes": [{
    "entries": [{
      "content": "Test",
      // "title" field missing - this is OK
    }]
  }]
}
```
**Result**: ✅ Imports successfully, title defaults to ""

### Test Case 2: v4.0 Backup → v4.0
```json
{
  "version": "4.0",
  "notes": [{
    "entries": [{
      "title": "My Title",
      "content": "Test"
    }]
  }]
}
```
**Result**: ✅ Imports with full fidelity

## Common Questions

### Q: Will I lose data upgrading from v3.0?
**A**: No. The migration only adds a column. All existing data is preserved.

### Q: Can I restore a v3.0 backup to v4.0?
**A**: Yes. The import system handles missing title fields automatically.

### Q: What if the migration fails?
**A**: The migration checks for the column first. If it fails mid-operation, it rolls back. Your original database is unchanged.

### Q: Can I run migrations multiple times?
**A**: Yes. The migration checks if title column exists. If it does, it skips and reports success.

### Q: Do I need to backup before migrating?
**A**: Recommended but not required. The migration is safe, but backups are best practice.

### Q: Will old backups stop working?
**A**: No. All backup versions from v1.0+ work. They import with sensible defaults for missing fields.

## Production Upgrade Steps

1. **Create Backup** (via Settings → Export Data)
2. **Update Code** (`git pull`)
3. **Restart Services** (`docker-compose restart`)
4. **Migrations Run Automatically** (on startup)
5. **Verify** (check Settings page)
6. **Create New Backup** (v4.0 format)

**Total Downtime**: ~10-30 seconds (Docker restart)
**Data Loss Risk**: None (migration is additive only)
**Rollback Time**: <1 minute (restore backup)

## Support

If you encounter issues:
1. Check migration logs: `docker-compose logs backend`
2. Verify database: `sqlite3 backend/data/daily_notes.db ".schema note_entries"`
3. Restore from backup if needed
4. Open GitHub issue with error details

## Summary

✅ **Safe**: Migration only adds, never deletes
✅ **Tested**: Idempotent and backward compatible  
✅ **Recoverable**: Backup/restore fully functional
✅ **Documented**: Clear upgrade path provided
✅ **Zero Data Loss**: All existing data preserved

