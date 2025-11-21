# AI Agent Guide - Track the Thing

> **Welcome!** This guide helps AI assistants work effectively in this codebase.

## 🎯 Quick Start

### Before You Begin Any Task

1. **Read the request completely** - Understand what's actually being asked
2. **Check `.cursor/rules/QUICK-REFERENCE.md`** - Critical rules at a glance
3. **Find similar code** - Search for existing patterns before creating new ones
4. **Stay focused** - Do exactly what was asked, nothing more

### The Golden Rule

**Never break working code. Follow existing patterns. Verify everything.**

## 📚 Essential Reading

Your primary resources in order of importance:

1. **`.cursor/rules/QUICK-REFERENCE.md`** - Start here every time
2. **`.cursor/rules/task-focus.md`** - Stay on task, avoid scope creep
3. **`.cursor/rules/verification.md`** - Before declaring anything complete
4. **`.cursorrules`** - Complete authoritative specification (YAML)

Full rules directory: `.cursor/rules/` - Organized by workflow phase

## 🚨 Critical Rules (Never Violate)

### Safety First
- ❌ **NEVER** change program code to fix tests
- ❌ **NEVER** modify or delete working code without full understanding
- ❌ **NEVER** push without running local CI checks
- ❌ **NEVER** introduce new patterns when existing ones exist
- ✅ **ALWAYS** preserve existing functionality
- ✅ **ALWAYS** follow established patterns

### Testing Requirements
- ❌ **NEVER** run tests directly (use containerized test script)
- ❌ **NEVER** skip test creation for new functionality
- ❌ **NEVER** modify valid tests to make them pass
- ✅ **ALWAYS** add tests for new features
- ✅ **ALWAYS** run full test suite via script before committing

### Code Consistency
- ❌ **NEVER** create new patterns when one exists
- ❌ **NEVER** refactor unrelated code
- ✅ **ALWAYS** search for similar implementations first
- ✅ **ALWAYS** match existing naming, structure, and style

### Database Changes
- ✅ **ALWAYS** create migration scripts for schema changes
- ✅ **ALWAYS** update backup/restore scripts for data model changes
- ✅ **ALWAYS** test migrations can upgrade from previous versions

### Before Every Commit
1. Run linter (fix all errors)
2. Run containerized test script
3. Run local CI verification script
4. Check git diff (no unintended changes)
5. Update documentation if behavior changed

## 🗺️ Project Structure

```
track-the-thing/
├── backend/              # Python/FastAPI backend
│   ├── app/
│   │   ├── routers/     # API endpoints
│   │   ├── models.py    # Database models
│   │   └── schemas.py   # Pydantic schemas
│   ├── migrations/      # Database migrations
│   └── requirements.txt
├── frontend/            # React/TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   └── hooks/       # Custom hooks
│   └── tests/          # Frontend tests
├── desktop/            # Desktop app (Tauri)
│   └── tauri/
├── tests/              # Test suite (top-level)
│   ├── backend/        # Backend tests
│   └── e2e/           # End-to-end tests
├── .cursorrules       # Complete rule specification (YAML)
└── .cursor/rules/     # Practical workflow guides
```

## 🔍 Common Tasks

### Adding a New Feature
1. Search for similar features first
2. Follow that pattern exactly
3. Create tests for new functionality
4. Update documentation
5. Create migration if database changes
6. Update backup/restore if data model changes

### Fixing a Bug
1. Find and review external documentation if available
2. Write test that reproduces the bug
3. Fix the code (never change code just to fix tests)
4. Verify test passes
5. Ensure no regressions
6. Update documentation if behavior was misunderstood

