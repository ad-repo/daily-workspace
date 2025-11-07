from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Label Schemas
class LabelBase(BaseModel):
    name: str
    color: str = "#3b82f6"

class LabelCreate(LabelBase):
    pass

class Label(LabelBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Entry Schemas
class NoteEntryBase(BaseModel):
    title: str = ""
    content: str
    content_type: str = "rich_text"
    order_index: int = 0

class NoteEntryCreate(NoteEntryBase):
    pass

class NoteEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    order_index: Optional[int] = None
    include_in_report: Optional[bool] = None
    is_important: Optional[bool] = None
    is_completed: Optional[bool] = None
    is_dev_null: Optional[bool] = None

class NoteEntry(NoteEntryBase):
    id: int
    daily_note_id: int
    created_at: datetime
    updated_at: datetime
    labels: List[Label] = []
    include_in_report: bool = False
    is_important: bool = False
    is_completed: bool = False
    is_dev_null: bool = False

    class Config:
        from_attributes = True

# Daily Note Schemas
class DailyNoteBase(BaseModel):
    date: str  # Format: YYYY-MM-DD
    fire_rating: int = Field(default=0, ge=0, le=5)
    daily_goal: str = ""

class DailyNoteCreate(DailyNoteBase):
    pass

class DailyNoteUpdate(BaseModel):
    fire_rating: Optional[int] = Field(default=None, ge=0, le=5)
    daily_goal: Optional[str] = None

class DailyNote(DailyNoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    entries: List[NoteEntry] = []
    labels: List[Label] = []

    class Config:
        from_attributes = True

# Response models
class DailyNoteWithEntries(DailyNote):
    pass

# Link Preview Schemas
class LinkPreviewResponse(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    site_name: Optional[str] = None

# Report Schemas
class ReportEntry(BaseModel):
    date: str
    content: str
    labels: List[Label]
    entry_id: int
    is_completed: bool
    is_dev_null: bool = False

class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    generated_at: datetime
    entries: List[ReportEntry]

# Merge Schemas
class MergeEntriesRequest(BaseModel):
    entry_ids: List[int]
    separator: str = "\n\n"
    delete_originals: bool = True

# Search Schemas
class SearchResult(NoteEntryBase):
    id: int
    daily_note_id: int
    date: str  # Date of the daily note
    created_at: datetime
    updated_at: datetime
    labels: List[Label] = []
    include_in_report: bool = False
    is_important: bool = False
    is_completed: bool = False
    is_dev_null: bool = False

    class Config:
        from_attributes = True

# App Settings Schemas
class AppSettingsUpdate(BaseModel):
    sprint_goals: Optional[str] = None
    quarterly_goals: Optional[str] = None
    sprint_start_date: Optional[str] = None
    sprint_end_date: Optional[str] = None
    quarterly_start_date: Optional[str] = None
    quarterly_end_date: Optional[str] = None

class AppSettingsResponse(BaseModel):
    id: int
    sprint_goals: str
    quarterly_goals: str
    sprint_start_date: str
    sprint_end_date: str
    quarterly_start_date: str
    quarterly_end_date: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Goal Schemas
class GoalBase(BaseModel):
    text: str
    start_date: str  # Format: YYYY-MM-DD
    end_date: str  # Format: YYYY-MM-DD

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    text: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    days_remaining: Optional[int] = None  # Calculated field, relative to queried date

    class Config:
        from_attributes = True

