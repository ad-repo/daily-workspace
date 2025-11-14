# Plan Summary
**Task:** Add Kanban Board System
**Branch:** feature/trello-lists
**Timestamp:** 2025-11-14T19:00:00

---

# Add Kanban Board System

## Overview
Implement a Kanban board feature that uses Lists with a special `is_kanban` flag to represent workflow states. The board will have predefined columns (To Do, In Progress, Done) that users can customize. Cards are existing note entries that show their Kanban state badge when displayed on a Kanban board.

## Database Changes

### Migration: Add `is_kanban` flag to Lists
**File**: `backend/migrations/019_add_kanban_support.py`
- Add `is_kanban` column to `lists` table (Integer, default 0)
- Add `kanban_order` column to `lists` table (Integer, default 0) for ordering Kanban columns separately from regular lists
- Update existing lists to have `is_kanban=0`

### Update Models
**File**: `backend/app/models.py`
- Add `is_kanban` field to `List` model
- Add `kanban_order` field to `List` model

### Update Schemas
**File**: `backend/app/schemas.py`
- Add `is_kanban: bool = False` to `ListBase`
- Add `kanban_order: int = 0` to `ListBase`
- Add to `ListUpdate` schema

## Backend API Changes

### Update Lists Router
**File**: `backend/app/routers/lists.py`
- Add `/api/lists/kanban` GET endpoint to fetch only Kanban lists (where `is_kanban=1`)
- Add `/api/lists/kanban/initialize` POST endpoint to create default Kanban columns if none exist
- Update existing endpoints to handle `is_kanban` flag
- Add `/api/lists/kanban/reorder` PUT endpoint for reordering Kanban columns

### Update Backup/Restore
**File**: `backend/app/routers/backup.py`
- Include `is_kanban` and `kanban_order` fields in backup export
- Handle `is_kanban` and `kanban_order` fields in restore

## Frontend Changes

### Add Kanban Page Component
**File**: `frontend/src/components/Kanban.tsx`
- Create new Kanban board view component
- Reuse `ListColumn` component for Kanban columns
- Reuse `ListCard` component for cards
- Add "Initialize Kanban" button if no Kanban lists exist
- Add "Add Column" button to create new Kanban states
- Implement horizontal scrolling for columns
- Style similar to Lists page but with Kanban-specific layout

### Update ListCard Component
**File**: `frontend/src/components/ListCard.tsx`
- Add Kanban state badge display when entry is in a Kanban list
- Badge shows the Kanban column name (e.g., "To Do", "In Progress")
- Badge only visible when `list.is_kanban === true`
- Use list color for badge styling

### Update ListColumn Component
**File**: `frontend/src/components/ListColumn.tsx`
- Add visual distinction for Kanban columns (optional header styling)
- Support Kanban-specific actions if needed

### Add Kanban API Functions
**File**: `frontend/src/api.ts`
- Add `kanbanApi.getBoards()` - fetch Kanban lists
- Add `kanbanApi.initialize()` - create default Kanban columns
- Add `kanbanApi.reorderColumns()` - reorder Kanban columns

### Update Types
**File**: `frontend/src/types.ts`
- Add `is_kanban?: boolean` to `List` interface
- Add `kanban_order?: number` to `List` interface

### Add Navigation Link
**File**: `frontend/src/components/Navigation.tsx`
- Add "Kanban" link with appropriate icon (e.g., `Trello` or `LayoutGrid` from lucide-react)
- Place between "Lists" and "Search"

### Add Route
**File**: `frontend/src/App.tsx`
- Add `/kanban` route with `<Kanban />` component

## Testing

### Backend Tests
**File**: `tests/backend/integration/test_kanban.py`
- Test Kanban list creation with `is_kanban=true`
- Test `/api/lists/kanban` endpoint returns only Kanban lists
- Test `/api/lists/kanban/initialize` creates default columns
- Test regular lists API excludes Kanban lists by default
- Test adding/removing entries to/from Kanban lists
- Test Kanban column reordering

### Frontend Tests
**File**: `frontend/tests/components/Kanban.test.tsx`
- Test Kanban board renders
- Test initialize button creates default columns
- Test drag-and-drop between Kanban columns
- Test Kanban state badge displays on cards
- Test add column functionality

## Documentation

### Update README
**File**: `README.md`
- Add "Kanban Board" section under features
- Describe workflow state management
- Explain difference between Lists and Kanban

## Implementation Notes

### Reuse Existing Infrastructure
- Kanban columns are Lists with `is_kanban=1`
- Kanban cards are NoteEntry objects (same as regular entries)
- Drag-and-drop logic already exists in ListColumn/ListCard
- Entry-to-list association already exists via `entry_lists` table

### Default Kanban Columns
When initializing, create three lists:
1. "To Do" - color: `#3b82f6` (blue)
2. "In Progress" - color: `#f59e0b` (amber)
3. "Done" - color: `#10b981` (green)

All with `is_kanban=1` and sequential `kanban_order` values.

### Kanban State Badge Logic
In `ListCard.tsx`, check if the entry's parent list has `is_kanban=true`. If so, display a small badge with the list name and color.

### Filtering Lists vs Kanban
- Regular Lists page: fetch lists where `is_kanban=0` or `is_kanban IS NULL`
- Kanban page: fetch lists where `is_kanban=1`
- This keeps the two features separate but using the same underlying data model

