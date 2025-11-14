# Add List Labels and Fix All Tests

## Summary
This PR adds support for labels on lists (many-to-many relationship), removes the `/dev/null` feature, fixes all E2E tests, and adds CI configuration. All 630 tests are now passing.

## ✨ New Features

### List Labels
- Lists can now have multiple labels (many-to-many relationship)
- Label selector integrated into list cards
- Labels displayed as pills on lists
- API endpoints: `POST/DELETE /api/lists/{list_id}/labels/{label_id}`

### Unified Search
- New `/api/search/all` endpoint searches both entries and lists
- Search results show both entries and lists with their labels
- Larger, card-based result display for better readability
- Click list results to navigate directly to that list

### UI Improvements
- Markdown preview now toggles instead of side-by-side view
- List pills use squared edges (differentiated from label pills)
- "Add to list" button right-aligned on entry cards
- Improved search results layout

## 🗑️ Removals

### /dev/null Feature
- Removed `is_dev_null` field from all schemas and models
- Removed skull icon from calendar view
- Removed all supporting code in routers (entries, backup, reports, search)
- **BREAKING CHANGE**: Any code relying on `is_dev_null` will need updates

## 🐛 Bug Fixes

### E2E Tests (All Passing)
1. **Frontend Dependencies**: Rebuilt `frontend-e2e` service to install missing `marked` package
2. **Database Migrations**: Fixed migration runner to respect `DATABASE_URL` environment variable
   - E2E backend now correctly uses `e2e_daily_notes.db`
   - Created centralized `get_db_path_from_env()` function
3. **Test Selectors**: Updated for UI changes
   - Increased `.ProseMirror` editor timeout to 10s
   - Updated heading picker test for dropdown menu
   - Updated list selector test for inline button
4. **Pinned Entries**: Fixed hanging tests by using eager loading and direct SQL inserts

### Frontend Tests
- Fixed Settings test timing issue with `act()` wrapper
- Increased label loading timeout to 10s
- All 259 tests passing

## 🏗️ Infrastructure

### CI/CD
- Added GitHub Actions workflow (`.github/workflows/ci.yml`)
- Automated testing on push/PR to main/develop
- Backend and frontend linting
- Coverage and test report uploads
- Docker layer caching for faster builds

### Testing
- Added test suite arguments to `run_all_tests.sh`
- Set `CI=true` in frontend test containers
- Added pytest timeout for hanging test detection
- Updated `.gitignore` to prevent test artifacts

## 📊 Test Results
✅ **All 630 tests passing**
- Backend: 255 passed, 4 skipped, 1 xfailed
- Frontend: 259 passed, 1 skipped
- E2E: 116 passed, 4 skipped

## 🗄️ Database Changes
- Migration 018: `list_labels` association table
- Updated backup/restore to handle list labels
- Migration runner now respects `DATABASE_URL` environment variable

## 📝 Documentation
- Updated README with new features
- Added CLEANUP_SUMMARY.md
- Updated migration README
- All documentation aligned with implementation

## 🧹 Cleanup
Removed cruft files:
- `test_output.log`, `test_results.txt` (temporary test files)
- `cleanup_labels.py` (debug script)
- `backend/fix_timezone_entries.py` (one-time migration script)
- `backend/daily_notes.db` (duplicate database file)
- `package.json` (outdated root file)

## 🔍 Code Quality
- No linter errors
- All `.cursorrules` compliance verified
- No working code modified to fix tests
- All tests validate actual application behavior

## 📦 Files Changed
- **57 files changed**: 1966 insertions, 1146 deletions
- **50 modified**, **6 deleted**, **4 new**

## 🚀 Breaking Changes
⚠️ **BREAKING CHANGE**: The `is_dev_null` field has been removed from all entry schemas. Any external integrations or scripts relying on this field will need to be updated.

## ✅ Checklist
- [x] All tests passing (backend, frontend, e2e)
- [x] Database migrations added and tested
- [x] Backup/restore scripts updated
- [x] Documentation updated
- [x] Linter errors fixed
- [x] CI configuration added
- [x] Cruft removed
- [x] `.cursorrules` compliance verified

## 🔗 Related Issues
Closes #[issue-number] (if applicable)

---

**Ready to merge** - All tests passing, documentation updated, cruft removed, CI configured.

