# Quick Reference Card 🚀

One-page reference for common commands and workflows.

## 🎯 Quick Start

```bash
# Option 1: Docker (easiest)
docker-compose up

# Option 2: Local with setup script
./scripts/setup-local.sh
```

## ⚡ UV Commands (Recommended)

```bash
# Install uv (one time)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create venv
uv venv

# Install dependencies (FAST!)
uv pip install -r requirements.txt

# Add new package
uv pip install package-name

# Update requirements
uv pip freeze > requirements.txt
```

## 🐍 Backend Commands

```bash
# Navigate to backend
cd backend

# Create & activate venv (with uv)
uv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
uv pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start server (alternative)
python -m uvicorn app.main:app --reload
```

## ⚛️ Frontend Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Remove all containers & volumes
docker-compose down -v
```

## 🗄️ Database Commands

```bash
# SQLite CLI
sqlite3 backend/daily_notes.db

# View schema
sqlite3 backend/daily_notes.db ".schema"

# View all notes
sqlite3 backend/daily_notes.db "SELECT * FROM daily_notes;"

# View all entries
sqlite3 backend/daily_notes.db "SELECT * FROM note_entries;"

# Count notes
sqlite3 backend/daily_notes.db "SELECT COUNT(*) FROM daily_notes;"

# Reset database (CAUTION: deletes all data!)
rm backend/daily_notes.db
# Restart backend to recreate
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
  -d '{"date": "2024-01-15", "fire_rating": 4}'

# Update fire rating
curl -X PUT http://localhost:8000/api/notes/2024-01-15 \
  -H "Content-Type: application/json" \
  -d '{"fire_rating": 5}'

# Create entry
curl -X POST http://localhost:8000/api/entries/note/2024-01-15 \
  -H "Content-Type: application/json" \
  -d '{"content": "<p>Test</p>", "content_type": "rich_text", "order_index": 0}'

# Delete note
curl -X DELETE http://localhost:8000/api/notes/2024-01-15
```

## 🔍 Troubleshooting

```bash
# Check if ports are available
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill process on port
kill -9 $(lsof -t -i :8000)

# Check Python version
python3 --version

# Check Node version
node --version

# Check uv version
uv --version

# Verify setup
./scripts/verify-setup.sh

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Clear Node cache
cd frontend
rm -rf node_modules
rm -rf .vite
npm install

# Reset everything
docker-compose down -v
rm -rf backend/venv
rm -rf frontend/node_modules
rm backend/daily_notes.db
```

## 📂 Important Files

```
Backend:
  backend/app/main.py       - FastAPI app
  backend/app/models.py     - Database models
  backend/app/routers/      - API endpoints
  backend/requirements.txt  - Python dependencies
  backend/pyproject.toml    - Project config

Frontend:
  frontend/src/App.tsx      - Main component
  frontend/src/api.ts       - API client
  frontend/src/components/  - UI components
  frontend/package.json     - Node dependencies

Config:
  docker-compose.yml        - Docker setup
  .gitignore               - Git ignore rules
```

## 🌐 URLs

```
Frontend:        http://localhost:3000
Backend API:     http://localhost:8000
API Docs:        http://localhost:8000/docs
Alt API Docs:    http://localhost:8000/redoc
OpenAPI Schema:  http://localhost:8000/openapi.json
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

# 3. Make changes
# - Edit files
# - See live reload

# 4. Test changes
# - Check browser
# - Test API endpoints
# - Verify database

# 5. Commit
git add .
git commit -m "description"
```

## 🚢 Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output in: frontend/dist/

# Run production backend
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Or use Docker
docker-compose up -d
```

## 📊 Useful Snippets

### Backend: Add New Endpoint
```python
# In backend/app/routers/notes.py
@router.get("/new-endpoint")
def new_endpoint():
    return {"message": "Hello"}
```

### Frontend: API Call
```typescript
// In frontend/src/api.ts
export const customApi = {
  getData: async () => {
    const response = await api.get('/endpoint');
    return response.data;
  }
};
```

### Add Python Dependency
```bash
cd backend
source venv/bin/activate
uv pip install new-package
uv pip freeze > requirements.txt
```

### Add Node Dependency
```bash
cd frontend
npm install new-package
# Auto-updates package.json
```

## 🔐 Environment Variables

```bash
# Backend (.env)
DATABASE_URL=sqlite:///./daily_notes.db

# Frontend (.env)
VITE_API_URL=http://localhost:8000
```

## 📝 Git Commands

```bash
# Initialize git (if needed)
git init
git add .
git commit -m "Initial commit"

# Daily workflow
git status
git add .
git commit -m "Add feature X"
git push

# Create branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## 🎓 Learn More

- **Full Docs**: README.md
- **Quick Start**: QUICKSTART.md
- **Features**: FEATURES.md
- **Architecture**: ARCHITECTURE.md
- **Testing**: TESTING.md
- **UV Guide**: UV_SETUP.md

---

**🎯 Bookmark this page for quick reference!**

