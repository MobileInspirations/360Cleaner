from sqlalchemy.orm import Session
from ..models.contact import Contact
from typing import List, Dict, Union
from .categorization_engine import assign_buckets
import csv
from io import StringIO
import uuid
from sqlalchemy import func

class BatchService:
    def __init__(self, db: Session):
        self.db = db

    async def process_csv(self, csv_content: str) -> Dict[str, int]:
        """Process CSV content and create contact records."""
        try:
            # Read CSV content
            csv_file = StringIO(csv_content)
            reader = csv.DictReader(csv_file)
            
            # Process each row
            contacts = []
            for row in reader:
                contact = Contact(
                    email=row.get('email', '').strip(),
                    full_name=row.get('full_name', '').strip(),
                    company=row.get('company', '').strip()
                )
                contacts.append(contact)

            # Bulk insert contacts
            self.db.bulk_save_objects(contacts)
            self.db.commit()

            return {
                "total": len(contacts),
                "success": len(contacts)
            }

        except Exception as e:
            self.db.rollback()
            raise Exception(f"Batch processing failed: {str(e)}")

    async def auto_categorize_contacts(self) -> Dict[str, int]:
        """Auto-categorize all uncategorized contacts using rule-based logic."""
        try:
            contacts = self.db.query(Contact).filter(
                Contact.personality_bucket_assignment.is_(None)
            ).all()
            print(f"Found {len(contacts)} contacts to categorize.")
            updated = 0
            for contact in contacts:
                # Only update personality_bucket_assignment, do not change main_bucket_assignment
                _, personality_bucket = assign_buckets(contact.tags or [], contact.main_bucket_assignment)
                contact.personality_bucket_assignment = personality_bucket
                updated += 1
            self.db.commit()
            return {"total": len(contacts), "updated": updated}
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Auto-categorization failed: {str(e)}")

    async def get_batch_status(self, batch_id: str) -> Dict:
        """Get the status of a batch processing task."""
        # This would typically query a batch status table
        # For now, return a mock response
        return {
            "batch_id": batch_id,
            "status": "completed",
            "total": 100,
            "processed": 100,
            "success": 100,
            "failed": 0
        } 

    async def get_personality_buckets(self) -> List[Dict[str, Union[str, int]]]:
        """Get all unique personality buckets and their counts."""
        results = self.db.query(
            Contact.personality_bucket_assignment,
            func.count(Contact.id)
        ).group_by(Contact.personality_bucket_assignment).all()
        return [
            {"bucket": bucket, "count": count}
            for bucket, count in results if bucket
        ]