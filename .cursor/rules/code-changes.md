# Code Changes Rules

## Core Principle
**Make minimal, focused changes that solve the problem without breaking existing functionality.**

## Before Making Changes

### 1. Understand the Existing Code
- Read the file(s) you'll modify
- Understand the current behavior
- Check for existing patterns
- Look for similar implementations
- Review related tests

### 2. Plan Your Approach
- What's the minimal change needed?
- What files must be modified?
- What tests need updating?
- Are there side effects?
- Will this require migration?

### 3. Search for Patterns
```
Questions to ask:
- How is this done elsewhere in the codebase?
- Is there a utility function for this?
- What's the established pattern?
- Are there examples I can follow?
```

## Making Changes

### General Rules
- ✅ Follow existing code style
- ✅ Match existing patterns
- ✅ Keep functions small and focused
- ✅ Use descriptive names
- ✅ Handle errors appropriately
- ✅ Add comments for complex logic
- ❌ Introduce new patterns without reason
- ❌ Mix refactoring with feature work
- ❌ Change formatting in unrelated code
- ❌ Add unnecessary abstractions

### File-Specific Guidelines

#### Frontend (TypeScript/React)
- Use existing hooks and contexts
- Follow component structure of similar components
- Use theme variables (var(--color-*)), never hardcode colors
- Maintain responsive design
- Store preferences in localStorage consistently
- Clean up effects, intervals, listeners
- Use TypeScript types, avoid 'any'
- Keep TypeScript strict mode enabled
- Disallow console.log in production (except for critical errors)

##### UI/UX Standards
- Use consistent toggle and button styles across the app
- Ensure responsive design in both wide and compact layouts
- Store user preferences in localStorage where appropriate
- Keep UI elements visually and structurally consistent

##### State Management
- Use React Context for global data (themes, settings, preferences)
- Keep state local when sharing is not required
- Provide default values for all localStorage items
- Clean up effects, intervals, and listeners properly

#### Backend (Python/FastAPI)
- Follow existing router patterns
- Use existing database session patterns
- Maintain consistent error handling
- Follow existing validation patterns
- Use existing utility functions
- Keep routers focused and small

#### Database Changes (CRITICAL)
- Always create migration scripts in the designated migrations folder
- Ensure migrations upgrade cleanly from all previous versions
- Update backup/restore logic in the appropriate router module
- Test migrations on a database copy before committing
- Verify backward compatibility or clearly document breaking changes
- Never skip migration creation for schema changes

#### Tests
- Follow existing test structure
- Use existing fixtures/helpers
- Write descriptive test names
- Test both success and failure cases
- Keep tests focused and fast
- Don't modify test logic to pass tests

## Types of Changes

### Adding Features
1. Check if similar feature exists
2. Follow that pattern exactly
3. Add tests for new behavior
4. Update documentation
5. Consider configuration needs

### Fixing Bugs
1. Write test that reproduces bug
2. Fix the bug (minimal change)
3. Verify test passes
4. Verify no regression
5. Document what was wrong

### Refactoring
1. **Get explicit permission first**
2. Ensure all tests pass before
3. Make focused refactoring
4. Ensure all tests pass after
5. No behavior changes
6. Document why you refactored

### Updating Dependencies
1. Check for breaking changes
2. Update one dependency at a time
3. Run full test suite
4. Update code if APIs changed
5. Document version changes

## File Organization

Maintain consistent file structure:
- **Components**: Organized in the components directory
- **Contexts**: Organized in the contexts directory  
- **Hooks**: Organized in the hooks directory
- **Routers**: Organized in the routers directory (backend)
- **Migrations**: Organized in the migrations directory (backend)

Keep files where similar files already exist. Don't create new organizational patterns.

## Code Quality Standards

### Linting
- Run linter before committing
- Fix all linter errors (no exceptions)
- No warnings should be ignored
- Linter configuration is strict for a reason

### Production Code
- No debug code or temporary hacks
- No commented-out code
- No console.log statements (except critical errors)
- No hardcoded credentials or API keys

## Code Style

### Naming Conventions
- **Variables**: descriptive, not abbreviated
  - ✅ `userSettings`, `currentTheme`
  - ❌ `usrStgs`, `t`
  
- **Functions**: verb + noun, describe action
  - ✅ `getUserSettings()`, `toggleTheme()`
  - ❌ `doIt()`, `process()`
  
- **Components**: PascalCase, descriptive
  - ✅ `SettingsPanel`, `ThemeToggle`
  - ❌ `Settings2`, `Toggle`
  
- **Files**: match content, kebab-case or PascalCase
  - ✅ `UserSettings.tsx`, `theme-toggle.tsx`
  - ❌ `utils2.tsx`, `stuff.tsx`

### Function Size
- Ideal: < 20 lines
- Acceptable: < 50 lines
- Too long: > 50 lines (consider splitting)
- Exception: Tests can be longer

### Complexity
- Limit nesting to 3 levels
- Limit function parameters to 4
- Extract complex conditions to named variables
- Use early returns to reduce nesting

### Comments
When to comment:
- ✅ Complex algorithms or business logic
- ✅ Non-obvious workarounds
- ✅ Important assumptions
- ✅ TODOs with context
- ❌ What the code does (should be obvious)
- ❌ Commented-out code (delete it)

## Common Patterns

### Error Handling
```typescript
// Frontend
try {
  const result = await apiCall();
  // handle success
} catch (error) {
  console.error('Descriptive message:', error);
  // handle error appropriately
}
```

```python
# Backend
try:
    result = operation()
    return result
except SpecificError as e:
    logger.error(f"Descriptive message: {e}")
    raise HTTPException(status_code=400, detail="User-friendly message")
```

### State Management
```typescript
// Use existing contexts
const { theme, setTheme } = useTheme();

// Store preferences consistently
localStorage.setItem('key', JSON.stringify(value));
const value = JSON.parse(localStorage.getItem('key') || 'default');
```

### Database Queries
```python
# Follow existing patterns
def get_items(db: Session, user_id: int):
    return db.query(Model).filter(Model.user_id == user_id).all()
```

## Don't Do These

### Premature Optimization
- ❌ Don't optimize without measuring
- ❌ Don't add caching "just in case"
- ❌ Don't worry about performance until it's a problem
- ✅ Write clear code first, optimize later if needed

### Over-Engineering
- ❌ Don't add abstraction layers unnecessarily
- ❌ Don't create frameworks for single use cases
- ❌ Don't add features "for future use"
- ✅ Solve the current problem simply

### Scope Creep
- ❌ Don't fix unrelated issues
- ❌ Don't refactor while adding features
- ❌ Don't "improve" code you're not changing
- ✅ Stay focused on the task

### Breaking Changes
- ❌ Don't change APIs without migration path
- ❌ Don't remove features without deprecation
- ❌ Don't change behavior without updating tests
- ✅ Consider backward compatibility

## Code Review Self-Check

Before committing, ask:
- [ ] Does this follow existing patterns?
- [ ] Is this the minimal change needed?
- [ ] Would another developer understand this?
- [ ] Are there any side effects?
- [ ] Did I update tests?
- [ ] Did I update documentation?
- [ ] Would I approve this code review?

## Quick Reference

### Making a Change
1. Find similar code
2. Follow that pattern
3. Make minimal change
4. Update tests
5. Update docs
6. Verify it works

### Reviewing a Change
1. Does it solve the problem?
2. Does it follow conventions?
3. Are there tests?
4. Is documentation updated?
5. Any unintended side effects?
6. Would this break anything?

