# Plan Summary
**Task:** add-trello-lists-feature
**Branch:** feature/trello-lists
**Timestamp:** 2025-11-11T03:00:00

---

# Add Trello-Style Lists Feature

## Overview
Implement a Trello-style lists/boards feature where existing note entries serve as cards that can be organized into multiple lists, with drag-and-drop support, search integration, and settings configuration.

## Requirements
- Cards = existing note entries (same fields/functionality as DailyView)
- Lists are independent (not date-based)
- Full drag-and-drop between lists (Trello-style)
- Cards can belong to multiple lists
- Horizontal column layout
- Search functionality includes lists
- Settings page section for list configuration
- Support upgrading older database versions

## Database Changes

### 1. Create List Model
**File**: `backend/app/models.py`
- Add `List` model with fields:
  - `id` (primary key)
  - `name` (string, required)
  - `description` (text, optional)
  - `color` (string, hex color)
  - `order_index` (integer, for ordering lists)
  - `is_archived` (integer, 0/1)
  - `created_at`, `updated_at` (datetime)

### 2. Create Many-to-Many Association
**File**: `backend/app/models.py`
- Add `entry_lists` association table:
  - `entry_id` (FK to note_entries)
  - `list_id` (FK to lists)
  - `order_index` (integer, for card position within list)
  - `created_at` (datetime)
- Add relationship in `NoteEntry` model: `lists = relationship('List', secondary=entry_lists, back_populates='entries')`
- Add relationship in `List` model: `entries = relationship('NoteEntry', secondary=entry_lists, back_populates='lists')`

### 3. Database Migration
**File**: `backend/migrations/016_add_lists_feature.py`
- Create migration script following existing pattern (see `015_create_goal_tables.py`)
- Steps:
  - Create `lists` table
  - Create `entry_lists` association table
  - Add indexes for performance
  - Handle upgrade from all previous versions

### 4. Update Backup/Restore
**File**: `backend/app/routers/backup.py`
- Add `lists` and `entry_lists` tables to backup export
- Add restore logic for lists data
- Ensure compatibility with older backups (handle missing tables)

## Backend API

### 5. Create List Schemas
**File**: `backend/app/schemas.py`
- `ListBase`: name, description, color, order_index, is_archived
- `ListCreate`: inherits ListBase
- `ListUpdate`: optional fields from ListBase
- `ListResponse`: adds id, created_at, updated_at, entry_count
- `ListWithEntries`: adds entries list (full NoteEntry objects)
- `EntryListAssociation`: entry_id, list_id, order_index

