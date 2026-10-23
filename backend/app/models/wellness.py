from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class WellnessIndicator(Base):
    __tablename__ = "wellness_indicators"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    indicator_type = Column(String(50), nullable=False)  # "Low Risk", "Moderate Attention", "Elevated Risk", "Crisis Attention"
    explanation = Column(Text, nullable=False)
    factors = Column(JSON, nullable=True)  # Transparent contributing scores and signals
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="wellness_indicators")
