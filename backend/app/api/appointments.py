from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.counsellor import Counsellor
from app.models.appointment import Appointment, AvailabilitySlot
from app.schemas import AppointmentCreate, AppointmentStatusUpdate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["Counsellor Appointments"])

def format_appointment(appt: Appointment) -> AppointmentOut:
    out = AppointmentOut.model_validate(appt)
    if appt.student:
        out.student_name = appt.student.display_name
    if appt.counsellor:
        out.counsellor_name = appt.counsellor.display_name
    if appt.slot:
        out.start_time = appt.slot.start_time
        out.end_time = appt.slot.end_time
    return out

@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enforces atomic booking check and database constraint to completely prevent double-booking.
    """
    # 1. Check availability slot
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.id == payload.availability_slot_id,
        AvailabilitySlot.counsellor_id == payload.counsellor_id
    ).with_for_update().first() if not db.bind.dialect.name == "sqlite" else db.query(AvailabilitySlot).filter(
        AvailabilitySlot.id == payload.availability_slot_id,
        AvailabilitySlot.counsellor_id == payload.counsellor_id
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Selected appointment slot does not exist.")

    if not slot.is_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment slot has already been booked by another student."
        )

    # 2. Check if student already has a pending or confirmed booking in this slot
    existing = db.query(Appointment).filter(
        Appointment.availability_slot_id == slot.id,
        Appointment.status.in_(["Pending", "Confirmed"])
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment slot is no longer available."
        )

    try:
        # Mark slot unavailable
        slot.is_available = False

        new_appt = Appointment(
            student_id=current_user.id,
            counsellor_id=payload.counsellor_id,
            availability_slot_id=slot.id,
            status="Confirmed",
            notes=payload.notes.strip() if payload.notes else None
        )
        db.add(new_appt)
        db.commit()
        db.refresh(new_appt)
        return format_appointment(new_appt)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Double-booking prevented by system constraints. Please select a different time slot."
        )

@router.get("", response_model=List[AppointmentOut])
def get_user_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns appointments for the authenticated user based on role:
    - Students see their bookings.
    - Counsellors see their scheduled consultations.
    - Administrators see institutional overview.
    """
    if current_user.role == "counsellor":
        counsellor = db.query(Counsellor).filter(Counsellor.user_id == current_user.id).first()
        if counsellor:
            appts = db.query(Appointment).filter(
                Appointment.counsellor_id == counsellor.id
            ).order_by(Appointment.created_at.desc()).all()
        else:
            appts = []
    elif current_user.role == "admin":
        appts = db.query(Appointment).order_by(Appointment.created_at.desc()).all()
    else:
        # Student
        appts = db.query(Appointment).filter(
            Appointment.student_id == current_user.id
        ).order_by(Appointment.created_at.desc()).all()

    return [format_appointment(a) for a in appts]

@router.patch("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    # Authorization check
    is_student_owner = appt.student_id == current_user.id
    is_counsellor_owner = False
    if current_user.role == "counsellor":
        counsellor = db.query(Counsellor).filter(Counsellor.user_id == current_user.id).first()
        if counsellor and counsellor.id == appt.counsellor_id:
            is_counsellor_owner = True

    if not (is_student_owner or is_counsellor_owner or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this appointment.")

    appt.status = "Cancelled"
    
    # Release slot back to available if slot is still in future
    if appt.slot and appt.slot.start_time > datetime.now(timezone.utc):
        appt.slot.is_available = True

    db.commit()
    db.refresh(appt)
    return format_appointment(appt)

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Counsellor updates appointment status (Confirmed, Completed, Cancelled) and administrative notes."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    # Check role
    if current_user.role not in ["counsellor", "admin"]:
        raise HTTPException(status_code=403, detail="Only counsellors can update appointment status.")

    if payload.status not in ["Pending", "Confirmed", "Completed", "Cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status.")

    appt.status = payload.status
    if payload.counsellor_notes is not None:
        appt.counsellor_notes = payload.counsellor_notes.strip()

    if payload.status == "Cancelled" and appt.slot:
        appt.slot.is_available = True

    db.commit()
    db.refresh(appt)
    return format_appointment(appt)
