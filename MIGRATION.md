# Background Images Migration Guide

## Overview

If you're upgrading from an older version that used the `holiday-backgrounds` directory structure, you'll need to migrate your images to the new `background-images` directory.

## When to Run This

Run this migration if:
- You have existing background images in `data/holiday-backgrounds/`
- You're upgrading from a version before the rename
- Your background images aren't showing up after upgrade

## How to Run

1. **Stop the application** (optional but recommended):
   ```bash
   docker-compose down
   ```

2. **Run the migration script**:
   ```bash
   python migrate_background_images.py
   ```

3. **Verify the migration**:
   - Check that files were copied to `data/background-images/`
   - Check that metadata.json was updated (a backup is created)

4. **Start the application**:
   ```bash
   docker-compose up -d
   ```

5. **Test in browser**:
   - Go to Settings → Background Images
   - Verify your images are still there
   - Test that they display correctly

6. **Clean up** (after verifying everything works):
   ```bash
   rm -rf data/holiday-backgrounds/
   ```

## What the Script Does

1. ✅ Checks if old directory exists
2. ✅ Creates new directory if needed
3. ✅ Copies all image files (preserving metadata)
4. ✅ Updates API URLs in metadata.json
5. ✅ Creates backup of metadata.json
6. ✅ Safe to run multiple times (skips existing files)
7. ✅ Preserves original directory until you manually delete it

## Troubleshooting

### "No migration needed"
- This means you don't have any old images to migrate
- You're either on a fresh install or already migrated

### "New directory already exists"
- The script will ask if you want to merge
- Choose 'y' to copy missing files
- Choose 'n' to cancel

### Images not showing after migration
1. Check file permissions: `ls -la data/background-images/`
2. Check metadata.json has correct URLs
3. Check browser console for errors
4. Restart backend: `docker-compose restart backend`

## Manual Migration (Alternative)

If you prefer to migrate manually:

```bash
# Create new directory
mkdir -p data/background-images

# Copy all files
cp -r data/holiday-backgrounds/* data/background-images/

# Edit metadata.json and replace:
# /api/holiday-backgrounds/ → /api/background-images/

# Restart services
docker-compose restart
```

## Support

If you encounter issues, check:
- Docker logs: `docker-compose logs backend`
- Backend is running: `docker-compose ps`
- Metadata file is valid JSON: `cat data/background-images/metadata.json | python -m json.tool`

