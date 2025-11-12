#!/usr/bin/env python3
"""
Script to remove all labels from the database.
Run this from the project root: python3 cleanup_labels.py
"""

import sys
sys.path.insert(0, 'backend')

from app.database import SessionLocal
from app.models import Label

def cleanup_labels():
    db = SessionLocal()
    try:
        # Get all labels
        labels = db.query(Label).all()
        
        if not labels:
            print("✅ No labels found in database.")
            return
        
        print(f"Found {len(labels)} label(s):")
        for label in labels:
            print(f"  - ID {label.id}: '{label.name}' ({label.color})")
        
        # Confirm deletion
        response = input(f"\n⚠️  Delete all {len(labels)} label(s)? (yes/no): ")
        
        if response.lower() == 'yes':
            count = len(labels)
            for label in labels:
                db.delete(label)
            db.commit()
            print(f"✅ Successfully deleted {count} label(s).")
        else:
            print("❌ Deletion cancelled.")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    cleanup_labels()

