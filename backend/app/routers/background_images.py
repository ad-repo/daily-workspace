import json
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

router = APIRouter()

# Directory to store background images
BACKGROUNDS_DIR = Path('data/background-images')
BACKGROUNDS_DIR.mkdir(parents=True, exist_ok=True)

# Metadata file to track uploaded images
METADATA_FILE = BACKGROUNDS_DIR / 'metadata.json'


def load_metadata() -> list[dict]:
    """Load metadata about uploaded images"""
    if METADATA_FILE.exists():
        with open(METADATA_FILE) as f:
            return json.load(f)
    return []


def save_metadata(metadata: list[dict]):
    """Save metadata about uploaded images"""
    with open(METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)


@router.post('/upload')
async def upload_background_image(file: UploadFile = File(...)):
    """Upload a background image"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='File size must be less than 10MB')

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_id = str(uuid.uuid4())
    unique_filename = f'{unique_id}{file_extension}'
    file_path = BACKGROUNDS_DIR / unique_filename

    # Save file
    with open(file_path, 'wb') as f:
        f.write(contents)

    # Update metadata
    metadata = load_metadata()
    image_data = {
        'id': unique_id,
        'filename': unique_filename,
        'original_filename': file.filename,
        'url': f'/api/background-images/image/{unique_filename}',
        'content_type': file.content_type,
        'size': len(contents),
    }
    metadata.append(image_data)
    save_metadata(metadata)

    return image_data


@router.get('/list')
async def list_background_images() -> list[dict]:
    """Get list of all uploaded background images"""
    return load_metadata()


@router.get('/image/{filename}')
async def get_background_image(filename: str):
    """Get a specific background image"""
    file_path = BACKGROUNDS_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail='Image not found')

    return FileResponse(file_path)


@router.delete('/{image_id}')
async def delete_background_image(image_id: str):
    """Delete a background image"""
    metadata = load_metadata()

    # Find the image in metadata
    image_data = None
    for img in metadata:
        if img['id'] == image_id:
            image_data = img
            break

    if not image_data:
        raise HTTPException(status_code=404, detail='Image not found')

    # Delete the file
    file_path = BACKGROUNDS_DIR / image_data['filename']
    if file_path.exists():
        file_path.unlink()

    # Update metadata
    metadata = [img for img in metadata if img['id'] != image_id]
    save_metadata(metadata)

    return {'message': 'Image deleted successfully'}
