from sqlalchemy.orm import Session
from ..models.contact import Contact
from typing import List, Dict
import csv
from io import StringIO
import uuid

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