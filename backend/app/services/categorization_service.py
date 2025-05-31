from ..core.supabase import supabase
from ..models.contact import Contact
from sqlalchemy.orm import Session
import asyncio
from typing import List, Dict
import json

class CategorizationService:
    def __init__(self, db: Session):
        self.db = db

    async def categorize_contacts(self, contacts: List[Contact]) -> Dict[str, int]:
        """Categorize a batch of contacts using Supabase."""
        try:
            # Prepare contacts data for Supabase
            contacts_data = [
                {
                    "email": contact.email,
                    "full_name": contact.full_name,
                    "company": contact.company
                }
                for contact in contacts
            ]

            # Call Supabase function for categorization
            response = supabase.functions.invoke(
                "categorize-contacts",
                invoke_options={"body": json.dumps({"contacts": contacts_data})}
            )

            if response.status_code != 200:
                raise Exception(f"Supabase function error: {response.text}")

            results = response.json()
            
            # Update contacts with categorization results
            for contact, result in zip(contacts, results):
                contact.main_bucket_assignment = result.get("main_bucket")
                contact.personality_bucket_assignment = result.get("personality_bucket")
                contact.tags = result.get("tags", [])

            self.db.commit()
            return {"success": len(contacts)}

        except Exception as e:
            self.db.rollback()
            raise Exception(f"Categorization failed: {str(e)}") 