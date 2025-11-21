# Quick Reference Card

## 🎯 The Golden Rules

### 1. Stay On Task
❌ "While I'm here, let me also..."  
✅ Complete the specific request, then stop

### 2. Follow Existing Patterns (CRITICAL)
❌ Introducing new approaches  
✅ Find similar code and copy its style  
❌ Creating new patterns when one exists  
✅ Maintain consistency across the codebase

### 3. Minimal Changes Only
❌ Refactoring, optimizing, "improving"  
✅ Change only what's needed for the task

### 4. Never Break Working Code (CRITICAL)
❌ Changing program code to fix tests  
✅ Fix tests or understand why they fail  
❌ Deleting code without understanding impact  
✅ Review dependencies before changing

### 5. Verify Before Committing (CRITICAL)
❌ "It's probably fine"  
✅ Run linter, tests, CI script locally  
❌ Pushing without local verification  
✅ All checks pass before commit

### 6. Update Side Effects
❌ Code-only changes  
✅ Update tests, docs, migrations as needed  
✅ Update backup/restore if data model changed

## ⚡ Quick Workflow

```
1. READ → Understand the request fully
2. SEARCH → Find existing patterns
3. PLAN → What's the minimal change?
4. CODE → Follow patterns, stay focused
5. TEST → Run linter and tests
6. VERIFY → Check git diff
7. UPDATE → Docs, tests, migrations
8. DONE → Report clearly
```

## 🚫 Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---------|-------|
| Fix unrelated issues | Note them, stay focused |
| Refactor working code | Leave it alone |
| Change program code to fix tests | Fix tests properly |
| Add "nice-to-have" features | Do what was asked only |
| Introduce new patterns | Use existing patterns |
| Change file formatting | Match existing style |
| Optimize prematurely | Solve the problem clearly |
| Skip documentation | Update affected docs |
| Push without local CI check | Run CI script locally first |
| Skip test creation | Always add tests for new functionality |

## 📋 Pre-Commit Checklist

```
[ ] Task complete?
[ ] Linter passes (all errors fixed)?
[ ] CI script passes locally?
[ ] Tests pass (via containerized script)?
[ ] Only related changes? (check git diff)
[ ] Documentation updated?
[ ] Database migrations added (if schema changed)?
[ ] Backup/restore scripts updated (if data model changed)?
[ ] Following existing patterns (not introducing new ones)?
[ ] No scope creep?
[ ] No working code broken?
[ ] All new functionality has tests?
```

## 🔍 Decision Flowcharts

### Should I modify this file?

```
Is it required for the task? 
├─ YES → Modify it
└─ NO → Is it a critical bug?
    ├─ YES → Fix and document why
    └─ NO → Leave it alone
```

### Should I expand the scope?

```
Did user explicitly ask?
├─ YES → Proceed
└─ NO → Is it a critical safety issue?
    ├─ YES → Fix and explain
    └─ NO → Note it, don't fix it
```

### Should I create a new pattern?

```
Does an existing pattern exist?
├─ YES → Use the existing pattern
└─ NO → Is this truly unique?
    ├─ YES → Create minimal pattern
    └─ NO → Adapt closest pattern
```

## 💡 When In Doubt

1. **Look for examples** - Search codebase for similar functionality
2. **Ask, don't assume** - Clarify requirements if unclear  
3. **Go minimal** - Smallest change that solves the problem
4. **Test it** - Actually verify it works
5. **Check yourself** - Review your changes critically

## 🎓 Core Principles

> **Task Focus**: Do what was asked. Do it well. Then stop.

> **Code Changes**: Follow patterns. Make minimal changes. Verify thoroughly.

> **Communication**: Be clear. Be concise. Be helpful.

> **Quality**: Tests pass. Docs updated. No regressions.

## 📚 Full Rules

For detailed guidelines, see:
- `task-focus.md` - Staying on task
- `workflow.md` - Step-by-step process
- `code-changes.md` - Making changes
- `verification.md` - Quality checks
- `communication.md` - Clear reporting

## 🆘 Emergency Situations

### If you break something:
1. Revert the change
2. Understand what went wrong
3. Fix properly
4. Test thoroughly

### If tests fail:
1. Did your changes cause it?
   - YES → Fix your changes (never change program code just to fix tests)
   - NO → Report it, continue (unless blocking)
2. Check documentation for expected behavior
3. Verify test logic matches documented functionality

### If requirements are unclear:
1. State your understanding
2. List your assumptions
3. Ask for confirmation
4. Then proceed

---

**Remember**: The goal is quality, focused work. Speed means nothing if the result is wrong or creates more problems.

