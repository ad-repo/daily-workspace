# Recent Features Summary

## Latest Updates (2025-11-07)

### 1. Calendar View Goal Integration
- **What**: Sprint and quarterly goals now display on the calendar view with visual indicators
- **Features**:
  - **Goal Indicators**: 🚀 emoji for Sprint Goals, 🌟 emoji for Quarterly Goals
  - **Smart Display**: Goals only appear on calendar dates within their date range
  - **Rich Tooltips**: Hover over any date to see daily goal, sprint goal, quarterly goal, and entry count
  - **Multiple States**: Calendar tiles can show multiple indicators at once (skull + star + check)
  - **No Override Rule**: All entry states (dev/null, important, completed) display simultaneously
  - **Updated Legend**: Separate sections for "Entry Status" and "Goals" with clear explanations
- **API**: New endpoints `GET /api/goals/sprint` and `GET /api/goals/quarterly` for batch fetching
- **UI**: Goals appear below entry indicators on calendar tiles
- **Consistency**: Uses same emojis as Daily View (🚀 and 🌟)

### 2. Date-Aware Goals System with Upcoming Goals
- **What**: Sprint and quarterly goals are now contextual to the date you're viewing, with support for upcoming goals
- **How**: Goals automatically load based on the date being viewed, including future goals not yet started
- **Features**:
  - **Historical Tracking**: Create multiple goals with specific date ranges (start/end dates)
  - **Automatic Display**: Correct goal displays for the date you're viewing
  - **Upcoming Goals**: Shows future goals with "X days until start" countdown in blue badge
  - **Days Remaining**: Countdown calculated from the viewed date, not today
  - **Always Editable**: End dates always editable for error correction (no read-only restriction)
  - **Easy Creation**: Click "+ Create Sprint/Quarterly Goal" when viewing any date
  - **Selectable Start Date**: Choose any start date when creating new goals
  - **Date Range Validation**: Prevents overlapping goals for the same period
  - **Date-Aware Navigation**: See different goals when browsing different dates
  - **Auto-Close Date Pickers**: Date pickers close when navigating to different days
- **UI**: 
  - Blue badge: "X days until start" for upcoming goals
  - Green badge: "X days left" for active goals
  - Red badge: "X days overdue" for past goals
  - All goals always editable (no read-only badges)
  - Inline creation form with editable start date and end date picker
  - Clear visual feedback for goal state
- **Database**: New `sprint_goals` and `quarterly_goals` tables for historical tracking
- **Migration**: Automated migration 015 migrates existing goals from `app_settings`
- **Backup/Restore**: Goals included in JSON/Markdown exports with full history
- **Fixed**: Migration 014 now preserves intentionally created future entries (2025-11-07)

### 2. Copy to Jira/Confluence
- **What**: Export note entries in Jira/Confluence wiki markup format
- **How**: Click the Jira icon button in the entry toolbar (next to Markdown copy)
- **Features**:
  - High-quality HTML to Jira wiki markup conversion
  - Preserves all formatting: headings (h1.-h6.), bold (*), italic (_), strikethrough (-), underline (+)
  - Code blocks: `{code}...{code}`, inline code: `{{...}}`
  - Links: `[text|url]`, Images: `!url!` or `!url|alt=text!`
  - Lists: `*` for bullets, `#` for numbered
  - Blockquotes: `{quote}...{quote}`
  - Includes title as h1. heading
  - Works with both rich text and code entries
- **UI**: Official Jira logo icon, success feedback with checkmark
- **Use Case**: Paste formatted content directly into Jira issues or Confluence pages

### 2. Rich Text Formatting Enhancements
- **Text Color**: Color picker for custom text colors
- **Font Family**: Dropdown with 8 font options (Arial, Times, Courier, Georgia, Verdana, Comic Sans, Impact)
- **Font Size**: Dropdown with sizes from 12px to 48px
- **Smart Code Blocks**: Multi-line selections automatically convert to code blocks (not split inline code)
- **UI**: Compact icon buttons with popup menus for font controls

### 2. Editable Link Previews
- **Click-to-Edit**: Click any link preview title or description to edit inline
- **No Prompts**: Previews insert immediately, edit as needed
- **Fallback Handling**: If metadata fetch fails, placeholder text appears ("Click to add title/description")
- **Delete Button**: Hover over preview to reveal delete button (X)
- **UI**: Inline editing with themed input fields and textarea

### 3. Persistent Goals System
- **Sprint Goals**: Track sprint-level goals that persist across all days
- **Quarterly Goals**: Set quarterly objectives that persist across all days
- **Daily Goals**: Day-specific goals (existing feature, now with click-to-edit)
- **Click-to-Edit**: Click any goal text to edit inline, automatic save on blur
- **Database**: New `app_settings` table for persistent goals
- **Migration**: Automated migration from old system (012_move_goals_to_settings.py)
- **Toggle Visibility**: Show/hide each goal type in Settings → General

### 4. UI Layout Improvements
- **Day Labels Above Goals**: Day labels now appear at the top, before all goal sections
- **Full-Width New Entry**: "New Entry" button spans full width when no entries exist
- **Improved Goal Styling**: Visible borders, better multi-line input, hover indicators
- **Rounded Corners**: More stylish rounded corners on all cards (rounded-2xl)

