# Cursor Rules Directory

This directory contains focused rule files to help AI assistants stay on task and maintain quality standards.

## Purpose

These rules integrate content from the main `.cursorrules` file and provide:
- Quick reference guides for common scenarios
- Focused guidelines to prevent scope creep
- Workflow best practices
- Quality checklists
- Critical rules from `.cursorrules` distributed into relevant sections
- Practical, actionable formats for different scenarios

## Rule Files

### 📋 [task-focus.md](./task-focus.md)
**When to reference**: At the start of every task and whenever considering expanding scope.

Core guidelines for:
- Understanding what the user actually wants
- Avoiding scope creep and "while I'm here" syndrome
- Knowing when to stop
- Completion criteria
- **Critical safety rules** (never break working code)
- **Code consistency requirements** (always follow existing patterns)

**Key principle**: Do what was asked, do it well, then stop.

**Includes from .cursorrules**: safety, code_consistency

### 🔄 [workflow.md](./workflow.md)
**When to reference**: For complex or multi-step tasks.

Standard workflow phases:
- Planning and documentation
- Understanding requirements
- Planning approach
- Implementation
- Verification
- Completion

Includes decision trees for common situations and git workflow best practices.

**Includes from .cursorrules**: git_workflow, plan_logging

### 💬 [communication.md](./communication.md)
**When to reference**: When responding to users or reporting status.

Guidelines for:
- Clear, concise responses
- **Documentation discovery and referencing**
- What to mention (and what to skip)
- Handling uncertainty
- Error reporting
- Progress updates

**Key principle**: Be helpful, be clear, be focused.

**Includes from .cursorrules**: documentation, external_docs_discovery (communication aspects)

### ✅ [verification.md](./verification.md)
**When to reference**: Before declaring any task complete.

Comprehensive checklists for:
- **CI compliance requirements** (critical)
- Pre-commit verification
- **Testing requirements and quality standards**
- **Documentation verification**
- Cleanup procedures
- Common issues to check
- Self-review process

**Key principle**: Verify your work before calling it done.

**Includes from .cursorrules**: ai_testing_compliance, testing, test_creation, documentation, external_docs_discovery, cleanup, before_pushing

### 🔧 [code-changes.md](./code-changes.md)
**When to reference**: When modifying any code.

Guidelines for:
- Following existing patterns
- Making minimal focused changes
- **File organization standards**
- **Code quality requirements**
- **Frontend-specific rules** (UI/UX, state management)
- **Database change procedures** (critical)
- Naming conventions
- Common patterns in this codebase
- What NOT to do

**Key principle**: Make minimal, focused changes that solve the problem.

**Includes from .cursorrules**: code_quality, code_consistency, ui_ux, context_state, file_organization, database_changes

## How to Use These Rules

### For AI Assistants
1. **Start with task-focus.md** - Understand the request and scope
2. **Reference workflow.md** - Follow the standard process
3. **Apply code-changes.md** - Make appropriate changes
4. **Use verification.md** - Check your work
5. **Follow communication.md** - Report clearly

### For Humans
These rules document:
- Expected AI behavior
- Project conventions
- Quality standards
- Common patterns

Feel free to update these rules as the project evolves.

## Integration with .cursorrules

These rules **incorporate and organize** content from the main `.cursorrules` file:

- **`.cursorrules`**: Master source of truth, comprehensive YAML configuration with all rules
- **`.cursor/rules/`**: Organized, practical guides that integrate `.cursorrules` content by topic
  - Safety rules distributed across relevant files
  - Testing requirements in verification.md
  - Code quality standards in code-changes.md
  - Git workflow in workflow.md
  - Documentation requirements throughout

**Key differences:**
- `.cursorrules` is the authoritative source (YAML format, complete specification)
- `.cursor/rules/` provides practical, focused guides derived from `.cursorrules`
- These files translate `.cursorrules` into actionable workflows
- Updates to `.cursorrules` should be reflected here

When rules conflict (rare), `.cursorrules` takes precedence as the source of truth.

## Quick Reference

| Situation | Rule File | Key Section |
|-----------|-----------|-------------|
| Starting a new task | task-focus.md | Scope Boundaries |
| "Should I also fix X?" | task-focus.md | When to Expand Scope |
| Making code changes | code-changes.md | Before Making Changes |
| Unsure about approach | workflow.md | Decision Points |
| Ready to commit | verification.md | Pre-Commit Checklist |
| Reporting completion | communication.md | Response Structure |
| Found unrelated bug | task-focus.md | When to Expand Scope |
| Writing tests | verification.md | For New Features |
| Updating docs | code-changes.md | Adding Features |

## Maintenance

### Updating These Rules

When `.cursorrules` changes:
1. Identify which topic areas are affected
2. Update the corresponding files here
3. Keep the language practical and actionable
4. Remove specific file/path references (keep generic)
5. Maintain the quick-reference format

Keep these rules:
- ✅ Focused and actionable
- ✅ Consistent with `.cursorrules`
- ✅ Up to date with project practices
- ✅ Practical and useful
- ✅ Organized by workflow phase/concern
- ❌ Not duplicating `.cursorrules` structure (transform for usability)
- ❌ Not including specific file paths (keep generic)
- ❌ Not overly prescriptive
- ❌ Not longer than needed

### Version Control

- These rule files are version-controlled (committed to git)
- Plans directory remains gitignored
- All team members benefit from these guides
- Changes should be reviewed like other documentation

