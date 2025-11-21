# Workflow Rules

## Standard Task Workflow

### Phase 0: Planning (for complex tasks)
1. **Display your plan**
   - Show plan output before execution begins
   - Make the approach visible and reviewable
   - Never execute a plan silently

2. **Save plans when appropriate**
   - Document planning steps for traceability
   - Use descriptive naming for easy reference
   - Include task, branch, and timestamp context

3. **Plan structure**
   - Clear task description
   - Step-by-step approach
   - Identified risks or dependencies

### Phase 1: Understanding
1. **Read the request completely**
   - Don't jump to solutions
   - Identify the core ask
   - Note any constraints or requirements

2. **Gather context**
   - Check relevant files
   - Review existing patterns
   - Look for similar implementations
   - Check documentation

3. **Clarify if needed**
   - Ask questions if requirements are unclear
   - Confirm assumptions before proceeding
   - Get approval for any scope changes

### Phase 2: Planning
1. **Create a mental or explicit plan**
   - Break complex tasks into steps
   - Identify dependencies
   - Note potential risks

2. **Check for existing patterns**
   - Search for similar functionality
   - Follow established conventions
   - Maintain consistency

3. **Verify approach**
   - Does this follow project standards?
   - Are there simpler solutions?
   - Will this require database changes?

### Phase 3: Implementation
1. **Make focused changes**
   - Change only what's needed
   - Follow existing code style
   - Maintain consistency with codebase
   - Write clear, self-documenting code

2. **Handle side effects**
   - Update tests if behavior changes
   - Update documentation if needed
   - Add migrations if database changes
   - Update backup/restore if data model changes

3. **Stay organized**
   - Make logical commits
   - Keep changes related to the task
   - Don't mix unrelated changes

### Phase 4: Verification
1. **Check your work**
   - Review changes with git diff
   - Run linter and fix errors
   - Ensure tests pass
   - Verify functionality manually if needed

2. **Update supporting files**
   - Documentation reflects changes
   - README updated if user-facing
   - Migration scripts if database changed
   - Config examples if settings changed

3. **Clean up**
   - Remove debug code
   - Remove unused imports
   - Remove temporary files
   - Ensure no commented-out code

### Phase 5: Completion
1. **Final verification**
   - All acceptance criteria met
   - No linter errors
   - Tests pass
   - Documentation current

2. **Communicate clearly**
   - Summarize what was done
   - Note any caveats or considerations
   - Mention follow-up items if any
   - Confirm task completion

## Decision Points

### Should I modify this file?
- ✅ Directly related to current task
- ✅ Required for task to work correctly
- ✅ Critical bug affecting the task
- ❌ "Might as well clean this up"
- ❌ Unrelated improvement opportunity
- ❌ Code style preference

### Should I create a new pattern?
- ✅ No existing pattern exists
- ✅ Existing pattern doesn't fit
- ✅ User explicitly requested
- ❌ Personal preference
- ❌ "Better" than existing pattern
- ❌ Just because you can

### Should I update this documentation?
- ✅ Changed behavior documented in this file
- ✅ User-facing change affecting this doc
- ✅ Inaccurate information discovered
- ❌ Minor wording improvements
- ❌ Adding nice-to-have sections
- ❌ Comprehensive rewrites

## Git Workflow Best Practices

### Creating Branches
1. **Always start from latest main**
   - Fetch and rebase from remote main before creating a new branch
   - Confirm local main matches the remote
   - Branches not created from latest remote are invalid

2. **Branch naming**
   - Use descriptive names: feature/descriptive-name
   - Include context about what's being built

3. **Before committing**
   - Check git status and git diff
   - Ensure only relevant files are staged
   - Use clear, conventional commit messages

### Maintaining Clean History
- Never force push to main/master without explicit approval
- Verify pull requests can merge cleanly with no conflicts
- Delete stale branches once merged to keep the repo clean
- Commit or stash all changes before running cleanup or migrations

### Enforcement
- Treat failure to rebase before branching as a critical workflow violation
- Reject commits showing outdated base commits

## Emergency Procedures

### If you discover a critical bug:
1. Assess severity (data loss, security, crashes)
2. If critical: fix it, document why
3. If non-critical: note it, continue with task

### If tests fail:
1. Check if your changes caused it
2. If yes: fix your changes
3. If no: report it, continue with task (unless blocking)

### If you break something:
1. Revert the breaking change
2. Understand what went wrong
3. Find correct approach
4. Try again

