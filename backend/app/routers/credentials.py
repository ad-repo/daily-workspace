from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from datetime import datetime
import json

router = APIRouter()

@router.get("/", response_model=List[schemas.ServiceCredential])
def get_all_credentials(db: Session = Depends(get_db)):
    """Get all service credentials (without sensitive data for listing)"""
    credentials = db.query(models.ServiceCredential).all()
    return credentials

@router.get("/{service_name}", response_model=schemas.ServiceCredential)
def get_credential(service_name: str, db: Session = Depends(get_db)):
    """Get credentials for a specific service"""
    credential = db.query(models.ServiceCredential).filter(
        models.ServiceCredential.service_name == service_name
    ).first()
    
    if not credential:
        raise HTTPException(status_code=404, detail=f"Credentials for {service_name} not found")
    
    return credential

@router.post("/", response_model=schemas.ServiceCredential, status_code=201)
def create_credential(
    credential: schemas.ServiceCredentialCreate,
    db: Session = Depends(get_db)
):
    """Create or update credentials for a service"""
    # Validate JSON strings
    try:
        json.loads(credential.credentials)
        json.loads(credential.config)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in credentials or config")
    
    # Check if credentials already exist
    existing = db.query(models.ServiceCredential).filter(
        models.ServiceCredential.service_name == credential.service_name
    ).first()
    
    if existing:
        # Update existing credentials
        existing.credentials = credential.credentials
        existing.config = credential.config
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new credentials
    db_credential = models.ServiceCredential(**credential.model_dump())
    db.add(db_credential)
    db.commit()
    db.refresh(db_credential)
    return db_credential

@router.put("/{service_name}", response_model=schemas.ServiceCredential)
@router.patch("/{service_name}", response_model=schemas.ServiceCredential)
def update_credential(
    service_name: str,
    credential_update: schemas.ServiceCredentialUpdate,
    db: Session = Depends(get_db)
):
    """Update credentials for a service"""
    credential = db.query(models.ServiceCredential).filter(
        models.ServiceCredential.service_name == service_name
    ).first()
    
    if not credential:
        raise HTTPException(status_code=404, detail=f"Credentials for {service_name} not found")
    
    update_data = credential_update.model_dump(exclude_unset=True)
    
    # Validate JSON strings if provided
    if 'credentials' in update_data:
        try:
            json.loads(update_data['credentials'])
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in credentials")
    
    if 'config' in update_data:
        try:
            json.loads(update_data['config'])
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in config")
    
    for key, value in update_data.items():
        setattr(credential, key, value)
    
    credential.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(credential)
    return credential

@router.delete("/{service_name}", status_code=204)
def delete_credential(service_name: str, db: Session = Depends(get_db)):
    """Delete credentials for a service"""
    credential = db.query(models.ServiceCredential).filter(
        models.ServiceCredential.service_name == service_name
    ).first()
    
    if not credential:
        raise HTTPException(status_code=404, detail=f"Credentials for {service_name} not found")
    
    db.delete(credential)
    db.commit()
    return None

