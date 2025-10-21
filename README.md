# Pull Your Shit Together 💼

A modern, powerful daily workspace application for capturing and organizing your thoughts, tasks, and work throughout the day. Built with FastAPI (Python) backend and React (TypeScript) frontend.

> *"pull your shit together"* - Kamesh

## ✨ Features

### 📝 Note Taking
- **Daily View**: Focus on a single day with multiple content entries
- **Rich Text Editor**: Modern WYSIWYG editor powered by TipTap with support for:
  - Text formatting (bold, italic, strikethrough, headings, lists)
  - Code blocks with syntax highlighting
  - Images and file uploads (with persistent storage)
  - Hyperlinks with automatic link previews
  - Blockquotes and preformatted text
- **Code Entries**: Dedicated code editor for multi-line code snippets
- **Timeline Navigation**: Visual timeline on the left sidebar for quick entry navigation
- **Entry States**: Mark entries as:
  - ⭐ Important (starred)
  - ✓ Completed
  - 📄 Add to Report (for weekly summaries)
  - 💀 /dev/null (discarded/nothing)

### 🏷️ Organization
- **Labels**: Add text or emoji labels to both days and individual entries
- **Autocomplete**: Smart label suggestions with predictive text
- **Emoji Labels**: Special rendering for emoji-only labels
- **Daily Goals**: Set goals for each day (visible as tooltips in calendar)

### 📅 Calendar & Visualization
- **Calendar View**: Visual overview with animated indicators:
  - 💀 Skull: Has /dev/null entries (highest priority)
  - ⭐ Green pulsing star: Has important AND completed
  - ✓ Green bouncing checkmark: Has completed entries
  - ⭐ Yellow glowing star: Has important entries
  - • Blue dot: Has regular notes
- **Month Navigation**: Browse notes by month
- **Today Button**: Quick jump to current day (shows day name)
- **Timezone Support**: Display times in your preferred timezone (Eastern US by default)

### 📊 Reports
- **Weekly Reports**: Generate Wednesday-to-Wednesday reports
  - Organized by Completed and In Progress sections
  - Export to Markdown
  - Copy individual sections
- **Selected Entries Report**: View all entries marked "Add to Report"
  - Clickable cards that navigate to specific entries
  - Export to Markdown
  - Copy individual entries or all at once
- **Markdown Export**: Export all data as markdown for LLM consumption

### 🔍 Search & Discovery
- **Global Search**: Search entries by text content and/or labels
- **Search History**: Unlimited search history (no duplicates)
- **Label Filtering**: Find entries by specific labels
- **Direct Navigation**: Click search results to jump to specific entries

### 🛠️ Productivity Tools
- **Multi-Select & Merge**: Select multiple entries and combine them into one
- **Copy Content**: Copy any entry's text content to clipboard
- **Continue from Previous Day**: Copy entries from past days to today
- **Entry Management**: Edit, delete, and reorder entries

### 💾 Data Management
- **Backup & Restore**: Full JSON export/import with all data
- **Download Uploads**: Export all uploaded files as a zip archive
- **Persistent Storage**: SQLite database with all metadata preserved
- **Docker Volumes**: Data persists across container restarts

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database (easily upgradeable to PostgreSQL)
- **Pydantic**: Data validation and settings management
- **BeautifulSoup4**: HTML parsing for link previews
- **Requests**: HTTP library for fetching link metadata

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **TipTap**: Headless WYSIWYG editor with extensions
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **date-fns & date-fns-tz**: Date utility and timezone support
- **Lucide React**: Beautiful icon library
- **React Calendar**: Calendar component

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Desktop (for Docker deployment)
- OR Python 3.11+ and Node.js 18+ (for local development)

### 🐳 Docker Deployment (Recommended)

The easiest way to run the entire application:

