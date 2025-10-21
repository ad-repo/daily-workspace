from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import notes, entries, uploads, labels, backup, reports, search, search_history, link_preview

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Daily Workspace API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(entries.router, prefix="/api/entries", tags=["entries"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(labels.router, prefix="/api/labels", tags=["labels"])
app.include_router(backup.router, prefix="/api/backup", tags=["backup"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(search_history.router, prefix="/api/search-history", tags=["search-history"])
app.include_router(link_preview.router, prefix="/api/link-preview", tags=["link-preview"])

@app.get("/")
async def root():
    return {"message": "Daily Workspace API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

