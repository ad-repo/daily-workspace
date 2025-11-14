# Plan Summary
**Task:** UI Consistency Improvements - Standardize content width and padding across all views
**Branch:** feature/trello-lists
**Timestamp:** 2025-11-12T00:00:00Z

---

# UI Consistency Improvements

## Overview
Standardize the look and feel across all pages with consistent content width, padding, and spacing. Using Settings page (`max-w-5xl mx-auto`) as the reference standard.

## Current State Analysis

**Settings** (Reference Standard):
- Container: `max-w-5xl mx-auto` with `page-fade-in`
- Card: `rounded-lg shadow-lg p-6` with `backgroundColor: var(--color-bg-primary)`
- Sections: Consistent `mb-8` spacing between sections

**DailyView**:
- Uses App.tsx container with `max-w-7xl` (wider than Settings)
- Mixed padding and spacing patterns
- Goals sections have inconsistent styling

**Lists**:
- Full-width horizontal scroll layout (intentional, but needs better padding)
- No max-width constraint
- Inconsistent spacing

**Reports**:
- Container: `max-w-7xl mx-auto` (wider than Settings)
- Inconsistent card styling
- Mixed padding patterns

**Search**:
- Container: `max-w-7xl mx-auto` (wider than Settings)
- Inconsistent spacing between elements

**CalendarView**:
- No explicit container styling
- Relies on App.tsx container

## Changes

### 1. Standardize Container Widths
Apply `max-w-5xl mx-auto` wrapper to all main content views:
- DailyView.tsx - Add wrapper div
- Reports.tsx - Change from `max-w-7xl` to `max-w-5xl`
- Search.tsx - Change from `max-w-7xl` to `max-w-5xl`
- CalendarView.tsx - Add `max-w-5xl mx-auto` wrapper

### 2. Standardize Card Styling
Ensure all main content cards use:
- `rounded-lg shadow-lg p-6`
- `backgroundColor: var(--color-bg-primary)`
- Consistent `mb-8` spacing between major sections

Files to update:
- DailyView.tsx - Goals sections, entry container
- Reports.tsx - Report cards
- Search.tsx - Search results container

### 3. Lists View Special Handling
Lists view needs horizontal scrolling, so:
- Keep full-width layout for horizontal scroll
- Add consistent top/bottom padding: `py-6`
- Add left/right padding to first/last columns for breathing room
- Ensure scroll indicators are properly positioned

### 4. Standardize Section Headers
All section headers should use:
- `text-xl font-semibold mb-4 flex items-center gap-2`
- `color: var(--color-text-primary)`
- Icon size: `h-5 w-5`

### 5. Page Fade-In Animation
Add `page-fade-in` class to all main views for consistent page transitions.

## Files to Modify
1. frontend/src/components/DailyView.tsx
2. frontend/src/components/Lists.tsx
3. frontend/src/components/Reports.tsx
4. frontend/src/components/Search.tsx
5. frontend/src/components/CalendarView.tsx

## Rollback Plan
All changes will be in a single commit with clear description. If user dislikes the changes, simply run:
```bash
git reset --hard HEAD~1
```

## Testing
After changes:
- Verify all pages render correctly
- Check responsive behavior on different screen sizes
- Ensure Lists horizontal scroll still works
- Verify no layout shifts or broken styling

