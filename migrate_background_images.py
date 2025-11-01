#!/usr/bin/env python3
"""
Migration script to rename holiday-backgrounds to background-images
"""
import os
import json
import shutil
from pathlib import Path

OLD_DIR = Path("data/holiday-backgrounds")
NEW_DIR = Path("data/background-images")

def migrate():
    print("🔄 Migrating background images directory...")
    
    # Check if old directory exists
    if not OLD_DIR.exists():
        print("✅ No migration needed - old directory doesn't exist")
        return
    
    # Check if new directory already exists
    if NEW_DIR.exists():
        print("⚠️  New directory already exists")
        response = input("  Merge with existing? (y/N): ")
        if response.lower() != 'y':
            print("❌ Migration cancelled")
            return
    else:
        # Create new directory
        NEW_DIR.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created new directory: {NEW_DIR}")
    
    # Copy all files
    files_moved = 0
    for item in OLD_DIR.iterdir():
        if item.is_file():
            dest = NEW_DIR / item.name
            shutil.copy2(item, dest)
            files_moved += 1
            print(f"  📁 Copied: {item.name}")
    
    # Update metadata URLs if metadata.json exists
    metadata_file = NEW_DIR / "metadata.json"
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        # Update URLs
        for item in metadata:
            if 'url' in item:
                item['url'] = item['url'].replace('/api/holiday-backgrounds/', '/api/background-images/')
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Updated metadata URLs")
    
    print(f"\n✅ Migration complete! Moved {files_moved} files")
    print(f"   Old directory: {OLD_DIR}")
    print(f"   New directory: {NEW_DIR}")
    print(f"\n⚠️  To remove old directory, run: rm -rf {OLD_DIR}")

if __name__ == "__main__":
    migrate()
