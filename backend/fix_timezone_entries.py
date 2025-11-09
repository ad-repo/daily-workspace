#!/usr/bin/env python3
"""
Fix timezone issues for existing entries.

This script reassociates note_entries with the correct daily_note based on
the user's timezone, not UTC.

Problem: Entries created at 4:51pm Pacific (Nov 6) were stored with UTC 
timestamp 00:51 (Nov 7), so they ended up on the wrong day.

Solution: Convert UTC timestamps to user's timezone and reassociate with
correct daily_note.
"""

import sqlite3
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo, available_timezones


def get_db_path():
    """Get the database path."""
    possible_paths = [
        Path(__file__).parent / "data" / "daily_notes.db",
        Path.cwd() / "data" / "daily_notes.db",
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    print("❌ Database not found!")
    sys.exit(1)


def get_user_timezone(tz_str=None):
    """Get user's timezone."""
    if not tz_str:
        print("\nTimezone not provided!")
        print("\nUsage: python fix_timezone_entries.py <timezone>")
        print("\nExamples:")
        print("  python fix_timezone_entries.py America/Los_Angeles")
        print("  python fix_timezone_entries.py America/New_York")
        print("\nCommon US timezones:")
        print("  - America/Los_Angeles (Pacific)")
        print("  - America/Denver (Mountain)")
        print("  - America/Chicago (Central)")
        print("  - America/New_York (Eastern)")
        sys.exit(1)
    
    if tz_str not in available_timezones():
        print(f"❌ Unknown timezone: {tz_str}")
        print(f"\nTo see all available timezones, visit:")
        print(f"https://en.wikipedia.org/wiki/List_of_tz_database_time_zones")
        sys.exit(1)
    
    return ZoneInfo(tz_str)


def fix_entries(db_path, timezone):
    """Fix entry associations based on timezone."""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Get all entries with their current associations
    cursor.execute('''
        SELECT ne.id, ne.daily_note_id, ne.created_at, dn.date
        FROM note_entries ne
        JOIN daily_notes dn ON ne.daily_note_id = dn.id
        ORDER BY ne.created_at
    ''')
    entries = cursor.fetchall()
    
    print(f"\nFound {len(entries)} entries to check")
    print(f"Timezone: {timezone}")
    print()
    
    moves = []
    
    for entry_id, current_daily_note_id, created_at_str, current_date in entries:
        # Parse UTC timestamp
        created_at_utc = datetime.strptime(created_at_str, '%Y-%m-%d %H:%M:%S.%f')
        created_at_utc = created_at_utc.replace(tzinfo=ZoneInfo('UTC'))
        
        # Convert to user's timezone
        created_at_local = created_at_utc.astimezone(timezone)
        correct_date = created_at_local.strftime('%Y-%m-%d')
        
        if correct_date != current_date:
            moves.append({
                'entry_id': entry_id,
                'from_date': current_date,
                'to_date': correct_date,
                'timestamp_utc': created_at_str,
                'timestamp_local': created_at_local.strftime('%Y-%m-%d %H:%M:%S')
            })
    
    if not moves:
        print("✓ All entries are already on the correct dates!")
        conn.close()
        return
    
    print(f"Found {len(moves)} entries that need to be moved:\n")
    for move in moves[:10]:  # Show first 10
        print(f"  Entry {move['entry_id']}:")
        print(f"    UTC:   {move['timestamp_utc']}")
        print(f"    Local: {move['timestamp_local']}")
        print(f"    Moving from {move['from_date']} → {move['to_date']}")
        print()
    
    if len(moves) > 10:
        print(f"  ... and {len(moves) - 10} more entries")
        print()
    
    # Check if --auto flag is provided
    auto_confirm = '--auto' in sys.argv or '-y' in sys.argv
    
    if not auto_confirm:
        try:
            confirm = input(f"\nMove {len(moves)} entries? (yes/no): ").strip().lower()
            if confirm != 'yes':
                print("Aborted.")
                conn.close()
                return
        except (EOFError, KeyboardInterrupt):
            print("\nAborted.")
            conn.close()
            return
    else:
        print(f"Auto-confirming: Moving {len(moves)} entries...")
    
    # Perform the moves
    moved_count = 0
    for move in moves:
        # Get or create daily_note for the correct date
        cursor.execute('SELECT id FROM daily_notes WHERE date = ?', (move['to_date'],))
        result = cursor.fetchone()
        
        if result:
            target_daily_note_id = result[0]
        else:
            # Create new daily_note
            cursor.execute('''
                INSERT INTO daily_notes (date, fire_rating, daily_goal, created_at, updated_at)
                VALUES (?, 0, '', ?, ?)
            ''', (move['to_date'], datetime.now(), datetime.now()))
            target_daily_note_id = cursor.lastrowid
            print(f"  Created daily_note for {move['to_date']}")
        
        # Update the entry
        cursor.execute('''
            UPDATE note_entries
            SET daily_note_id = ?
            WHERE id = ?
        ''', (target_daily_note_id, move['entry_id']))
        moved_count += 1
    
    conn.commit()
    
    print(f"\n✓ Moved {moved_count} entries to correct dates")
    
    # Show final summary
    cursor.execute('''
        SELECT dn.date, COUNT(ne.id) as entry_count
        FROM daily_notes dn
        LEFT JOIN note_entries ne ON ne.daily_note_id = dn.id
        GROUP BY dn.date
        ORDER BY dn.date DESC
        LIMIT 10
    ''')
    
    print("\nRecent days after fix:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} entries")
    
    conn.close()


def main():
    print("=" * 60)
    print("FIX TIMEZONE ENTRIES")
    print("=" * 60)
    print()
    print("This script will reassociate entries with the correct dates")
    print("based on your timezone.")
    print()
    
    db_path = get_db_path()
    print(f"Database: {db_path}")
    
    # Get timezone from command line argument
    tz_str = sys.argv[1] if len(sys.argv) > 1 else None
    timezone = get_user_timezone(tz_str)
    
    fix_entries(db_path, timezone)
    
    print()
    print("=" * 60)
    print("✅ COMPLETE")
    print("=" * 60)
    print()
    print("Refresh your browser to see entries on the correct dates!")
    print()


if __name__ == "__main__":
    main()

