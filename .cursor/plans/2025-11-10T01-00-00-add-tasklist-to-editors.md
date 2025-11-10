# Plan Summary
**Task:** add tasklist to editors
**Branch:** main (will create feature/tasklist-editors)
**Timestamp:** 2025-11-10T01:00:00Z

---

# Add Task List Support to Rich Text Editors

## Overview
Add checkbox/task list functionality to both goal and note entry editors using TipTap's built-in TaskList and TaskItem extensions. This allows users to create interactive checklists with checkboxes that persist their state.

## Implementation Steps

### 1. Install Dependencies
Add TipTap task list extensions to `frontend/package.json`:
- `@tiptap/extension-task-list`
- `@tiptap/extension-task-item`

Command: `npm install @tiptap/extension-task-list @tiptap/extension-task-item`

### 2. Update SimpleRichTextEditor (Goals Editor)
File: `frontend/src/components/SimpleRichTextEditor.tsx`

**Imports:**
```typescript
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CheckSquare } from 'lucide-react';
```

**Extensions Configuration (line 31-48):**
Add after Underline extension:
```typescript
TaskList,
TaskItem.configure({
  nested: true,
}),
```

**Toolbar Button:**
Add after the "Lists" separator (around line 230-260):
```typescript
<button
  onClick={() => editor.chain().focus().toggleTaskList().run()}
  className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
    editor.isActive('taskList') ? 'bg-opacity-100' : 'bg-opacity-0'
  }`}
  style={{
    backgroundColor: editor.isActive('taskList')
      ? 'var(--color-accent)'
      : 'transparent',
    color: editor.isActive('taskList')
      ? 'white'
      : 'var(--color-text-secondary)',
  }}
  title="Task List"
  type="button"
>
  <CheckSquare size={16} />
</button>
```

### 3. Update RichTextEditor (Note Entry Editor)
File: `frontend/src/components/RichTextEditor.tsx`

**Imports:**
```typescript
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CheckSquare } from 'lucide-react';
```

**Extensions Configuration (around line 115-135):**
Add after Link extension:
```typescript
TaskList,
TaskItem.configure({
  nested: true,
}),
```

**Toolbar Button:**
Add in the toolbar section after the ordered list button (search for `ListOrdered` around line 500-600):
```typescript
<button
  onClick={() => editor.chain().focus().toggleTaskList().run()}
  className={`p-1.5 rounded transition-all ${
    editor.isActive('taskList')
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
  }`}
  title="Task List"
  type="button"
>
  <CheckSquare size={18} />
</button>
```

### 4. Add CSS Styles for Task Lists
File: `frontend/src/index.css` (or add to editor wrapper styles)

```css
/* Task list checkbox styling */
ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}

ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-top: 0.2rem;
}

ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

ul[data-type="taskList"] input[type="checkbox"] {
  cursor: pointer;
  width: 1.1em;
  height: 1.1em;
  margin: 0;
  accent-color: var(--color-accent);
}

/* Nested task lists */
ul[data-type="taskList"] ul[data-type="taskList"] {
  margin: 0.5rem 0 0 1.5rem;
}
```

### 5. Testing Requirements (per .cursorrules test_creation)

**Frontend Unit Tests:**
Create: `frontend/tests/components/SimpleRichTextEditor.test.tsx`
- Test: Toggle task list creation
- Test: Check/uncheck task items
- Test: Task list persists after blur/save
- Test: Nested task lists work correctly

Create: `frontend/tests/components/RichTextEditor.test.tsx`
- Test: Toggle task list creation
- Test: Check/uncheck task items
- Test: Task list persists in note entries
- Test: Task list HTML rendering

**E2E Tests:**
Update: `tests/e2e/tests/08-goals.spec.ts`
- Test: Create task list in daily goal
- Test: Check off task items
- Test: Task list persists after page reload
- Test: Task list works in sprint/quarterly goals

Update: `tests/e2e/tests/10-rich-text-editor.spec.ts`
- Test: Create task list in note entry
- Test: Check off task items in entry
- Test: Task list persists after page reload
- Test: Nested task lists

### 6. Documentation Updates
File: `README.md`

Update rich text editor sections to include task lists:
- Daily Goals: Add "Task lists with checkboxes" to feature list
- Sprint Goals: Add "Task lists with checkboxes" to feature list
- Quarterly Goals: Add "Task lists with checkboxes" to feature list
- Note Entry Editor: Add "Task lists with interactive checkboxes" to formatting options

### 7. Verification Steps
1. Run frontend tests: Via container
2. Run E2E tests: `./run_all_tests.sh`
3. Manually test in browser:
   - Create task list in daily goal
   - Check off items
   - Reload page and verify persistence
   - Create task list in note entry
   - Test nested task lists
   - Verify visual styling matches theme

## Critical Requirements (from .cursorrules)

### plan_logging
- ✓ Plan saved to .cursor/plans/ before execution

### git_workflow (critical: true)
- Pull from origin/main
- Create feature branch: feature/tasklist-editors
- Use Conventional Commits

### test_creation (critical: true)
- Unit tests for both editors MUST be created
- E2E tests MUST be added for all new functionality
- Tests MUST cover: creation, interaction, persistence, nesting
- Tests MUST pass before merging

### code_consistency (critical: true)
- Follow existing toolbar button patterns in both editors
- Use same styling approach (CSS variables, theme colors)
- Match icon usage from lucide-react library
- Keep button layout consistent with existing UI

### documentation (critical: true)
- Update README.md with task list feature
- Document in all three goal sections
- Document in note entry section

### local_test_execution (critical: true)
- Only run tests via ./run_all_tests.sh (containers)
- Never run npm test or pytest directly

## Files Modified
1. `frontend/package.json` - Add dependencies
2. `frontend/src/components/SimpleRichTextEditor.tsx` - Add extension + button
3. `frontend/src/components/RichTextEditor.tsx` - Add extension + button
4. `frontend/src/index.css` - Add task list styles
5. `frontend/tests/components/SimpleRichTextEditor.test.tsx` - New test file
6. `frontend/tests/components/RichTextEditor.test.tsx` - New test file
7. `tests/e2e/tests/08-goals.spec.ts` - Add tests
8. `tests/e2e/tests/10-rich-text-editor.spec.ts` - Add tests
9. `README.md` - Update documentation

## Expected Outcome
Users can create interactive checklists with checkboxes in both goals and note entries. Checked state persists across page reloads. UI matches existing editor styling and theme.

