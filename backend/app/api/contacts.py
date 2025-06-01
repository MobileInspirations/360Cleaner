from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.contact import Contact
from ..services.batch_service import BatchService
from ..services.categorization_service import CategorizationService
import csv
from io import StringIO

router = APIRouter()

@router.post("/upload")
async def upload_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process a CSV file of contacts."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "Only CSV files are supported")

    try:
        contents = await file.read()
        csv_content = contents.decode()
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        contacts = []
        for row in reader:
            email = row.get('Email', '').strip()
            full_name = row.get('First Name', '').strip()
            contact_id = row.get('Contact ID', '').strip()
            tags_raw = row.get('Contact Tags', '')
            tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
            contact = Contact(
                id=contact_id if contact_id else None,
                email=email,
                full_name=full_name,
                tags=tags
            )
            contacts.append(contact)
        db.bulk_save_objects(contacts)
        db.commit()
        return {"total": len(contacts), "success": len(contacts)}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

@router.post("/categorize")
async def categorize_contacts(
    db: Session = Depends(get_db)
):
    """Start the categorization process for all uncategorized contacts."""
    try:
        # Get uncategorized contacts
        contacts = db.query(Contact).filter(
            Contact.main_bucket_assignment.is_(None)
        ).all()

        if not contacts:
            return {"message": "No contacts to categorize"}

        # Start categorization
        categorization_service = CategorizationService(db)
        result = await categorization_service.categorize_contacts(contacts)
        
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/categorize/status/{task_id}")
async def get_categorization_status(
    task_id: str,
    db: Session = Depends(get_db)
):
    """Get the status of a categorization task."""
    try:
        batch_service = BatchService(db)
        status = await batch_service.get_batch_status(task_id)
        return status
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/auto-categorize")
async def auto_categorize_contacts(db: Session = Depends(get_db)):
    """Trigger auto-categorization for all uncategorized contacts."""
    try:
        batch_service = BatchService(db)
        result = await batch_service.auto_categorize_contacts()
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/")
async def get_contacts(
    skip: int = 0,
    limit: int = 10,
    main_bucket: Optional[str] = None,
    personality_bucket: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get a paginated list of contacts with optional filtering."""
    query = db.query(Contact)

    if main_bucket:
        query = query.filter(Contact.main_bucket_assignment == main_bucket)
    if personality_bucket:
        query = query.filter(Contact.personality_bucket_assignment == personality_bucket)

    total = query.count()
    contacts = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "contacts": contacts
    } 