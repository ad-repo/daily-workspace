# Task Focus Rules

## Core Principle
**Stay focused on the user's explicit request. Complete the current task before suggesting improvements.**

## Critical Safety Rules

### Never Compromise Working Code
- Never modify or delete working code unless the change is fully understood and justified
- Never change program code to fix tests - fix the tests or understand why they fail
- Never attempt optimizations or refactors without confirming tests pass before and after
- Never perform large deletions or rewrites without version control commits or backups
- Treat working code as production-critical unless explicitly marked for removal

### When Uncertain
- If uncertain about side effects, isolate the change in a feature branch and test thoroughly
- Review the impact of changes on dependent modules, APIs, and data flows
- Preserve existing functionality before implementing improvements
- If a proposed action risks destroying working functionality, stop and request human review

### Safeguards
- Check git diff before committing to confirm no unrelated code is altered
- Verify no regressions in functionality or performance after edits
- Avoid destructive bulk operations (search-replace, auto-fix, reformat) without previewing changes
- Revert immediately if tests or builds fail after a structural edit
- Never prioritize speed or cleanliness over stability

## Rules

### 1. Understand the Request First
- Read the user's request completely
- Identify the specific, actionable task
- Ask clarifying questions if the goal is unclear
- Don't assume additional requirements

### 2. Scope Boundaries
- **Do**: Execute the requested task fully and correctly
- **Don't**: Add unrequested features or improvements
- **Don't**: Refactor unrelated code
- **Don't**: Suggest enhancements unless asked
- **Exception**: Fix critical bugs or safety issues you encounter

### 3. Stay On Track
- If you discover related issues, note them but don't fix them unless critical
- Complete the current task before moving to next items
- One task at a time - finish before starting another
- Resist the urge to "improve" things outside the scope

### 4. Completion Criteria
A task is complete when:
- The specific request is fulfilled
- Tests pass (if applicable)
- No linter errors introduced
- Documentation updated (if behavior changed)
- User confirms satisfaction or no follow-up needed

### 5. When to Expand Scope
Only expand scope when:
- User explicitly requests it
- Critical bug will cause immediate failure
- Security vulnerability discovered
- Data loss risk identified
- Otherwise: note it, mention it, but don't fix it

### 6. Code Consistency is Mandatory
- Always follow existing patterns and styles
- Check for similar implementations before adding new features
- Keep UI elements visually and structurally consistent
- Match naming conventions, file structure, and organization
- **Do not introduce new patterns when one already exists**

## Common Pitfalls to Avoid
- ❌ "While I'm here, let me also..."
- ❌ Refactoring working code that isn't part of the task
- ❌ Optimizing performance when not requested
- ❌ Adding error handling everywhere "just in case"
- ❌ Updating styling/formatting in unrelated files
- ✅ Do exactly what was asked, do it well, then stop

## Task Completion Checklist
Before marking a task complete:
- [ ] Original request fully addressed
- [ ] No scope creep occurred
- [ ] Changes tested/verified
- [ ] Documentation updated if needed
- [ ] No unnecessary changes made
- [ ] User's question answered directly

