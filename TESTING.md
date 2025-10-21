# Testing Guide 🧪

## Manual Testing Checklist

### Backend API Testing

#### 1. Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

#### 2. Create a Note
```bash
curl -X POST http://localhost:8000/api/notes/ \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "fire_rating": 4}'
```

#### 3. Get Note by Date
```bash
curl http://localhost:8000/api/notes/2024-01-15
```

#### 4. Create Entry
```bash
curl -X POST http://localhost:8000/api/entries/note/2024-01-15 \
  -H "Content-Type: application/json" \
  -d '{"content": "<p>Test note</p>", "content_type": "rich_text", "order_index": 0}'
```

#### 5. Get Entries for Date
```bash
curl http://localhost:8000/api/entries/note/2024-01-15
```

#### 6. Update Fire Rating
```bash
curl -X PUT http://localhost:8000/api/notes/2024-01-15 \
  -H "Content-Type: application/json" \
  -d '{"fire_rating": 5}'
```

### Frontend Manual Testing

#### Navigation Tests
- [ ] Click "Today" button - should navigate to today's date
- [ ] Click "Calendar" - should show calendar view
- [ ] Click on a date in calendar - should navigate to that day
- [ ] Use arrow buttons in daily view to navigate days

#### Daily View Tests
- [ ] Add first entry - should create new entry card
- [ ] Type in editor - content should persist
- [ ] Add multiple entries - all should save independently
- [ ] Delete entry - should confirm and remove
- [ ] Set fire rating - should update immediately
- [ ] Navigate away and back - data should persist

#### Rich Text Editor Tests
- [ ] Bold text - select and click bold button
- [ ] Italic text - select and click italic
- [ ] Add heading - click H1 or H2
- [ ] Create bullet list
- [ ] Create numbered list
- [ ] Add blockquote
- [ ] Add inline code
- [ ] Add code block
- [ ] Add link - prompt should appear
- [ ] Add image - prompt should appear for URL

#### Calendar View Tests
- [ ] View current month
- [ ] Navigate to previous month
- [ ] Navigate to next month
- [ ] See indicators for days with notes (blue dot)
- [ ] See fire ratings on calendar
- [ ] Click date to navigate to daily view

#### Responsive Design Tests
- [ ] Desktop view (> 1024px) - full layout
- [ ] Tablet view (768-1024px) - adapted layout
- [ ] Mobile view (< 768px) - mobile-optimized
- [ ] Navigation is accessible on all sizes
- [ ] Editor toolbar wraps properly
- [ ] Calendar is usable on mobile

### Integration Testing

#### Full User Flow Test
1. **Start fresh** - Clear database
2. **Open app** - Should show today with no entries
3. **Add first entry** - Click button, type content
4. **Format text** - Use toolbar to format
5. **Add code block** - Insert code snippet
6. **Add image** - Insert image URL
7. **Set fire rating** - Click 3 fires
8. **Add second entry** - Click "Add Another Entry"
9. **Navigate to yesterday** - Use left arrow
10. **Add entry to yesterday** - Create content
11. **Go to calendar** - Click calendar nav
12. **Verify indicators** - Both days should show dots
13. **Click yesterday** - Should show yesterday's entry
14. **Delete an entry** - Confirm deletion works
15. **Return to today** - Verify content still exists

### API Documentation Testing

1. Open http://localhost:8000/docs
2. Verify all endpoints are listed
3. Try "Try it out" on various endpoints
4. Check response schemas

### Error Handling Tests

#### Frontend Error Tests
- [ ] Backend offline - should show connection error
- [ ] Invalid date navigation - should handle gracefully
- [ ] Delete non-existent entry - should handle error
- [ ] Rapid clicking - no duplicate entries

#### Backend Error Tests
```bash
# Try to create duplicate note
curl -X POST http://localhost:8000/api/notes/ \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "fire_rating": 4}'
# Should return 400 error

# Try to get non-existent note
curl http://localhost:8000/api/notes/2099-12-31
# Should return 404 error

# Try invalid fire rating
curl -X POST http://localhost:8000/api/notes/ \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-16", "fire_rating": 10}'
# Should return validation error
```

### Performance Tests

#### Load Testing (Manual)
1. Create 100+ notes for different dates
2. Test calendar load time
3. Test daily view with 20+ entries
4. Test editor with very long content
5. Test rapid auto-save operations

#### Browser Performance
1. Open Chrome DevTools
2. Run Lighthouse audit
3. Check Performance score
4. Check Accessibility score
5. Check Best Practices score

### Cross-Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Docker Testing

```bash
# Build and run
docker-compose up --build

# Verify containers are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test API from container
docker-compose exec backend curl http://localhost:8000/health

# Stop and verify data persistence
docker-compose down
docker-compose up
# Data should still be there
```

### Database Testing

#### SQLite Tests
```bash
# View database schema
sqlite3 backend/daily_notes.db ".schema"

# Count notes
sqlite3 backend/daily_notes.db "SELECT COUNT(*) FROM daily_notes;"

# View all notes
sqlite3 backend/daily_notes.db "SELECT * FROM daily_notes;"

# Verify relationships
sqlite3 backend/daily_notes.db "
  SELECT d.date, COUNT(e.id) as entry_count
  FROM daily_notes d
  LEFT JOIN note_entries e ON d.id = e.daily_note_id
  GROUP BY d.date;
"
```

## Automated Testing (Future)

### Backend Tests (pytest)
```python
# tests/test_api.py
def test_create_note():
    response = client.post("/api/notes/", json={"date": "2024-01-15"})
    assert response.status_code == 201

def test_get_note():
    response = client.get("/api/notes/2024-01-15")
    assert response.status_code == 200
```

### Frontend Tests (Jest/Vitest)
```typescript
// tests/DailyView.test.tsx
test('renders daily view', () => {
  render(<DailyView />);
  expect(screen.getByText(/add first entry/i)).toBeInTheDocument();
});
```

## Troubleshooting Common Issues

### Backend won't start
- Check Python version: `python --version`
- Verify venv is activated
- Check if port 8000 is free: `lsof -i :8000`
- Review logs for errors

### Frontend won't start
- Check Node version: `node --version`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check if port 3000 is free: `lsof -i :3000`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Database issues
- Delete DB file: `rm backend/daily_notes.db`
- Restart backend
- Check file permissions

### Docker issues
- Remove containers: `docker-compose down -v`
- Rebuild: `docker-compose build --no-cache`
- Check Docker disk space: `docker system df`

## Success Criteria

Your Daily Notes app is working correctly when:
- ✅ All API endpoints return expected responses
- ✅ Frontend loads without console errors
- ✅ Can create, read, update, delete notes and entries
- ✅ Fire ratings save and display correctly
- ✅ Calendar shows proper indicators
- ✅ Rich text editor has all formatting options
- ✅ Data persists after restart
- ✅ Responsive on mobile and desktop
- ✅ Docker deployment works smoothly

Happy Testing! 🎉

