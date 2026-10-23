from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type = Column(String(20), nullable=False)  # "PHQ-9" or "GAD-7"
    answers = Column(JSON, nullable=False)  # List of integer scores [0..3]
    total_score = Column(Integer, nullable=False)
    severity = Column(String(50), nullable=False)
    flagged_safety = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="assessments")
