# Production Upgrade - Simple Version

## What You Need to Do

```bash
# 1. Backup (1 minute)
cp backend/data/daily_notes.db backend/data/daily_notes.db.backup-$(date +%Y%m%d)

# 2. Deploy (3 minutes) - Everything runs automatically!
git pull origin main
docker compose down
docker compose build  
docker compose up -d

# 3. Done! (Optional: verify)
docker compose logs backend | grep "Migration.*completed"
```

**Total time: 5 minutes**

---

## What Happens Automatically

When you run `docker compose up -d`, the backend will:

✅ Run migration 011 (adds goal columns if needed)
✅ Run migration 012 (moves goals to app_settings)  
✅ Run migration 013 (adds date tracking for goals)
✅ **Run migration 014 (FIXES TIMEZONE ISSUES AUTOMATICALLY!)**
✅ **Run migration 015 (DATE-AWARE GOALS - Historical Tracking!)**

Migration 014 will:
- Check all your entries
- Find any entries on the wrong date (due to UTC vs EST)
- Move them to the correct dates
- Report: "✓ Moved X entries to correct dates"

Migration 015 will:
- Create new `sprint_goals` and `quarterly_goals` tables
- Migrate existing goals from `app_settings` to new tables (if you have any)
- Enable historical goal tracking with date ranges
- Report: "✓ Migration 015 completed successfully"

---

## What If Something Goes Wrong?

```bash
# Stop everything
docker compose down

# Restore backup
cp backend/data/daily_notes.db.backup-YYYYMMDD backend/data/daily_notes.db

# Restart with old code
git checkout <previous-commit>
docker compose up -d
```

---

## How Do I Know It Worked?

1. Check migration logs:
```bash
docker compose logs backend | grep "✓ Migration"
```

You should see:
```
✓ Migration 011_add_goal_fields.py completed successfully
✓ Migration 012_move_goals_to_settings.py completed successfully
✓ Migration 013_add_goal_date_fields.py completed successfully
✓ Migration 014_fix_timezone_entries.py completed successfully
✓ All migrations completed successfully!
```

2. Check your data:
```bash
docker compose exec backend python3 -c "
import sqlite3
conn = sqlite3.connect('data/daily_notes.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM daily_notes')
print(f'Daily notes: {cursor.fetchone()[0]}')
cursor.execute('SELECT COUNT(*) FROM note_entries')
print(f'Note entries: {cursor.fetchone()[0]}')
conn.close()
"
```

3. Open your browser and check that recent entries appear on the **correct dates**

---

## Questions & Answers

**Q: Will my data be lost?**  
A: No! All migrations preserve data. Migration 014 was tested and verified.

**Q: What if I have a LOT of entries?**  
A: Migration 014 processes all entries in seconds. Tested with production-scale data.

**Q: Can I run this multiple times?**  
A: Yes! All migrations are idempotent (safe to run repeatedly).

**Q: What timezone does it use?**  
A: America/New_York (EST/EDT). If you need a different timezone, edit line 54 of `backend/migrations/014_fix_timezone_entries.py` before deploying.

**Q: Do I need to restart after migration?**  
A: No, the backend automatically picks up changes after migrations complete.

---

## After Upgrade

Your users will have:
- 🎯 Daily Goals (refresh daily)
- 🚀 Sprint Goals (date-aware, historical tracking, automatic for viewed date)
- 🌟 Quarterly Goals (date-aware, historical tracking, automatic for viewed date)
- 📅 Date tracking with countdown timers calculated from the date being viewed
- 🔒 Read-only past goals (editable only if end_date >= today)
- 📊 Ability to create new goals with specific date ranges
- ⏰ **Correct timezone handling** - entries on the right dates!
- 🗂️ Full goal history - see different goals when viewing different dates!

---

For detailed technical information, see `PRODUCTION_UPGRADE_GUIDE.md`

