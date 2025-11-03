"""
Migration 010: Fix localhost URLs in note content

This migration replaces hardcoded localhost URLs with relative paths,
making images and videos work across different network configurations.
"""

from sqlalchemy import text

def upgrade(conn):
    """Replace localhost URLs with relative paths"""
    print("Fixing localhost URLs in note content...")
    
    # Update image and video URLs in content
    result = conn.execute(text("""
        UPDATE note_entries 
        SET content = REPLACE(
            REPLACE(
                REPLACE(content, 'src="http://localhost:8000/api/', 'src="/api/'),
                'src="http://localhost:8000', 'src="'
            ),
            'http://localhost:8000/api/', '/api/'
        )
        WHERE content LIKE '%localhost:8000%'
    """))
    
    rows_affected = result.rowcount
    print(f"Updated {rows_affected} note entries")
    conn.commit()
    
def downgrade(conn):
    """No downgrade needed - relative paths work everywhere"""
    print("No downgrade needed for URL fix")
    pass

