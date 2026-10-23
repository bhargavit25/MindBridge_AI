from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Counsellor(Base):
    __tablename__ = "counsellors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True)
    display_name = Column(String(100), nullable=False)
    professional_bio = Column(Text, nullable=False)
    expertise = Column(String(255), nullable=False)  # e.g. "Anxiety, Stress Management, CBT"
    email = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    user_account = relationship("User", back_populates="counsellor_profile")
    availability_slots = relationship("AvailabilitySlot", back_populates="counsellor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="counsellor", cascade="all, delete-orphan")
