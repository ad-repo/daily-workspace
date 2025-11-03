#!/usr/bin/env python3
"""
Fix localhost URLs in existing note content
"""

from sqlalchemy import create_engine, text
import os

def main():
    # Connect to database
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./data/daily_notes.db')
    engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
    conn = engine.connect()

    try:
        # Update image URLs
        print('Fixing localhost URLs in note content...')
        
        # First replacement: src="http://localhost:8000/api/ -> src="/api/
        result1 = conn.execute(text("""
            UPDATE note_entries 
            SET content = REPLACE(content, 'src="http://localhost:8000/api/', 'src="/api/')
            WHERE content LIKE '%localhost:8000%'
        """))
        conn.commit()
        
        # Second replacement: src="http://localhost:8000 -> src="
        result2 = conn.execute(text("""
            UPDATE note_entries 
            SET content = REPLACE(content, 'src="http://localhost:8000', 'src="')
            WHERE content LIKE '%localhost:8000%'
        """))
        conn.commit()
        
        # Third replacement: http://localhost:8000/api/ -> /api/
        result3 = conn.execute(text("""
            UPDATE note_entries 
            SET content = REPLACE(content, 'http://localhost:8000/api/', '/api/')
            WHERE content LIKE '%localhost:8000%'
        """))
        conn.commit()
        
        print(f'✅ Migration completed successfully!')
        print(f'   Note: If you had images before, they should now work on mobile')
        
    finally:
        conn.close()

if __name__ == '__main__':
    main()