```bash
# Clone the repository
git clone <your-repo-url>
cd daily-notes

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

Data is persisted in Docker volumes at `./backend/data`

### Local Development

#### 1. Set up the Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### 2. Set up the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
daily-notes/
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── database.py         # Database configuration
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── schemas.py          # Pydantic schemas
│   │   └── routers/            # API route handlers
│   │       ├── notes.py        # Daily notes endpoints
│   │       ├── entries.py      # Note entries endpoints
│   │       ├── labels.py       # Label management
│   │       ├── uploads.py      # File upload handling
│   │       ├── backup.py       # Backup/restore/export
│   │       ├── reports.py      # Report generation
│   │       ├── search.py       # Search functionality
│   │       ├── search_history.py # Search history
│   │       └── link_preview.py # Link preview fetching
│   ├── data/                   # Persistent storage (Docker volume)
│   │   ├── daily_notes.db     # SQLite database
│   │   └── uploads/           # Uploaded files
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .gitignore
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── CalendarView.tsx       # Calendar with indicators
│   │   │   ├── DailyView.tsx          # Daily note view
│   │   │   ├── Navigation.tsx         # Top navigation bar
│   │   │   ├── RichTextEditor.tsx     # TipTap rich text editor
│   │   │   ├── CodeEditor.tsx         # Code entry editor
│   │   │   ├── NoteEntryCard.tsx      # Individual entry card
│   │   │   ├── LabelSelector.tsx      # Label management UI
│   │   │   ├── EmojiPicker.tsx        # Emoji selection
│   │   │   ├── EntryTimeline.tsx      # Timeline navigation
│   │   │   ├── Reports.tsx            # Reports view
│   │   │   ├── Search.tsx             # Global search
│   │   │   └── Settings.tsx           # Settings & management
│   │   ├── contexts/
│   │   │   └── TimezoneContext.tsx    # Timezone management
│   │   ├── extensions/
│   │   │   └── LinkPreview.tsx        # TipTap link preview extension
│   │   ├── utils/
│   │   │   └── timezone.ts            # Timezone utilities
│   │   ├── api.ts              # API client
│   │   ├── types.ts            # TypeScript types
│   │   ├── App.tsx             # Main app component
│   │   └── index.css           # Global styles & animations
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🎨 Usage

### Creating Entries
1. Navigate to any day using the calendar or arrow buttons
2. Click "Add Text Entry" for rich text or "Add Code Entry" for code
3. Start typing - content is auto-saved
4. Use the toolbar for formatting, links, images, etc.

### Managing Entry States
- Click the **star** to mark as important
- Click the **checkmark** to mark as completed
- Click the **file** icon to add to weekly report
- Click the **skull** to mark as /dev/null (discarded)

### Using Labels
- Type in the label field to add text labels
- Click the emoji picker to add emoji labels
- Labels autocomplete from existing tags
- Labels are searchable globally

### Generating Reports
1. Mark relevant entries with "Add to Report"
2. Go to Reports section
3. Click "Generate" for weekly report or selected entries report
4. Export to Markdown or copy sections

### Searching
1. Go to Search section
2. Enter text to search entry content
3. Select labels to filter by tags
4. Click results to navigate to specific entries
5. Recent searches are saved for quick access

### Backup & Restore
1. Go to Settings → Management
2. Click "Backup" to download JSON with all data
3. Use "Restore" to import a previous backup
4. Timestamps and metadata are preserved

## 📊 API Endpoints

### Daily Notes
- `GET /api/notes/` - Get all notes
- `GET /api/notes/{date}` - Get note for specific date
- `POST /api/notes/` - Create new note
- `PATCH /api/notes/{date}` - Update note
- `DELETE /api/notes/{date}` - Delete note
- `GET /api/notes/month/{year}/{month}` - Get notes for month

### Note Entries
- `GET /api/entries/note/{date}` - Get entries for date
- `POST /api/entries/note/{date}` - Create entry
- `PATCH /api/entries/{entry_id}` - Update entry
- `DELETE /api/entries/{entry_id}` - Delete entry
- `POST /api/entries/merge` - Merge multiple entries

### Labels
- `GET /api/labels/` - Get all labels
- `POST /api/labels/` - Create label
- `POST /api/labels/note/{date}/label/{label_id}` - Add label to note
- `POST /api/labels/entry/{entry_id}/label/{label_id}` - Add label to entry
- `DELETE /api/labels/note/{date}/label/{label_id}` - Remove label from note
- `DELETE /api/labels/entry/{entry_id}/label/{label_id}` - Remove label from entry

### Reports
- `GET /api/reports/generate` - Generate weekly report
- `GET /api/reports/all-entries` - Generate selected entries report
- `GET /api/reports/weeks` - Get available report weeks

### Search
- `POST /api/search/` - Search entries by text/labels
- `GET /api/search/history` - Get search history
- `POST /api/search/history` - Save search to history

### Uploads
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/file` - Upload file
- `GET /api/uploads/download-all` - Download all uploads as zip

### Backup & Management
- `GET /api/backup/export` - Export all data as JSON
- `POST /api/backup/import` - Import data from JSON
- `GET /api/backup/export-markdown` - Export as Markdown

### Link Previews
- `POST /api/link-preview/preview` - Fetch link preview metadata

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` or Docker environment):
```env
DATABASE_URL=sqlite:///./data/daily_notes.db
```

**Frontend** (`.env` or Docker environment):
```env
VITE_API_URL=http://localhost:8000
```

### Timezone Settings
- Default timezone: Eastern US (America/New_York)
- Configurable in Settings page
- All timestamps display in selected timezone

## 🚢 Production Considerations

For production deployment:

1. **Database**: Consider migrating from SQLite to PostgreSQL for better concurrency
2. **Environment Variables**: Set proper production URLs and secrets
3. **Security**: Implement authentication and authorization
4. **HTTPS**: Use SSL/TLS certificates (Let's Encrypt)
5. **Reverse Proxy**: Use Nginx or Traefik for routing
6. **Backups**: Implement automated backup strategy
7. **Monitoring**: Add logging and monitoring solutions
8. **Volume Management**: Ensure Docker volumes are backed up regularly

## 🎨 Customization

### Animations
- Calendar indicators use custom CSS animations
- Modify `@keyframes` in `index.css` for different effects
- Star rays, pulsing, and bouncing animations

### Colors & Styling
- Tailwind CSS for all styling
- Modify `tailwind.config.js` for theme changes
- Custom colors for labels (randomly assigned)

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library
- [date-fns](https://date-fns.org/) - Date utilities

---

**Pull Your Shit Together! 💼✨**

*Quote attributed to Kamesh*