### Refactoring Code
1. **Get explicit permission first** (don't do this unsolicited)
2. Ensure all tests pass before starting
3. Make focused changes only
4. Ensure all tests still pass
5. No behavior changes
6. Document why you refactored

## 💡 How to Find Things

### Finding Patterns
```bash
# Search for similar functionality
grep -r "pattern" backend/app/
grep -r "ComponentName" frontend/src/

# Find similar API endpoints
ls backend/app/routers/

# Find similar components
ls frontend/src/components/
```

### Documentation Locations
- `README.md` - Project overview and setup
- `backend/migrations/README.md` - Migration procedures
- `desktop/README-desktop.md` - Desktop app specifics
- Internal docs should be in `/docs/` if they exist

### Configuration Files
- `.env` / `.tourienv` - Environment configuration (examples: `.env.example`, `.tourienv.example`)
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies
- `desktop/tauri/tauri.conf.json` - Tauri configuration

## 🎨 Frontend-Specific Rules

### Styling
- **ALWAYS** use theme variables: `var(--color-*)`
- **NEVER** hardcode colors
- Ensure responsive design (wide and compact layouts)
- Use consistent toggle and button styles

### State Management
- Use React Context for global data (theme, settings, preferences)
- Keep state local when sharing isn't needed
- Store user preferences in localStorage
- Provide default values for localStorage items
- Clean up effects, intervals, and event listeners

### TypeScript
- Keep strict mode enabled
- Avoid `any` type
- Use proper typing
- No `console.log` in production (except critical errors)

## 🐍 Backend-Specific Rules

### API Endpoints
- Follow existing router patterns
- Use consistent error handling
- Maintain existing validation patterns
- Keep routers focused and small

### Database
- Use existing session patterns
- Always create migrations for schema changes
- Test migrations thoroughly
- Update backup/restore scripts for data model changes

## ✅ Pre-Commit Checklist

```
[ ] Task is complete (nothing more, nothing less)
[ ] Linter passes (all errors fixed, no exceptions)
[ ] Tests pass (via containerized script)
[ ] Local CI script passes (exit code 0)
[ ] Git diff reviewed (only relevant changes)
[ ] Documentation updated (if behavior changed)
[ ] Migrations created (if database schema changed)
[ ] Backup/restore updated (if data model changed)
[ ] Following existing patterns (no new patterns introduced)
[ ] Tests created (for all new functionality)
[ ] No working code broken
[ ] No scope creep
```

## 🚫 Common Mistakes to Avoid

| ❌ Don't Do This | ✅ Do This Instead |
|-----------------|-------------------|
| "While I'm here, let me also..." | Complete the specific request only |
| Change program code to fix tests | Fix the tests or understand why they fail |
| Introduce new patterns | Use existing patterns consistently |
| Refactor unrelated code | Leave working code alone |
| Skip documentation updates | Update docs when behavior changes |
| Push without local CI check | Always run CI script locally first |
| Skip test creation | Always add tests for new features |
| Guess at errors | Read actual error logs |
| Run tests directly | Use containerized test script |
| Hardcode colors in UI | Use theme variables |

## 🆘 When Things Go Wrong

### Tests Fail
1. Did your changes cause it?
   - **YES** → Fix your changes (don't change program code to fix tests)
   - **NO** → Report it, continue unless blocking
2. Check documentation for expected behavior
3. Verify test logic matches documented functionality

### CI Fails
1. **DO NOT GUESS** - Read actual CI error logs
2. Reproduce error locally using exact CI commands
3. Fix the error
4. Run local CI script to verify
5. Only push if checks pass

### Uncertain About Requirements
1. State your understanding
2. List your assumptions
3. Ask for confirmation
4. Then proceed

### Found Critical Bug
1. Assess severity (data loss, security, crashes)
2. If critical: fix it and document why
3. If non-critical: note it, continue with original task

## 🎓 Learning Resources

### Understanding the Codebase
- Read existing similar code
- Check test files to understand expected behavior
- Review commit history for context
- Look for documentation in relevant directories

### Best Practices
- `.cursor/rules/` directory - All workflow guides
- `.cursorrules` - Complete specification
- Existing code - Best examples of patterns

## 📝 Summary

**Your Mission**: Complete the user's request accurately, safely, and efficiently.

**Your Constraints**: 
- Never break working code
- Always follow existing patterns
- Always verify your work
- Always add tests for new functionality

**Your Tools**:
- `.cursor/rules/` for practical guides
- `.cursorrules` for complete specification
- Existing codebase for patterns
- Containerized test scripts for verification

**Your Success Criteria**:
- Task completed as requested
- All tests pass
- Documentation updated
- No regressions introduced
- Code follows existing patterns
- CI checks pass locally

---

**Remember**: Quality over speed. It's better to do it right than do it fast.

Good luck! 🚀

