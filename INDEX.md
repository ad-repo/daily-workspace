# Documentation Index 📚

Quick navigation for Pull Your Shit Together documentation.

## 🚀 Getting Started

**New to the app? Start here:**

1. **[README.md](README.md)** - Complete documentation
2. **[QUICKSTART.md](QUICKSTART.md)** - Setup in 5 minutes
3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command reference

## 📖 Documentation Files

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full project documentation with all features |
| [QUICKSTART.md](QUICKSTART.md) | Quick setup guide (Docker or local) |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command cheat sheet |
| [UV_SETUP.md](UV_SETUP.md) | UV package manager guide |

## 🔗 Quick Links

### When App is Running
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Quick Commands
```bash
# Docker (recommended)
docker-compose up --build

# Local backend
cd backend && uv run uvicorn app.main:app --reload

# Local frontend
cd frontend && npm run dev
```

## 📁 Project Structure

```
daily-notes/
├── README.md              ← Main docs
├── QUICKSTART.md          ← Setup guide
├── QUICK_REFERENCE.md     ← Commands
├── UV_SETUP.md            ← UV guide
├── backend/               ← Python/FastAPI
├── frontend/              ← React/TypeScript
└── docker-compose.yml     ← Docker setup
```

## 🎯 Use Cases

**Setup & Run**
- Quick start → [QUICKSTART.md](QUICKSTART.md)
- Docker setup → [QUICKSTART.md - Docker](QUICKSTART.md#option-1-docker-recommended)
- Local dev → [QUICKSTART.md - Local](QUICKSTART.md#option-2-local-development)

**Commands**
- Common commands → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- UV package manager → [UV_SETUP.md](UV_SETUP.md)

**Features & Usage**
- All features → [README.md - Features](README.md#-features)
- API endpoints → [README.md - API Endpoints](README.md#-api-endpoints)

## 📞 Need Help?

1. **Setup issues?** → [QUICKSTART.md](QUICKSTART.md)
2. **Command reference?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. **Full documentation?** → [README.md](README.md)

---

**Ready to start? → [QUICKSTART.md](QUICKSTART.md)**
