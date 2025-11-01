# Quick Reference 🚀

Command cheat sheet for Track the Thing workspace.

## 🎯 Quick Start

```bash
# Docker (easiest)
docker-compose up --build

# Local development
./scripts/setup-local.sh  # One-time setup
```

## ⚡ UV Commands

```bash
# Install uv (one time)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create venv and install deps
uv venv
source venv/bin/activate
uv pip install -r requirements.txt

# Add package
uv pip install package-name
uv pip freeze > requirements.txt
```

## 🐍 Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## ⚛️ Frontend

```bash
cd frontend
npm install
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview build
```

## 🐳 Docker

```bash
docker-compose up              # Start
docker-compose up -d           # Background
docker-compose up --build      # Rebuild
docker-compose down            # Stop
docker-compose logs -f         # View logs
docker-compose restart backend # Restart service
docker-compose down -v         # Remove volumes
```

## 🗄️ Database

```bash
# Location: backend/data/daily_notes.db

# View schema
sqlite3 backend/data/daily_notes.db ".schema"

# Query notes
sqlite3 backend/data/daily_notes.db "SELECT * FROM daily_notes;"

# Query entries
sqlite3 backend/data/daily_notes.db "SELECT * FROM note_entries;"

# Reset (CAUTION: deletes all data!)
rm backend/data/daily_notes.db
```

## 📡 API Testing

```bash
# Health check
curl http://localhost:8000/health

# Get all notes
curl http://localhost:8000/api/notes/

# Get note by date
curl http://localhost:8000/api/notes/2024-01-15

# Create note
curl -X POST http://localhost:8000/api/notes/ \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "daily_goal": "Ship feature"}'
```

## 🔍 Troubleshooting

```bash
# Check ports
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill port
kill -9 $(lsof -t -i :8000)

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +

# Clear Node cache
cd frontend && rm -rf node_modules .vite && npm install

# Reset everything
docker-compose down -v
rm -rf backend/venv frontend/node_modules
rm backend/data/daily_notes.db
```

## 📂 Key Files

```
backend/app/main.py          - FastAPI entry point
backend/app/models.py        - Database models
backend/app/routers/         - API endpoints
backend/requirements.txt     - Python deps

frontend/src/App.tsx         - Main component
frontend/src/components/     - UI components
frontend/package.json        - Node deps

docker-compose.yml           - Docker config
```

## 🌐 URLs

```
Frontend:     http://localhost:3000
Backend:      http://localhost:8000
API Docs:     http://localhost:8000/docs
Alt Docs:     http://localhost:8000/redoc
```

## 🎨 Development Workflow

```bash
# 1. Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# 2. Start frontend (new terminal)
cd frontend
npm run dev

# 3. Make changes and test
# 4. Commit
git add .
git commit -m "description"
git push
```

## 🔐 Environment Variables

```bash
# Backend (.env)
DATABASE_URL=sqlite:///./data/daily_notes.db

# Frontend (.env)
VITE_API_URL=http://localhost:8000
```

## 📝 Git Commands

```bash
git status
git add .
git commit -m "message"
git push

git checkout -b feature-name    # New branch
git checkout main               # Switch branch
```

## 📊 API Endpoints Summary

**Notes**: `/api/notes/`
- GET / - List all
- GET /{date} - Get by date
- POST / - Create
- PATCH /{date} - Update
- DELETE /{date} - Delete
- GET /month/{year}/{month} - Monthly

**Entries**: `/api/entries/`
- POST /note/{date} - Create
- PATCH /{id} - Update
- DELETE /{id} - Delete
- POST /merge - Merge multiple

**Labels**: `/api/labels/`
**Reports**: `/api/reports/`
**Search**: `/api/search/`
**Backup**: `/api/backup/`

## 🎓 More Info

- Full docs: [README.md](README.md)
- Quick start: [QUICKSTART.md](QUICKSTART.md)
- UV guide: [UV_SETUP.md](UV_SETUP.md)

---

**Bookmark this page for quick reference! 🎯**
