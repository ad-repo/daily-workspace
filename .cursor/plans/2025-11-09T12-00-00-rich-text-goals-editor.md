# Plan Summary
**Task:** rich-text-goals-editor
**Branch:** feature/rich-text-goals-editor
**Timestamp:** 2025-11-09T12:00:00Z

---

# Rich Text Goals Editor

## Git Workflow (per .cursorrules git_workflow)

1. Verify main is up to date: `git status` (already on main and up to date)
2. Create feature branch: `git checkout -b feature/rich-text-goals-editor`
3. Use Conventional Commits format for all commits

## Changes Required

### 1. Create Simplified Rich Text Editor Component

Create `frontend/src/components/SimpleRichTextEditor.tsx` - a lightweight version of RichTextEditor with:
- Only essential extensions: StarterKit, Link, Placeholder
- Simplified toolbar: Bold, Italic, Bullet List, Numbered List, Link
- Built-in resizability via CSS `resize` property on editor container
- Props: `content`, `onChange`, `placeholder`
- Remove: Image upload, video, code blocks, color picker, font controls, voice input, camera

### 2. Update DailyView Component

Modify `frontend/src/components/DailyView.tsx`:

**Daily Goals Section (~line 480-510)**
- Replace `<textarea>` with `<SimpleRichTextEditor>` when `editingDailyGoal` is true
- Replace plain text display div with HTML renderer when not editing (use `dangerouslySetInnerHTML` or a safe HTML parser)
- Update `dailyGoal` state to handle HTML content

**Sprint Goals Section (~line 554-577)**  
- Replace `<textarea>` with `<SimpleRichTextEditor>` when `editingSprintGoal` is true
- Replace plain text display div with HTML renderer when not editing
- Update `newSprintText` for goal creation (~line 600)

**Quarterly Goals Section (~line 715-751)**
- Replace `<textarea>` with `<SimpleRichTextEditor>` when `editingQuarterlyGoal` is true  
- Replace plain text display div with HTML renderer when not editing
- Update `newQuarterlyText` for goal creation (~line 760)

### 3. Add CSS Styling for Resize Handle

Update styling in `DailyView.tsx` or create a shared style:
- Add `resize: both` or `resize: vertical` CSS property to editor container
- Add visual resize handle indicator (bottom-right corner)
- Set `overflow: auto` to enable resize behavior
- Ensure min/max dimensions are reasonable (min: 80px, max: 600px height)

### 4. HTML Content Rendering

For non-editing view in all three goal types:
- Use `dangerouslySetInnerHTML={{ __html: goalText }}` to render HTML
- Maintain existing hover styles and click-to-edit behavior  
- Ensure HTML is sanitized (TipTap output is already safe)
- Preserve whitespace and formatting

### 5. Backend Compatibility

No backend changes needed:
- `DailyNote.daily_goal` is already `Text` type (line 90 of `models.py`)
- `SprintGoal.text` is already `Text` type (line 62 of `models.py`)  
- `QuarterlyGoal.text` is already `Text` type (line 75 of `models.py`)
- Text columns can store HTML without schema changes

### 6. Testing

Add tests to `tests/e2e/tests/08-goals.spec.ts`:
- Test rich text formatting in daily goals (bold, lists)
- Test rich text formatting in sprint goals
- Test rich text formatting in quarterly goals  
- Test resize functionality (check CSS properties)
- Test HTML rendering when not editing
- Test that existing plain text goals still display correctly

Update `tests/frontend/components/DailyView.test.tsx`:
- Mock SimpleRichTextEditor component
- Test goal state management with HTML content
- Test edit/display mode switching

## Files to Create
- `frontend/src/components/SimpleRichTextEditor.tsx` (new)

## Files to Modify  
- `frontend/src/components/DailyView.tsx` (3 goal sections)
- `tests/e2e/tests/08-goals.spec.ts` (add rich text tests)
- `frontend/tests/components/DailyView.test.tsx` (update mocks)

## Implementation Notes

- Reuse TipTap setup from existing RichTextEditor but strip down extensions
- Keep editor styling consistent with existing theme variables
- No database migrations required (Text fields already support HTML)
- Backward compatible: plain text goals will display as-is  
- Follow existing patterns from NoteEntryCard's RichTextEditor usage

## Implementation Status

✅ **Completed:**
1. Created `SimpleRichTextEditor` component with simplified toolbar
2. Added resize functionality via CSS `resize: both`
3. Updated all 3 goal types in DailyView to use SimpleRichTextEditor
4. Added HTML rendering with `dangerouslySetInnerHTML` for display mode
5. Added 7 new E2E tests for rich text formatting and resize
6. Updated DailyView unit tests with SimpleRichTextEditor mock
7. Updated README documentation
8. Committed changes with conventional commit messages

**Commits:**
- `27a78e3` - feat: add rich text editor to goals with resize capability
- `4f3780a` - docs: update README with rich text goals feature

**Next Steps:**
- Run `./run_all_tests.sh` to verify all tests pass (per .cursorrules local_test_execution)
- Review and merge feature branch

