from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.contact import Contact
from ..services.batch_service import BatchService
from ..services.categorization_service import CategorizationService
import csv
from io import StringIO
import logging
import uuid
import zipfile
import os
import tempfile
import re
from sqlalchemy import Column, String
from sqlalchemy import or_
import io
from fastapi.responses import StreamingResponse
from sqlalchemy.inspection import inspect

router = APIRouter()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@router.post("/upload")
async def upload_contacts(
    file: UploadFile = File(...),
    main_bucket: str = None,
    db: Session = Depends(get_db)
):
    """Upload and process a CSV file of contacts."""
    logger.info(f"Received upload request: {file.filename} with main_bucket={main_bucket}")
    if not file.filename.endswith('.csv'):
        logger.error("Upload failed: Only CSV files are supported")
        raise HTTPException(400, "Only CSV files are supported")

    try:
        contents = await file.read()
        csv_content = contents.decode()
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        contacts = []
        emails_seen = set()
        for row in reader:
            email = row.get('Email', '').strip()
            if not email or email in emails_seen:
                logger.warning(f"Duplicate or missing email in upload: {email}. Skipping row.")
                continue
            emails_seen.add(email)
            full_name = row.get('First Name', '').strip()
            contact_id = row.get('Contact ID', '').strip()
            tags_raw = row.get('Contact Tags', '')
            tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
            # Validate or generate UUID
            try:
                contact_uuid = uuid.UUID(contact_id) if contact_id else uuid.uuid4()
            except Exception:
                contact_uuid = uuid.uuid4()
            # Upsert by email (email is unique)
            existing = db.query(Contact).filter(Contact.email == email).first()
            # Set main bucket flags
            is_biz = main_bucket == 'biz'
            is_health = main_bucket == 'health'
            is_survivalist = main_bucket == 'survivalist'
            if existing:
                existing.full_name = full_name
                # Merge tags, ensuring uniqueness
                existing_tags = set(existing.tags or [])
                new_tags = set(tags)
                merged_tags = list(existing_tags.union(new_tags))
                existing.tags = merged_tags
                existing.email = email
                # Only set the selected main bucket to True, preserve others
                if is_biz:
                    existing.is_in_main_bucket_biz = True
                if is_health:
                    existing.is_in_main_bucket_health = True
                if is_survivalist:
                    existing.is_in_main_bucket_survivalist = True
                # Merge summit_history
                existing_history = set(existing.summit_history or [])
                if summit_history_val:
                    existing_history.add(summit_history_val)
                existing.summit_history = list(existing_history)
                existing.engagement_level = engagement_level
                existing.email_state = email_state
                existing.email_sub_state = email_sub_state
                db.add(existing)
                logger.info(f"Updated contact: {email} ({existing.id}) with merged tags and main bucket.")
            else:
                contact = Contact(
                    id=contact_uuid,
                    email=email,
                    full_name=full_name,
                    tags=tags,
                    is_in_main_bucket_biz=is_biz,
                    is_in_main_bucket_health=is_health,
                    is_in_main_bucket_survivalist=is_survivalist,
                    engagement_level=engagement_level,
                    email_state=email_state,
                    email_sub_state=email_sub_state,
                    summit_history=[summit_history_val] if summit_history_val else [],
                )
                db.add(contact)
                logger.info(f"Inserted new contact: {email} ({contact_uuid}) with main bucket.")
            contacts.append(email)
        db.commit()
        logger.info(f"Successfully upserted {len(contacts)} contacts.")
        return {"total": len(contacts), "success": len(contacts)}
    except Exception as e:
        db.rollback()
        logger.error(f"Upload failed: {str(e)}")
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
    tag: Optional[str] = None,
    sort_field: Optional[str] = "email",
    sort_dir: Optional[str] = "asc",
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get a paginated list of contacts with optional filtering, searching, and sorting."""
    query = db.query(Contact)

    if main_bucket:
        query = query.filter(Contact.main_bucket_assignment == main_bucket)
    if personality_bucket:
        query = query.filter(Contact.personality_bucket_assignment == personality_bucket)
    if tag:
        query = query.filter(Contact.tags.contains([tag]))
    if search:
        ilike = f"%{search.lower()}%"
        query = query.filter(
            (Contact.email.ilike(ilike)) | (Contact.full_name.ilike(ilike))
        )
    if sort_field and hasattr(Contact, sort_field):
        sort_col = getattr(Contact, sort_field)
        if sort_dir == "desc":
            sort_col = sort_col.desc()
        query = query.order_by(sort_col)

    total = query.count()
    contacts = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "contacts": contacts
    }

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_contacts = db.query(Contact).count()
    unique_categorized = db.query(Contact).filter(Contact.personality_bucket_assignment.isnot(None)).count()
    categories = db.query(Contact.personality_bucket_assignment).distinct().count()
    # You can add more stats as needed
    return {
        "total_contacts": total_contacts,
        "unique_categorized": unique_categorized,
        "categories": categories,
        # Add more fields as needed
    }

@router.get("/main-buckets")
def get_main_buckets(db: Session = Depends(get_db)):
    buckets = [
        {"label": "Business Operations", "description": "Business-focused contacts and operations", "color": "blue", "field": "is_in_main_bucket_biz"},
        {"label": "Health", "description": "Health and wellness related contacts", "color": "green", "field": "is_in_main_bucket_health"},
        {"label": "Survivalist", "description": "Emergency preparedness and survival contacts", "color": "orange", "field": "is_in_main_bucket_survivalist"},
        {"label": "Cannot Place", "description": "Contacts that do not match any specific category", "color": "gray", "field": None},
    ]
    results = []
    for bucket in buckets:
        if bucket["field"]:
            count = db.query(Contact).filter(getattr(Contact, bucket["field"]) == True).count()
        else:
            # Cannot Place: not in any main bucket
            count = db.query(Contact).filter(
                (Contact.is_in_main_bucket_biz == False) &
                (Contact.is_in_main_bucket_health == False) &
                (Contact.is_in_main_bucket_survivalist == False)
            ).count()
        results.append({
            "label": bucket["label"],
            "description": bucket["description"],
            "color": bucket["color"],
            "count": count
        })
    return results

@router.post("/upload-csv")
async def upload_csv_contacts(
    file: UploadFile = File(...),
    main_bucket: str = Form(None),
    main_bucket_in_csv: str = Form('0'),
    db: Session = Depends(get_db)
):
    logger.info(f"Received upload-csv request: {file.filename} with main_bucket={main_bucket}, main_bucket_in_csv={main_bucket_in_csv}")
    if not file.filename.endswith('.csv'):
        logger.error("Upload failed: Only CSV files are supported")
        raise HTTPException(400, "Only CSV files are supported")
    try:
        contents = await file.read()
        csv_content = contents.decode()
        csv_file = StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        contacts = []
        emails_seen = set()
        # Parse engagement and summit history from file name
        engagement_level_file, summit_history_val = parse_engagement_and_history(file.filename)
        for row in reader:
            email = row.get('Email', '').strip()
            if not email or email in emails_seen:
                logger.warning(f"Duplicate or missing email in upload: {email}. Skipping row.")
                continue
            emails_seen.add(email)
            full_name = row.get('First Name', '').strip() or row.get('Name', '').strip()
            contact_id = row.get('Contact ID', '').strip()
            tags_raw = row.get('Contact Tags', '') or row.get('Tag', '')
            tags = [t.strip() for t in tags_raw.split(',') if t.strip()]
            # Validate or generate UUID
            try:
                contact_uuid = uuid.UUID(contact_id) if contact_id else uuid.uuid4()
            except Exception:
                contact_uuid = uuid.uuid4()
            # Determine main bucket flags
            if main_bucket_in_csv == '1':
                main_bucket_val = (row.get('Main Bucket') or '').strip().lower()
                is_biz = main_bucket_val in ['biz', 'business', 'business operations']
                is_health = main_bucket_val == 'health'
                is_survivalist = main_bucket_val == 'survivalist'
            else:
                is_biz = main_bucket == 'biz'
                is_health = main_bucket == 'health'
                is_survivalist = main_bucket == 'survivalist'
            # Upsert by email (email is unique)
            existing = db.query(Contact).filter(Contact.email == email).first()
            if existing:
                # Merge tags
                existing_tags = set(existing.tags or [])
                all_tags = list(existing_tags.union(tags))
                existing.tags = all_tags
                existing.full_name = full_name or existing.full_name
                existing.is_in_main_bucket_biz = is_biz
                existing.is_in_main_bucket_health = is_health
                existing.is_in_main_bucket_survivalist = is_survivalist
                engagement_level = row.get('Engagement') or row.get('Engagement Level') or engagement_level_file
                email_state = row.get('Email State')
                email_sub_state = row.get('Email Sub-State')
                if engagement_level:
                    existing.engagement_level = engagement_level
                if summit_history_val:
                    # Ensure summit_history is a list
                    if isinstance(existing.summit_history, str):
                        if existing.summit_history:
                            existing.summit_history = [existing.summit_history]
                        else:
                            existing.summit_history = []
                    elif not existing.summit_history:
                        existing.summit_history = []
                    # Only append if not already present
                    if summit_history_val not in existing.summit_history:
                        existing.summit_history.append(summit_history_val)
                if email_state:
                    existing.email_state = email_state
                if email_sub_state:
                    existing.email_sub_state = email_sub_state
                db.add(existing)
                logger.info(f"Updated contact: {email} ({existing.id}) with merged tags and main bucket.")
            else:
                contact = Contact(
                    id=contact_uuid,
                    email=email,
                    full_name=full_name,
                    tags=tags,
                    is_in_main_bucket_biz=is_biz,
                    is_in_main_bucket_health=is_health,
                    is_in_main_bucket_survivalist=is_survivalist,
                    engagement_level=engagement_level,
                    email_state=email_state,
                    email_sub_state=email_sub_state,
                    summit_history=[summit_history_val] if summit_history_val else [],
                )
                db.add(contact)
                logger.info(f"Inserted new contact: {email} ({contact_uuid}) with main bucket.")
            contacts.append(email)
        db.commit()
        logger.info(f"Successfully upserted {len(contacts)} contacts.")
        return {"total": len(contacts), "success": len(contacts)}
    except Exception as e:
        db.rollback()
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(500, str(e))

@router.post("/upload-zip")
async def upload_zip_contacts(
    file: UploadFile = File(...),
    use_folders: str = Form('1'),
    main_bucket: str = Form(None),
    db: Session = Depends(get_db)
):
    # Save the uploaded ZIP to a temp file
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = os.path.join(tmpdir, file.filename)
        with open(zip_path, 'wb') as f:
            f.write(await file.read())
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(tmpdir)
        # Walk the extracted files
        for root, dirs, files in os.walk(tmpdir):
            for fname in files:
                if fname.endswith('.csv'):
                    csv_path = os.path.join(root, fname)
                    # Determine main bucket from folder name if use_folders is set
                    bucket = None
                    if use_folders == '1':
                        rel_path = os.path.relpath(root, tmpdir)
                        folder = rel_path.split(os.sep)[0] if rel_path != '.' else None
                        if folder and folder.lower() in ['biz', 'business', 'business operations']:
                            bucket = 'biz'
                        elif folder and folder.lower() in ['health']:
                            bucket = 'health'
                        elif folder and folder.lower() in ['survivalist']:
                            bucket = 'survivalist'
                        else:
                            bucket = 'none'
                    else:
                        bucket = main_bucket or 'none'
                    # Open and process the CSV as in upload_csv_contacts
                    with open(csv_path, 'r', encoding='utf-8') as csvfile:
                        csv_content = csvfile.read()
                    # Here you would call the CSV processing logic with csv_content and bucket
                    # For now, just log the action
                    logger.info(f"Would process {csv_path} with main_bucket={bucket}")
                    # TODO: Actually process the CSV as in upload_csv_contacts
    return {"status": "success"}

def parse_engagement_and_history(filename):
    # Example: H-Common Sense.csv -> ('H', 'Common Sense')
    base = os.path.splitext(os.path.basename(filename))[0]
    match = re.match(r'([HMLU])-\s*(.+)', base, re.IGNORECASE)
    if match:
        engagement = match.group(1).upper()
        history = match.group(2).strip()
        return engagement, history
    return None, base

@router.get("/personality-buckets")
def get_personality_buckets(db: Session = Depends(get_db)):
    batch_service = BatchService(db)
    import asyncio
    return asyncio.run(batch_service.get_personality_buckets())

@router.get("/tags")
def get_all_tags(db: Session = Depends(get_db)):
    all_tags = db.query(Contact.tags).all()
    tag_set = set()
    for tags in all_tags:
        if tags and tags[0]:
            tag_set.update(tags[0])
    return {"tags": sorted(tag_set)}

@router.post("/clear-personality-buckets")
def clear_personality_buckets(db: Session = Depends(get_db)):
    db.query(Contact).update({Contact.personality_bucket_assignment: None})
    db.commit()
    return {"status": "success", "message": "All personality bucket assignments cleared."}

@router.get("/export-fields")
def get_exportable_fields():
    # Return all column names except id
    from ..models.contact import Contact
    mapper = inspect(Contact)
    fields = [col.key for col in mapper.attrs if col.key != "id"]
    return {"fields": fields}

@router.post("/export")
def export_contacts(data: dict, db: Session = Depends(get_db)):
    buckets = data.get("buckets", [])
    fields = data.get("fields", [
        "email", "full_name", "company", "main_bucket_assignment",
        "personality_bucket_assignment", "tags", "summit_history"
    ])
    contacts = db.query(Contact).filter(
        or_(
            Contact.main_bucket_assignment.in_(buckets),
            Contact.personality_bucket_assignment.in_(buckets)
        )
    ).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([f.replace("_", " ").title() for f in fields])
    for contact in contacts:
        row = []
        for f in fields:
            val = getattr(contact, f, "")
            if isinstance(val, list):
                val = ",".join(val)
            row.append(val)
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=contacts.csv"}
    )

@router.get("/tags-with-counts")
def get_tags_with_counts(db: Session = Depends(get_db)):
    all_tags = db.query(Contact.tags).all()
    tag_counts = {}
    for tags in all_tags:
        if tags and tags[0]:
            for tag in tags[0]:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
    tag_count_list = [
        {"tag": tag, "count": count} for tag, count in sorted(tag_counts.items(), key=lambda x: (-x[1], x[0]))
    ]
    return {"tags": tag_count_list} 