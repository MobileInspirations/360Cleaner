from ..models.contact import Contact
from sqlalchemy.orm import Session
from ..services.categorization_engine import assign_buckets
from typing import List, Dict
import asyncio
import json

class CategorizationService:
    def __init__(self, db: Session):
        self.db = db

    async def categorize_contacts(self, contacts: List[Contact]) -> Dict[str, int]:
        """Categorize a batch of contacts using rule-based logic."""
        try:
            updated = 0
            for contact in contacts:
                main_bucket, personality_bucket = assign_buckets(contact.tags or [], contact.main_bucket_assignment)
                contact.main_bucket_assignment = main_bucket
                contact.personality_bucket_assignment = personality_bucket
                updated += 1
            self.db.commit()
            return {"success": updated}
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Categorization failed: {str(e)}") 