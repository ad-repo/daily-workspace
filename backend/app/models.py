from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association table for many-to-many relationship between notes and labels
note_labels = Table(
    'note_labels',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('daily_notes.id', ondelete='CASCADE')),
    Column('label_id', Integer, ForeignKey('labels.id', ondelete='CASCADE'))
)

# Association table for many-to-many relationship between entries and labels
entry_labels = Table(
    'entry_labels',
    Base.metadata,
    Column('entry_id', Integer, ForeignKey('note_entries.id', ondelete='CASCADE')),
    Column('label_id', Integer, ForeignKey('labels.id', ondelete='CASCADE'))
)

class Label(Base):
    """Model for labels"""
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, default="#3b82f6")  # Hex color code
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    notes = relationship("DailyNote", secondary=note_labels, back_populates="labels")
    entries = relationship("NoteEntry", secondary=entry_labels, back_populates="labels")

class DailyNote(Base):
    """Model for daily notes - one per day"""
    __tablename__ = "daily_notes"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True, nullable=False)  # Format: YYYY-MM-DD
    fire_rating = Column(Integer, default=0)  # 0-5 fire rating
    daily_goal = Column(Text, default="")  # Daily goal/objective
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    entries = relationship(
        "NoteEntry", 
        back_populates="daily_note", 
        cascade="all, delete-orphan",
        order_by="[desc(NoteEntry.order_index), desc(NoteEntry.created_at)]"
    )
    labels = relationship("Label", secondary=note_labels, back_populates="notes")

class NoteEntry(Base):
    """Model for individual content entries within a day"""
    __tablename__ = "note_entries"

    id = Column(Integer, primary_key=True, index=True)
    daily_note_id = Column(Integer, ForeignKey("daily_notes.id"), nullable=False)
    title = Column(String, default="")  # Optional title for the entry
    content = Column(Text, nullable=False)  # Rich text content (HTML)
    content_type = Column(String, default="rich_text")  # rich_text, code, markdown
    order_index = Column(Integer, default=0)  # For ordering entries within a day
    include_in_report = Column(Integer, default=0)  # 0 = false, 1 = true (for SQLite compatibility)
    is_important = Column(Integer, default=0)  # 0 = false, 1 = true (starred/important)
    is_completed = Column(Integer, default=0)  # 0 = false, 1 = true (completed checkbox)
    is_dev_null = Column(Integer, default=0)  # 0 = false, 1 = true (marked as /dev/null - discarded)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    daily_note = relationship("DailyNote", back_populates="entries")
    labels = relationship("Label", secondary=entry_labels, back_populates="entries")

class SearchHistory(Base):
    """Model for search history"""
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

