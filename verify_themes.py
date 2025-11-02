#!/usr/bin/env python3
"""
Verify theme consistency in ThemeContext.tsx

Checks:
1. No duplicate theme keys
2. All theme keys match their IDs
3. All themes have required properties

Usage:
    python verify_themes.py
"""
import re
import sys

def main():
    print("🔍 Verifying theme consistency...\n")
    
    with open('frontend/src/contexts/ThemeContext.tsx', 'r') as f:
        content = f.read()

    # Extract the themes object
    match = re.search(r'export const themes: Record<string, Theme> = \{(.*?)\n\};', content, re.DOTALL)
    if not match:
        print('❌ Could not find themes object')
        return 1

    themes_content = match.group(1)

    # Check 1: Find all theme keys
    print("📋 Checking for duplicate keys...")
    keys = re.findall(r'^  (\w+):\s*\{', themes_content, re.MULTILINE)
    duplicates = [key for key in set(keys) if keys.count(key) > 1]
    
    if duplicates:
        print(f"❌ Found duplicate keys: {', '.join(duplicates)}")
        return 1
    else:
        print(f"✅ No duplicates found ({len(keys)} unique themes)\n")

    # Check 2: Verify keys match IDs
    print("🔑 Checking key-ID consistency...")
    pattern = r'(\w+):\s*\{\s*id:\s*[\'"](\w+)[\'"]'
    mismatches = []

    for match in re.finditer(pattern, themes_content):
        key = match.group(1)
        theme_id = match.group(2)
        
        if key != theme_id:
            mismatches.append((key, theme_id))

    if mismatches:
        print("❌ Found key-ID mismatches:")
        for key, theme_id in mismatches:
            print(f"   Key: '{key}' -> ID: '{theme_id}'")
        return 1
    else:
        print(f"✅ All keys match their IDs\n")

    # Check 3: Verify all themes have required properties
    print("🎨 Checking theme structure...")
    required_props = ['id', 'name', 'description', 'colors']
    incomplete_themes = []
    
    for key in keys:
        theme_block = re.search(
            rf'{key}:\s*\{{(.*?)\n  \}},?\n', 
            themes_content, 
            re.DOTALL
        )
        if theme_block:
            theme_text = theme_block.group(1)
            missing = [prop for prop in required_props if prop not in theme_text]
            if missing:
                incomplete_themes.append((key, missing))
    
    if incomplete_themes:
        print("❌ Found incomplete themes:")
        for key, missing in incomplete_themes:
            print(f"   Theme '{key}' missing: {', '.join(missing)}")
        return 1
    else:
        print(f"✅ All themes have required properties\n")

    print("=" * 50)
    print("🎉 All checks passed!")
    print(f"   Total themes: {len(keys)}")
    print(f"   No duplicates: ✓")
    print(f"   Keys match IDs: ✓")
    print(f"   All properties present: ✓")
    print("=" * 50)
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

