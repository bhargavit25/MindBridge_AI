from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(Integer, primary_key=True, index=True)
    counsellor_id = Column(Integer, ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    counsellor = relationship("Counsellor", back_populates="availability_slots")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)

class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        UniqueConstraint("availability_slot_id", name="uq_appointment_slot"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(Integer, ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False, index=True)
    availability_slot_id = Column(Integer, ForeignKey("availability_slots.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(String(50), default="Pending", nullable=False)  # "Pending", "Confirmed", "Completed", "Cancelled"
    notes = Column(Text, nullable=True)  # Student reason or note
    counsellor_notes = Column(Text, nullable=True)  # Private administrative note
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("User", back_populates="appointments", foreign_keys=[student_id])
    counsellor = relationship("Counsellor", back_populates="appointments")
    slot = relationship("AvailabilitySlot", back_populates="appointment")
