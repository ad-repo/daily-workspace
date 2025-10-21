# Quick Start Guide 🚀

Get your workspace app running in minutes.

## Option 1: Docker (Recommended) 🐳

**Prerequisites**: Docker Desktop installed and running

```bash
# Start everything
docker-compose up --build

# Or run in background
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Stop:**
```bash
docker-compose down
```

## Option 2: Local Development 💻

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Using uv (recommended - 10-100x faster!)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
uv pip install -r requirements.txt

# Or standard method
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

## First Steps 📝

1. Open http://localhost:3000
2. View today's date
3. Add entries using "Add Text Entry" or "Add Code Entry"
4. Set daily goals at the top
5. Use state buttons (star, checkmark, report, skull)
6. Add labels (text or emoji)
7. View calendar to see all your days

## Key Features

- **Daily Goals**: Set goals for each day
- **Multiple Entries**: Text or code entries per day
- **Entry States**: Important ⭐, Completed ✓, Report 📄, /dev/null 💀
- **Labels**: Text and emoji labels
- **Timeline**: Left sidebar navigation
- **Link Previews**: Automatic preview cards
- **Reports**: Weekly and selected entries reports
- **Search**: Global search by text/labels
- **Calendar**: Visual indicators and animations

## Troubleshooting

### Port in use
```bash
# Check ports
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 $(lsof -t -i :8000)
```

### Backend won't connect
```bash
curl http://localhost:8000/health
```

### Reset database
```bash
rm backend/data/daily_notes.db
# Restart backend
```

### Docker issues
```bash
docker-compose down -v
docker-compose up --build
```

## What's Next?

- Full documentation: [README.md](README.md)
- Commands reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- UV setup guide: [UV_SETUP.md](UV_SETUP.md)

---

**Pull Your Shit Together! 💼**
