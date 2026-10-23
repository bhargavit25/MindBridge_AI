from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)  # Stress Management, Anxiety Coping, Sleep Hygiene, etc.
    short_description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    reading_time = Column(String(50), default="4 min read", nullable=False)
    external_reference = Column(String(255), nullable=True)
    views_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
