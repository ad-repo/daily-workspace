# Architecture Overview 🏗️

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Frontend (TypeScript)                 │  │
│  │  - React Router (Routing)                            │  │
│  │  - TipTap (WYSIWYG Editor)                          │  │
│  │  - Tailwind CSS (Styling)                           │  │
│  │  - Axios (HTTP Client)                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                 │
│                      HTTP/REST API                           │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            FastAPI Backend (Python)                   │  │
│  │  - FastAPI (Web Framework)                           │  │
│  │  - SQLAlchemy (ORM)                                  │  │
│  │  - Pydantic (Validation)                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Database Layer                          │  │
│  │  - SQLite (Development)                              │  │
│  │  - PostgreSQL (Production Ready)                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

```
┌─────────────────────┐
│    DailyNote        │
├─────────────────────┤
│ id: int             │
│ date: string        │ (YYYY-MM-DD)
│ fire_rating: int    │ (0-5)
│ created_at: datetime│
│ updated_at: datetime│
└──────────┬──────────┘
           │ 1
           │
           │ has many
           │
           │ N
┌──────────▼──────────┐
│    NoteEntry        │
├─────────────────────┤
│ id: int             │
│ daily_note_id: int  │ (FK)
│ content: text       │ (HTML)
│ content_type: str   │ (rich_text/code/markdown)
│ order_index: int    │
│ created_at: datetime│
│ updated_at: datetime│
└─────────────────────┘
```

## Component Structure

```
App
├── Navigation
│   └── Links (Calendar, Today)
│
└── Routes
    ├── CalendarView
    │   └── Calendar (react-calendar)
    │       └── Date tiles with indicators
    │
    └── DailyView
        ├── Date Navigation (← →)
        ├── FireRating Component
        └── NoteEntryCard (multiple)
            ├── Timestamp
            ├── RichTextEditor (TipTap)
            │   ├── Toolbar
            │   └── Editor Content
            └── Delete Button
```

## API Routes

### Daily Notes (`/api/notes`)
- `GET /` - List all notes
- `GET /{date}` - Get note by date
- `POST /` - Create new note
- `PUT /{date}` - Update note
- `DELETE /{date}` - Delete note
- `GET /month/{year}/{month}` - Get monthly notes

### Note Entries (`/api/entries`)
- `GET /note/{date}` - Get entries for date
- `POST /note/{date}` - Create entry
- `GET /{entry_id}` - Get specific entry
- `PUT /{entry_id}` - Update entry
- `DELETE /{entry_id}` - Delete entry

## State Management

### Frontend State
- **Route State**: Managed by React Router
- **Local Component State**: Using React `useState`
- **Form State**: TipTap editor state
- **Date State**: date-fns for date manipulation

### Backend State
- **Database Session**: SQLAlchemy session management
- **Connection Pooling**: SQLAlchemy engine
- **Request Context**: FastAPI dependency injection

## Key Features Implementation

### 1. Rich Text Editor
- **Library**: TipTap (headless, extensible)
- **Features**: Bold, italic, headings, lists, code blocks, images, links
- **Storage**: HTML content in database
- **Auto-save**: Debounced save on content change

### 2. Fire Rating
- **Storage**: Integer (0-5) in DailyNote model
- **UI**: Interactive fire icons
- **Display**: Shows in calendar view and daily view

### 3. Calendar View
- **Library**: react-calendar
- **Indicators**: Blue dot for entries, fire icons for ratings
- **Navigation**: Click date to navigate to daily view

### 4. Multiple Entries
- **Model**: One-to-many relationship
- **Order**: `order_index` field for sorting
- **Timestamps**: Each entry has creation time
- **CRUD**: Full create, read, update, delete

### 5. Responsive Design
- **Framework**: Tailwind CSS
- **Breakpoints**: Mobile-first approach
- **Layout**: Flexbox and Grid
- **Components**: Responsive navigation and cards

## Deployment Options

### Development
```bash
# Local servers
Backend: uvicorn --reload
Frontend: vite dev server
Database: SQLite file
```

### Docker Development
```bash
# Docker Compose
- Hot reload enabled
- Volume mounts for code
- SQLite in mounted volume
```

### Production
```bash
# Recommended stack
Frontend: Static build (nginx)
Backend: Gunicorn + Uvicorn workers
Database: PostgreSQL
Reverse Proxy: Nginx/Traefik
Container: Docker + Docker Compose
```

## Security Considerations

### Current (MVP)
- CORS enabled for localhost
- No authentication
- Single-user design
- SQLite database

### Production TODO
- [ ] Add authentication (JWT/OAuth)
- [ ] Implement rate limiting
- [ ] Use PostgreSQL with SSL
- [ ] Add HTTPS/TLS
- [ ] Implement user management
- [ ] Add input sanitization
- [ ] Enable CSRF protection
- [ ] Add API key for frontend

## Performance Optimizations

### Frontend
- Code splitting (React.lazy)
- Image optimization
- Debounced auto-save
- Cached API responses
- Virtual scrolling for large lists

### Backend
- Database indexing (date field)
- Connection pooling
- Async endpoints
- Query optimization
- Response caching

### Database
- Indexed date column
- Foreign key constraints
- Cascade deletes
- Transaction management

## Scalability Path

### Phase 1: Single User (Current)
- SQLite database
- Local file storage
- Single container

### Phase 2: Multi-User
- PostgreSQL database
- User authentication
- Separate user data

### Phase 3: Cloud Ready
- S3/Object storage for media
- CDN for static assets
- Managed database (RDS)
- Horizontal scaling

### Phase 4: Enterprise
- Microservices architecture
- Message queue (Redis/RabbitMQ)
- Full-text search (Elasticsearch)
- Analytics dashboard
- Mobile apps (React Native)

