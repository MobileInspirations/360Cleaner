from sqlalchemy import Column, String, DateTime, JSON, Boolean, Float, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from ..core.database import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    tags = Column(JSONB, nullable=False, default=list)

    # Main Bucket Affiliations
    is_in_main_bucket_biz = Column(Boolean, nullable=False, default=False)
    is_in_main_bucket_health = Column(Boolean, nullable=False, default=False)
    is_in_main_bucket_survivalist = Column(Boolean, nullable=False, default=False)

    # Source Data Fields
    date_added_source = Column(DateTime(timezone=True), nullable=True)
    date_modified_source = Column(DateTime(timezone=True), nullable=True)
    referring_page_source = Column(String, nullable=True)
    source_contact_id = Column(String, nullable=True)
    stop_time_source = Column(DateTime(timezone=True), nullable=True)
    stop_status_source = Column(String, nullable=True)
    misc_source_info = Column(String, nullable=True)
    ad_tracking_source = Column(String, nullable=True)
    ip_address_source = Column(String, nullable=True)
    web_form_url_source = Column(String, nullable=True)
    country_source = Column(String, nullable=True)
    region_source = Column(String, nullable=True)
    city_source = Column(String, nullable=True)
    postal_code_source = Column(String, nullable=True)
    latitude_source = Column(Float, nullable=True)
    longitude_source = Column(Float, nullable=True)
    dma_code_source = Column(String, nullable=True)
    area_code_source = Column(String, nullable=True)
    address_source = Column(String, nullable=True)
    phone_source = Column(String, nullable=True)
    gender_source = Column(String, nullable=True)
    rh_subid = Column(String, nullable=True)
    rh_isref = Column(Boolean, nullable=True)
    rh_source_info = Column(String, nullable=True)
    rh_partner = Column(String, nullable=True)
    rh_partner_name = Column(String, nullable=True)
    engagement_level_source = Column(String, nullable=True)

    # Personality Bucket Assignment
    personality_bucket_assignment = Column(String, nullable=True, index=True)

    engagement_level = Column(String, nullable=True, index=True)
    summit_history = Column(JSONB, nullable=False, default=list)

    main_bucket_assignment = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 