### 5. Code Block Enhancements
- **Isolating Property**: Code blocks no longer affect adjacent lines
- **Escape to Paragraph**: Press Backspace at start of code block to convert to paragraph
- **Navigate Above**: Press Arrow Up at top of code block (when at document start) to insert paragraph above
- **Smart Multi-line**: Selecting multiple lines and clicking inline code button creates a code block

### 6. Technical Improvements
- **Unused Import Cleanup**: Removed unused imports across all context files and components
- **Parameter Naming**: Prefixed unused parameters with underscore (_view, _pos, etc.)
- **Database Migrations**: Migration 012 handles upgrades from older versions
- **Backup/Restore**: App settings (sprint/quarterly goals) included in JSON and Markdown exports

## Previous Updates (2025-11-02)

### 1. Voice Dictation
- **What**: Real-time speech-to-text directly in the rich text editor
- **How**: Click the microphone icon in the toolbar to start/stop recording
- **Features**:
  - Real-time transcription with interim results (gray italic text)
  - Final results appear in black when phrase is complete
  - Continuous mode for long dictation sessions
  - Works in Chrome (with automatic retry workaround) and Safari
  - Automatic permission request for microphone access
- **UI**: Red pulsing microphone button when recording
- **Browser Support**: Chrome, Safari (other browsers may vary)

### 2. Camera & Video Capture
- **What**: Capture photos and record videos directly in the editor
- **How**: Click camera or video icons in the toolbar
- **Features**:
  - Camera: Live preview with capture button
  - Video: Live preview with start/stop recording
  - Images saved at 100% quality
  - Videos include audio recording
  - All media uploaded and stored persistently
  - Responsive sizing in cards (full width)
- **UI**: Modal with live preview and capture/record controls

### 3. Settings Toggles for UI Sections
- **What**: Hide/show Daily Goals and Day Labels sections from day view
- **Location**: Settings → General
- **Features**:
  - Show Daily Goals toggle - completely removes section when disabled
  - Show Day Labels toggle - completely removes section when disabled
  - Preferences saved to localStorage
  - No extra spacing when sections are hidden
- **Default**: Both enabled by default

### 4. Background Image Tiling
- **What**: Toggle between tiled pattern or covered/centered backgrounds
- **Location**: Settings → Background Images → Tile Background
- **Features**:
  - Tile mode: repeats image as pattern
  - Cover mode (default): centers and covers full screen
  - Works with all uploaded background images
  - Preference saved to localStorage
- **Default**: Cover/center mode

### 5. Standardized Toggle Buttons
- **What**: Unified styling for all toggle switches across the app
- **Changes**:
  - Consistent size (h-6 w-11)
  - Uniform colors using theme variables
  - Same animation timing (1.5rem translate)
  - Border style consistency
  - Disabled state opacity and cursor
- **Affected**: All toggles in Settings (6 total)

### 6. Editor Toolbar Improvements
- **What**: Reorganized and improved rich text editor toolbar
- **Changes**:
  - Moved inline code button next to code block button
  - Horizontal scrolling toolbar (no wrapping)
  - Even spacing across all toolbar icons
  - Responsive media sizing (images/videos fill card width)
- **UI**: Single-row toolbar with consistent icon spacing

## Previous Updates (2025-10-31)

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

## Technical Details (2025-11-02)

### New Frontend Components
- **useSpeechRecognition.ts**: Custom React hook for Web Speech API
  - Handles browser compatibility (Chrome/Safari)
  - Implements automatic retry for Chrome network errors
  - Provides real-time interim and final transcription
  - Manages microphone permissions
- **DailyGoalsContext.tsx**: Context for show/hide Daily Goals preference
- **DayLabelsContext.tsx**: Context for show/hide Day Labels preference
- **Custom Video Node**: TipTap extension for proper video rendering

### API Endpoints Used
- `POST /api/uploads/image` - Upload captured photos
- `POST /api/uploads/file` - Upload recorded videos

### Browser APIs
- **Web Speech API**: Real-time speech recognition
- **MediaDevices API**: Camera and microphone access (`getUserMedia`)
- **MediaRecorder API**: Video recording with audio
- **Canvas API**: Photo capture from video stream

### CSS Additions
- Recording pulse animation for microphone button
- Horizontal scrolling toolbar with hidden scrollbar
- Responsive image/video sizing (width: 100%)

### localStorage Keys
- `showDailyGoals`: Toggle state for Daily Goals section
- `showDayLabels`: Toggle state for Day Labels section
- `custom_background_tile_mode`: Toggle state for background tiling

### User Benefits (2025-11-02)
1. **Faster Entry Creation**: Voice dictation speeds up note-taking
2. **Rich Media Support**: Capture photos and videos without leaving the app
3. **Customizable Interface**: Hide sections you don't use for a cleaner view
4. **Visual Consistency**: Uniform toggle styles improve UX clarity
5. **Background Flexibility**: Tile patterns for repeating designs or cover for photos
6. **Better Organization**: Toolbar reorganization groups related functions

### Breaking Changes
**None!** All changes are frontend-only and backward compatible:
- Voice dictation is optional (browser permission required)
- Media capture requires user action
- Settings toggles default to enabled (existing behavior)
- Background tiling defaults to cover mode (existing behavior)
- All preferences stored in localStorage (no database impact)

## Previous Technical Details (2025-10-31)

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

