from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.deps import get_current_user, require_counsellor
from app.models.user import User
from app.models.counsellor import Counsellor
from app.models.appointment import AvailabilitySlot
from app.schemas import CounsellorOut, SlotCreate, SlotOut

router = APIRouter(prefix="/counsellors", tags=["Counsellor Services"])

@router.get("", response_model=List[CounsellorOut])
def list_counsellors(db: Session = Depends(get_db)):
    """Public/Student directory of active university counsellors."""
    counsellors = db.query(Counsellor).filter(Counsellor.is_active == True).all()
    # Filter availability slots to only future and available slots
    now = datetime.now(timezone.utc)
    for c in counsellors:
        c.availability_slots = [
            s for s in c.availability_slots 
            if s.is_available and s.start_time > now
        ]
    return counsellors

@router.get("/{counsellor_id}", response_model=CounsellorOut)
def get_counsellor_profile(counsellor_id: int, db: Session = Depends(get_db)):
    counsellor = db.query(Counsellor).filter(
        Counsellor.id == counsellor_id,
        Counsellor.is_active == True
    ).first()
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found.")
    now = datetime.now(timezone.utc)
    counsellor.availability_slots = [
        s for s in counsellor.availability_slots 
        if s.is_available and s.start_time > now
    ]
    return counsellor

@router.post("/slots", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_availability_slot(
    payload: SlotCreate,
    current_user: User = Depends(require_counsellor),
    db: Session = Depends(get_db)
):
    """Counsellor adds an available consultation time slot."""
    counsellor = db.query(Counsellor).filter(Counsellor.user_id == current_user.id).first()
    if not counsellor:
        counsellor = Counsellor(
            user_id=current_user.id,
            display_name=current_user.display_name,
            email=current_user.email,
            expertise="General Psychological Counseling & Student Wellness",
            professional_bio=f"Counseling professional {current_user.display_name}",
            is_active=True
        )
        db.add(counsellor)
        db.commit()
        db.refresh(counsellor)

    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time.")

    slot = AvailabilitySlot(
        counsellor_id=counsellor.id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_available=True
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/slots/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability_slot(
    slot_id: int,
    current_user: User = Depends(require_counsellor),
    db: Session = Depends(get_db)
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found.")
    
    # Check if slot is already booked in an active appointment
    if not slot.is_available:
        raise HTTPException(status_code=400, detail="Cannot delete a slot with an active appointment.")

    db.delete(slot)
    db.commit()
    return None
