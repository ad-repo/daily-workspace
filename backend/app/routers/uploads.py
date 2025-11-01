from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
import os
import uuid
from pathlib import Path
import mimetypes
import zipfile
import io
from datetime import datetime

router = APIRouter()

# Directory to store uploaded files
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return URL
    return {
        "url": f"/api/uploads/files/{unique_filename}",
        "filename": file.filename,
        "content_type": file.content_type
    }

@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """Upload any type of file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Generate unique filename while preserving extension
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Determine content type
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
    
    # Return file info
    return {
        "url": f"/api/uploads/files/{unique_filename}",
        "filename": file.filename,
        "content_type": content_type,
        "size": len(contents)
    }

@router.get("/files/{filename}")
async def get_file(filename: str):
    """Serve an uploaded file"""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.get("/download-all")
async def download_all_files():
    """Download all uploaded files as a zip archive"""
    if not UPLOAD_DIR.exists():
        raise HTTPException(status_code=404, detail="Upload directory not found")
    
    # Get all files recursively in the upload directory
    files = list(UPLOAD_DIR.rglob("*"))
    
    if not files:
        raise HTTPException(status_code=404, detail="No files to download")
    
    # Create zip file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in files:
            if file_path.is_file():
                # Add file to zip preserving relative folder structure
                relative_path = file_path.relative_to(UPLOAD_DIR)
                zip_file.write(file_path, relative_path)
    
    # Seek to beginning of buffer
    zip_buffer.seek(0)
    
    # Generate filename with timestamp
    timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
    filename = f"track-the-thing-files-{timestamp}.zip"
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.post("/restore-files")
async def restore_files(file: UploadFile = File(...)):
    """Restore uploaded files from a zip archive"""
    if not file.filename or not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="File must be a ZIP archive")
    
    try:
        # Read the uploaded zip file
        contents = await file.read()
        zip_buffer = io.BytesIO(contents)
        
        files_restored = 0
        files_skipped = 0
        
        # Extract zip file
        with zipfile.ZipFile(zip_buffer, 'r') as zip_file:
            # Validate zip file
            if zip_file.testzip() is not None:
                raise HTTPException(status_code=400, detail="Corrupted ZIP file")
            
            # Extract all files
            for file_info in zip_file.filelist:
                if file_info.is_dir():
                    continue
                
                # Get the filename (basename) from the path
                filename = os.path.basename(file_info.filename)
                target_path = UPLOAD_DIR / filename
                
                # Check if file already exists
                if target_path.exists():
                    files_skipped += 1
                    continue
                
                # Extract and save file
                with zip_file.open(file_info) as source:
                    with open(target_path, 'wb') as target:
                        target.write(source.read())
                files_restored += 1
        
        return {
            "success": True,
            "message": f"Restored {files_restored} file(s), skipped {files_skipped} existing file(s)",
            "stats": {
                "restored": files_restored,
                "skipped": files_skipped,
                "total": files_restored + files_skipped
            }
        }
        
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore files: {str(e)}")
