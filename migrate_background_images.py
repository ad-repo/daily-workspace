#!/usr/bin/env python3
"""
Migration script to rename holiday-backgrounds to background-images

This script migrates data from the old directory structure to the new one.
Safe to run multiple times - will skip if already migrated.

Usage:
    python migrate_background_images.py
"""
import os
import json
import shutil
from pathlib import Path

OLD_DIR = Path("data/holiday-backgrounds")
NEW_DIR = Path("data/background-images")

def migrate():
    print("=" * 60)
    print("Background Images Directory Migration")
    print("=" * 60)
    print()
    
    # Check if old directory exists
    if not OLD_DIR.exists():
        print("✅ No migration needed")
        print(f"   Old directory not found: {OLD_DIR}")
        print()
        return
    
    print(f"📁 Found old directory: {OLD_DIR}")
    
    # Count files in old directory
    old_files = [f for f in OLD_DIR.iterdir() if f.is_file()]
    print(f"   Contains {len(old_files)} file(s)")
    print()
    
    # Check if new directory already exists
    if NEW_DIR.exists():
        print(f"⚠️  New directory already exists: {NEW_DIR}")
        new_files = [f for f in NEW_DIR.iterdir() if f.is_file()]
        print(f"   Contains {len(new_files)} file(s)")
        print()
        
        response = input("   Merge directories? This will copy missing files. (y/N): ")
        if response.lower() != 'y':
            print()
            print("❌ Migration cancelled by user")
            print()
            return
        print()
    else:
        # Create new directory
        NEW_DIR.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created new directory: {NEW_DIR}")
        print()
    
    # Copy all files
    files_copied = 0
    files_skipped = 0
    
    print("📋 Copying files...")
    for item in OLD_DIR.iterdir():
        if item.is_file():
            dest = NEW_DIR / item.name
            if dest.exists():
                print(f"   ⏭️  Skipped (exists): {item.name}")
                files_skipped += 1
            else:
                shutil.copy2(item, dest)
                print(f"   ✅ Copied: {item.name}")
                files_copied += 1
    
    print()
    
    # Update metadata URLs if metadata.json exists
    metadata_file = NEW_DIR / "metadata.json"
    if metadata_file.exists():
        print("📝 Updating metadata.json...")
        
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        urls_updated = 0
        
        # Update URLs
        for item in metadata:
            if 'url' in item and '/api/holiday-backgrounds/' in item['url']:
                old_url = item['url']
                item['url'] = item['url'].replace('/api/holiday-backgrounds/', '/api/background-images/')
                print(f"   ✅ Updated URL: {old_url} → {item['url']}")
                urls_updated += 1
        
        if urls_updated > 0:
            # Backup original metadata
            backup_file = NEW_DIR / "metadata.json.backup"
            shutil.copy2(metadata_file, backup_file)
            print(f"   💾 Created backup: {backup_file.name}")
            
            # Save updated metadata
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"   ✅ Updated {urls_updated} URL(s) in metadata")
        else:
            print(f"   ℹ️  No URLs needed updating")
        
        print()
    
    # Summary
    print("=" * 60)
    print("Migration Summary")
    print("=" * 60)
    print(f"✅ Files copied: {files_copied}")
    if files_skipped > 0:
        print(f"⏭️  Files skipped: {files_skipped}")
    print()
    print(f"Old directory: {OLD_DIR}")
    print(f"New directory: {NEW_DIR}")
    print()
    
    if files_copied > 0 or files_skipped > 0:
        print("⚠️  IMPORTANT:")
        print(f"   The old directory still exists: {OLD_DIR}")
        print(f"   After verifying everything works, you can remove it:")
        print(f"   rm -rf {OLD_DIR}")
        print()
    
    print("✅ Migration complete!")
    print()

if __name__ == "__main__":
    try:
        migrate()
    except KeyboardInterrupt:
        print()
        print()
        print("❌ Migration cancelled by user (Ctrl+C)")
        print()
    except Exception as e:
        print()
        print(f"❌ Error during migration: {e}")
        print()
        import traceback
        traceback.print_exc()
        print()

