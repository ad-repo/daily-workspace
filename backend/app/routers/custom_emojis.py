"""
API routes for custom emoji management
"""

import os
import uuid
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..storage_paths import get_upload_dir

router = APIRouter(prefix='/api/custom-emojis', tags=['custom-emojis'])

# Directory to store custom emoji images (use main uploads directory)
UPLOAD_DIR = get_upload_dir()

# Maximum file size: 500KB
MAX_FILE_SIZE = 500 * 1024

# Emoji size (resize all uploaded images to this size)
EMOJI_SIZE = (64, 64)


@router.get('', response_model=list[schemas.CustomEmojiResponse])
def get_custom_emojis(include_deleted: bool = False, db: Session = Depends(get_db)):
    """Get all custom emojis (excludes deleted by default)"""
    query = db.query(models.CustomEmoji)

    if not include_deleted:
        query = query.filter(models.CustomEmoji.is_deleted == 0)

    emojis = query.order_by(models.CustomEmoji.name).all()

    return [
        {
            'id': emoji.id,
            'name': emoji.name,
            'image_url': emoji.image_url,
            'category': emoji.category,
            'keywords': emoji.keywords,
            'is_deleted': bool(emoji.is_deleted),
            'created_at': emoji.created_at,
            'updated_at': emoji.updated_at,
        }
        for emoji in emojis
    ]


@router.get('/{emoji_id}', response_model=schemas.CustomEmojiResponse)
def get_custom_emoji(emoji_id: int, db: Session = Depends(get_db)):
    """Get a single custom emoji by ID"""
    emoji = db.query(models.CustomEmoji).filter(models.CustomEmoji.id == emoji_id).first()

    if not emoji:
        raise HTTPException(status_code=404, detail='Custom emoji not found')

    return {
        'id': emoji.id,
        'name': emoji.name,
        'image_url': emoji.image_url,
        'category': emoji.category,
        'keywords': emoji.keywords,
        'is_deleted': bool(emoji.is_deleted),
        'created_at': emoji.created_at,
        'updated_at': emoji.updated_at,
    }


@router.post('', response_model=schemas.CustomEmojiResponse)
async def create_custom_emoji(
    name: str = Form(...),
    category: str = Form('Custom'),
    keywords: str = Form(''),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a new custom emoji"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    # Validate file extension
    allowed_extensions = {'.png', '.gif', '.webp', '.jpg', '.jpeg'}
    file_extension = os.path.splitext(file.filename or '')[1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f'File must be one of: {", ".join(allowed_extensions)}')

    # Read file contents
    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f'File size must be less than {MAX_FILE_SIZE // 1024}KB')

    # Check if emoji name already exists
    existing_emoji = db.query(models.CustomEmoji).filter(models.CustomEmoji.name == name).first()
    if existing_emoji:
        raise HTTPException(status_code=400, detail='Emoji with this name already exists')

    # Open and resize image
    try:
        image = Image.open(BytesIO(contents))

        # Convert to RGBA if not already (to preserve transparency)
        if image.mode != 'RGBA':
            image = image.convert('RGBA')

        # Resize to emoji size using high-quality resampling
        image = image.resize(EMOJI_SIZE, Image.Resampling.LANCZOS)

        # Generate unique filename (always save as PNG to preserve transparency)
        unique_filename = f'{uuid.uuid4()}.png'
        file_path = UPLOAD_DIR / unique_filename

        # Save resized image
        image.save(file_path, 'PNG', optimize=True)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Failed to process image: {str(e)}')

    # Create database record
    image_url = f'/api/uploads/files/{unique_filename}'
    new_emoji = models.CustomEmoji(
        name=name,
        image_url=image_url,
        category=category,
        keywords=keywords,
        is_deleted=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(new_emoji)
    db.commit()
    db.refresh(new_emoji)

    return {
        'id': new_emoji.id,
        'name': new_emoji.name,
        'image_url': new_emoji.image_url,
        'category': new_emoji.category,
        'keywords': new_emoji.keywords,
        'is_deleted': bool(new_emoji.is_deleted),
        'created_at': new_emoji.created_at,
        'updated_at': new_emoji.updated_at,
    }


@router.patch('/{emoji_id}', response_model=schemas.CustomEmojiResponse)
def update_custom_emoji(emoji_id: int, emoji_update: schemas.CustomEmojiUpdate, db: Session = Depends(get_db)):
    """Update custom emoji metadata (name, category, keywords)"""
    emoji = db.query(models.CustomEmoji).filter(models.CustomEmoji.id == emoji_id).first()

    if not emoji:
        raise HTTPException(status_code=404, detail='Custom emoji not found')

    # Check if new name conflicts with existing emoji
    if emoji_update.name and emoji_update.name != emoji.name:
        existing_emoji = db.query(models.CustomEmoji).filter(models.CustomEmoji.name == emoji_update.name).first()
        if existing_emoji:
            raise HTTPException(status_code=400, detail='Emoji with this name already exists')
        emoji.name = emoji_update.name

    if emoji_update.category is not None:
        emoji.category = emoji_update.category

    if emoji_update.keywords is not None:
        emoji.keywords = emoji_update.keywords

    emoji.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(emoji)

    return {
        'id': emoji.id,
        'name': emoji.name,
        'image_url': emoji.image_url,
        'category': emoji.category,
        'keywords': emoji.keywords,
        'is_deleted': bool(emoji.is_deleted),
        'created_at': emoji.created_at,
        'updated_at': emoji.updated_at,
    }


@router.delete('/{emoji_id}')
def delete_custom_emoji(emoji_id: int, permanent: bool = False, db: Session = Depends(get_db)):
    """
    Delete custom emoji (soft delete by default for backward compatibility).
    Set permanent=true to permanently delete the emoji and its file.
    """
    emoji = db.query(models.CustomEmoji).filter(models.CustomEmoji.id == emoji_id).first()

    if not emoji:
        raise HTTPException(status_code=404, detail='Custom emoji not found')

    if permanent:
        # Permanently delete file and database record
        # Extract filename from image_url
        filename = emoji.image_url.split('/')[-1]
        file_path = UPLOAD_DIR / filename

        # Delete file if it exists
        if file_path.exists():
            file_path.unlink()

        # Delete database record
        db.delete(emoji)
        db.commit()

        return {'message': 'Custom emoji permanently deleted', 'id': emoji_id}
    else:
        # Soft delete (mark as deleted)
        emoji.is_deleted = 1
        emoji.updated_at = datetime.utcnow()
        db.commit()

        return {'message': 'Custom emoji soft-deleted', 'id': emoji_id}
