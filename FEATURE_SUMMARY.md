# Recent Features Summary

## Latest Updates (2025-10-31)

### 1. Title Field for Note Entries
- **What**: Added optional one-line title field at the top of each note entry card
- **UI**: Clean input field with auto-save (1 second debounce)
- **Backend**: New `title` column in `note_entries` table
- **Migration**: Run `python migrations/run_migrations.py` or restart Docker
- **Backup**: Version 4.0 format includes titles; v3.0 backups still importable

### 2. Move to Top Feature
- **What**: Up arrow button to move any entry to the top of its day's list
- **How**: Click the ↑ button in the card's action buttons
- **Backend**: Uses `order_index` field for sorting (higher = earlier)
- **Animation**: Smooth slide animation with optimistic updates

### 3. Smooth Transitions Throughout
- **Entry Actions**: Fade-out on delete, slide-in on create, smooth reorder
- **Page Loads**: All major views fade in (200ms)
- **Search Results**: Staggered appearance (50ms between items)
- **Label Management**: Instant add/remove with optimistic updates
- **Consistency**: 200-300ms timing across all animations

### 4. Label Management in Settings
- **What**: New section in Settings to manage all labels
- **Features**:
  - View all labels in a grid layout
  - Delete labels with confirmation dialog
  - Shows emoji labels with larger display
  - Automatic CASCADE deletion from all notes/entries
- **Access**: Settings → Label Management section

### 5. Enhanced Backup & Restore
- **JSON Export**: Version 4.0 includes title field
- **Markdown Export**: Uses entry titles as section headers
- **Backward Compatible**: Can restore v3.0 backups (titles will be empty)
- **Label Handling**: Properly exports/imports all label data

## Migration System

### Database Migrations
- **Location**: `backend/migrations/`
- **Run All**: `python migrations/run_migrations.py`
- **Individual**: `python migrations/001_add_title_field.py up`
- **Docker**: Runs automatically on container startup
- **Idempotent**: Safe to run multiple times

### Current Migrations
1. **001_add_title_field.py** - Adds `title` VARCHAR column to `note_entries`

## Technical Details

### Database Schema Changes
```sql
-- Note entries now have title field
ALTER TABLE note_entries ADD COLUMN title VARCHAR DEFAULT '';

-- Order by order_index (descending), then created_at (descending)
-- Higher order_index values appear first
```

### API Endpoints Added
- `POST /api/entries/{entry_id}/move-to-top` - Move entry to top of list
- `DELETE /api/labels/{label_id}` - Delete a label (already existed)

### Frontend Improvements
- Optimistic updates for labels (no reload lag)
- CSS animations for smooth transitions
- Staggered rendering for search results
- Improved hover states with 200-300ms transitions

## User Benefits

1. **Better Organization**: Titles help identify entries at a glance
2. **Flexible Ordering**: Move important entries to the top easily
3. **Smoother Experience**: No jarring page reloads or jumps
4. **Clean Labels**: Delete unused labels from central location
5. **Reliable Backups**: Enhanced backup format preserves all data

## Breaking Changes

**None!** All changes are backward compatible:
- Old backups (v3.0) can be restored
- Existing entries work without titles
- Label deletion uses proper CASCADE
- Migrations are safe and idempotent

## Performance Notes

- Optimistic updates reduce perceived latency
- Animations use CSS transforms (GPU accelerated)
- Debounced saves prevent excessive API calls
- Staggered animations prevent UI blocking

