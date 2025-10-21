# Daily Notes App 📝

A modern, sleek daily note-taking application built with FastAPI (Python) backend and React (TypeScript) frontend. Perfect for recording your thoughts, tasks, and experiences throughout the day.

## ✨ Features

- 📅 **Calendar View**: Visual overview of all your notes with indicators
- 📖 **Daily View**: Focus on a single day with multiple content entries
- 🔥 **Fire Ratings**: Rate your days from 1-5 fires to track your best days
- ✍️ **Rich Text Editor**: Modern WYSIWYG editor powered by TipTap with support for:
  - Text formatting (bold, italic, strikethrough)
  - Headings and lists
  - Code blocks with syntax highlighting
  - Images and links
  - Blockquotes
- 📱 **Responsive Design**: Works beautifully on desktop and mobile
- 💾 **Persistent Storage**: All data saved in SQLite database
- 🐳 **Docker Support**: Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (easily upgradeable to PostgreSQL)
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **TipTap**: Headless WYSIWYG editor
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **date-fns**: Date utility library
- **Lucide React**: Beautiful icon library

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn
- uv (optional but recommended - will be installed automatically by setup script)

### Local Development

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd daily-notes
```

#### 2. Set up the Backend

```bash
cd backend

# Install uv if you haven't already (optional but recommended - 10-100x faster!)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a virtual environment
uv venv
# Or use standard: python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies with uv (much faster!)
uv pip install -r requirements.txt
# Or use standard: pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

#### 3. Set up the Frontend

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 🐳 Docker Deployment

The easiest way to run the entire application:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## 📁 Project Structure

```
daily-notes/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── database.py     # Database configuration
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── routers/        # API route handlers
│   │       ├── notes.py    # Daily notes endpoints
│   │       └── entries.py  # Note entries endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .gitignore
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── CalendarView.tsx
│   │   │   ├── DailyView.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── FireRating.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── NoteEntryCard.tsx
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## 🎨 Usage

### Creating a Note
1. Navigate to any day using the calendar or the day navigation arrows
2. Click "Add First Entry" or "Add Another Entry"
3. Start typing in the rich text editor
4. Your content is automatically saved

### Using the Rich Text Editor
- **Bold**: Select text and click the Bold button or use Ctrl/Cmd + B
- **Images**: Click the image icon and enter an image URL
- **Links**: Select text, click the link icon, and enter a URL
- **Code Blocks**: Click the code block icon for syntax-highlighted code
- And much more!

### Adding Fire Ratings
- Click on the fire icons at the top of any day
- Rate your day from 1-5 fires
- Ratings appear in the calendar view

### Navigating
- **Calendar View**: See all your notes at a glance with indicators
- **Daily View**: Focus on a single day's entries
- **Navigation**: Use the arrows to move between days
- **Today Button**: Quickly jump back to today

## 🔧 Configuration

### Backend Configuration
Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./daily_notes.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/daily_notes
```

### Frontend Configuration
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

## 📊 API Endpoints

### Daily Notes
- `GET /api/notes/` - Get all notes
- `GET /api/notes/{date}` - Get note for specific date
- `POST /api/notes/` - Create new note
- `PUT /api/notes/{date}` - Update note (fire rating)
- `DELETE /api/notes/{date}` - Delete note
- `GET /api/notes/month/{year}/{month}` - Get notes for specific month

### Note Entries
- `GET /api/entries/note/{date}` - Get all entries for a date
- `POST /api/entries/note/{date}` - Create new entry
- `PUT /api/entries/{entry_id}` - Update entry
- `DELETE /api/entries/{entry_id}` - Delete entry
- `GET /api/entries/{entry_id}` - Get specific entry

## 🚢 Production Deployment

For production deployment, consider:

1. **Database**: Migrate from SQLite to PostgreSQL
2. **Environment Variables**: Set proper production URLs
3. **Security**: Add authentication and HTTPS
4. **Build Frontend**: Use `npm run build` for optimized production build
5. **Reverse Proxy**: Use Nginx or Traefik
6. **Docker**: Use production-optimized Dockerfiles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [TipTap](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Happy Note-Taking! 📝✨**

