# Quick Start Guide 🚀

Get your Daily Notes app up and running in minutes!

## Option 1: Docker (Recommended) 🐳

**Prerequisites**: Docker and Docker Compose installed

```bash
# Start everything with one command
docker-compose up --build

# Or run in background
docker-compose up -d
```

Access the app at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

To stop:
```bash
docker-compose down
```

## Option 2: Local Development 💻

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm
- uv (recommended - installed automatically by setup script)

### Quick Setup

```bash
# Make setup script executable
chmod +x scripts/setup-local.sh

# Run setup (one time only)
./scripts/setup-local.sh
```

### Manual Setup

**Backend:**
```bash
cd backend

# Option 1: Using uv (recommended - much faster! ⚡)
curl -LsSf https://astral.sh/uv/install.sh | sh  # Install uv
uv venv                                            # Create venv
source venv/bin/activate                           # Activate (Windows: venv\Scripts\activate)
uv pip install -r requirements.txt                 # Install deps
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Traditional method
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

## First Steps 📝

1. **Open the app**: Navigate to http://localhost:3000
2. **View today's notes**: You'll start on today's view
3. **Add your first entry**: Click "Add First Entry"
4. **Start writing**: Use the rich text editor to write notes
5. **Add a fire rating**: Click the fire icons to rate your day
6. **Check the calendar**: Click "Calendar" to see all your notes

## Key Features to Try

### Rich Text Editor
- **Bold/Italic**: Use the toolbar or keyboard shortcuts
- **Add images**: Click the image icon and paste an image URL
- **Add links**: Select text and click the link icon
- **Code blocks**: Perfect for saving code snippets
- **Lists**: Both bullet and numbered lists

### Navigation
- **Arrow buttons**: Move between days
- **Calendar view**: See all your notes at once
- **Today button**: Jump back to today instantly

### Multiple Entries
- Add as many entries per day as you want
- Each entry is timestamped
- Delete individual entries without losing others

## Troubleshooting

### Port already in use
If port 3000 or 8000 is taken, edit:
- Backend: `backend/app/main.py` or pass `--port` to uvicorn
- Frontend: `frontend/vite.config.ts` (change `server.port`)

### Backend not connecting
Check that the backend is running on port 8000:
```bash
curl http://localhost:8000/health
```

### Database issues
Delete the database file and restart:
```bash
rm backend/daily_notes.db
```

## What's Next?

- Check out the full [README.md](README.md) for detailed documentation
- Explore the API docs at http://localhost:8000/docs
- Customize the styling in `frontend/src/index.css`
- Add authentication for multi-user support

---

**Enjoy your new Daily Notes app! 📝✨**