### 6. Create Lists Router
**File**: `backend/app/routers/lists.py`
- `GET /api/lists` - Get all lists (with entry counts)
- `GET /api/lists/{list_id}` - Get single list with entries
- `POST /api/lists` - Create new list
- `PUT /api/lists/{list_id}` - Update list
- `DELETE /api/lists/{list_id}` - Delete list (unlink entries, don't delete them)
- `POST /api/lists/{list_id}/entries/{entry_id}` - Add entry to list
- `DELETE /api/lists/{list_id}/entries/{entry_id}` - Remove entry from list
- `PUT /api/lists/{list_id}/reorder` - Update order_index for all entries in list (for drag-and-drop)
- `PUT /api/lists/reorder` - Update order_index for all lists

### 7. Update Search Router
**File**: `backend/app/routers/search.py`
- Update search endpoint to include list names in results
- Add `list_names` field to search response for each entry
- Add filter option to search by list

### 8. Register Lists Router
**File**: `backend/app/main.py`
- Import and register lists router: `app.include_router(lists.router)`

## Frontend - Types & API

### 9. Define Types
**File**: `frontend/src/types.ts`
- Add `List` interface matching backend schema
- Add `ListWithEntries` interface
- Update `NoteEntry` interface to include optional `lists?: List[]`

### 10. Create Lists API Client
**File**: `frontend/src/api.ts`
- Add all lists API functions:
  - `getLists()`, `getList(id)`, `createList(data)`, `updateList(id, data)`, `deleteList(id)`
  - `addEntryToList(listId, entryId, orderIndex)`, `removeEntryFromList(listId, entryId)`
  - `reorderEntriesInList(listId, entries)`, `reorderLists(lists)`

## Frontend - Components

### 11. Create Lists Page
**File**: `frontend/src/components/Lists.tsx`
- Horizontal scrollable container for lists (Trello-style)
- Each list as a vertical column
- Header with list name, color, entry count
- List actions: edit, archive, delete
- "Add List" button to create new lists
- Empty state when no lists exist

### 12. Create List Column Component
**File**: `frontend/src/components/ListColumn.tsx`
- Display list name, color, description
- Scrollable card container
- Drag-and-drop drop zone
- "Add Card" button to show entry selector
- Edit/delete list actions

### 13. Create List Card Component
**File**: `frontend/src/components/ListCard.tsx`
- Reuse/extend `NoteEntryCard` component
- Display same fields: title, content preview, labels, flags
- Draggable card
- Click to open full entry view/edit
- Show which other lists card belongs to
- Quick actions: remove from list, add to another list

### 14. Create Entry List Selector
**File**: `frontend/src/components/EntryListSelector.tsx`
- Multi-select dropdown/modal to assign entry to lists
- Show current lists (with ability to remove)
- Show available lists (with ability to add)
- Used in both DailyView and Lists page

### 15. Create List Settings Modal
**File**: `frontend/src/components/ListSettingsModal.tsx`
- Create/edit list: name, description, color picker
- Archive/unarchive list
- Delete list (with confirmation)
- Display entry count

### 16. Implement Drag-and-Drop
**File**: Multiple components
- Use HTML5 drag-and-drop API or library like `react-beautiful-dnd` or `@dnd-kit/core`
- Handle drag start/end events
- Update order_index on drop
- Handle moving between lists
- Visual feedback during drag

### 17. Update DailyView Component
**File**: `frontend/src/components/DailyView.tsx`
- Add list selector to each entry card
- Show list badges/tags on entry cards
- Add "Add to List" action in entry menu

### 18. Update Search Component
**File**: `frontend/src/components/Search.tsx`
- Display list names for each search result entry
- Add filter option to search by list
- Make list names clickable to navigate to Lists page filtered by that list

### 19. Add Settings Section
**File**: `frontend/src/components/Settings.tsx`
- Add "Lists" settings section
- Options:
  - Default list color
  - Show archived lists (toggle)
  - Auto-archive empty lists (toggle)
  - Compact/expanded card view (toggle)
- Use existing settings pattern from other sections

## Frontend - Routing & State

### 20. Add Lists Route
**File**: `frontend/src/App.tsx`
- Add route: `<Route path="/lists" element={<Lists />} />`
- Add route with list filter: `<Route path="/lists/:listId" element={<Lists />} />`

### 21. Update Navigation
**File**: `frontend/src/components/Navigation.tsx`
- Add "Lists" navigation item with icon (e.g., grid or columns icon)
- Place between "Calendar" and "Search"

### 22. Create Lists Context (Optional)
**File**: `frontend/src/contexts/ListsContext.tsx`
- Store lists data globally
- Handle list visibility settings
- Follow pattern from other contexts (DailyGoalsContext, etc.)

## Testing

### 23. Backend Tests
**File**: `tests/backend/integration/test_lists.py`
- Test all CRUD operations for lists
- Test adding/removing entries from lists
- Test reordering within lists
- Test reordering lists
- Test cascade behavior (deleting list doesn't delete entries)
- Test entry belongs to multiple lists

### 24. Backend Migration Tests
**File**: `tests/backend/migrations/test_016_add_lists_feature.py`
- Test migration from previous version
- Verify tables created correctly
- Test rollback functionality

### 25. Frontend Unit Tests
**Files**: 
- `frontend/tests/components/Lists.test.tsx`
- `frontend/tests/components/ListColumn.test.tsx`
- `frontend/tests/components/ListCard.test.tsx`
- `frontend/tests/components/EntryListSelector.test.tsx`
- Test rendering, CRUD operations, drag-and-drop logic

### 26. E2E Tests
**File**: `tests/e2e/tests/12-lists.spec.ts`
- Test creating/editing/deleting lists
- Test adding entries to lists
- Test removing entries from lists
- Test drag-and-drop between lists
- Test entry belongs to multiple lists
- Test search includes lists
- Test settings configuration

## Documentation

### 27. Update README
**File**: `README.md`
- Add "Lists" section describing Trello-style feature
- Explain cards are note entries
- Document drag-and-drop functionality
- Document multiple list membership

### 28. Update API Documentation
- Ensure all new endpoints are documented in OpenAPI/Swagger

## Implementation Order

1. Database: models, migration, backup/restore
2. Backend: schemas, router, register in main
3. Frontend types and API client
4. Core components: Lists page, ListColumn, ListCard
5. Integration: DailyView updates, Search updates, Settings
6. Drag-and-drop functionality
7. Tests: backend, frontend unit, E2E
8. Documentation

## Notes

- Follow existing patterns from Labels feature (many-to-many relationships)
- Ensure all changes follow `.cursorrules` (testing, documentation, cleanup)
- Cards maintain all existing functionality (important, completed, labels, etc.)
- Lists are independent of dates (not tied to daily notes)
- Consider performance: lazy load entries in lists, paginate if needed

