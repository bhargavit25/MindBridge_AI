from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.mood import MoodEntry
from app.schemas import MoodCreate, MoodUpdate, MoodOut

router = APIRouter(prefix="/moods", tags=["Mood Tracking"])

VALID_MOODS = [
    "Very Happy",
    "Happy",
    "Neutral",
    "Sad",
    "Very Sad",
    "Anxious",
    "Stressed"
]

@router.post("", response_model=MoodOut, status_code=status.HTTP_201_CREATED)
def record_mood(
    payload: MoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.mood not in VALID_MOODS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mood value. Must be one of: {', '.join(VALID_MOODS)}"
        )
    
    entry = MoodEntry(
        user_id=current_user.id,
        mood=payload.mood,
        note=payload.note.strip() if payload.note else None
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("", response_model=List[MoodOut])
def get_mood_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id
    ).order_by(MoodEntry.created_at.desc()).all()

@router.get("/today", response_model=Dict[str, Any])
def get_today_mood(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    entry = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.created_at >= today_start
    ).order_by(MoodEntry.created_at.desc()).first()

    return {
        "recorded": bool(entry),
        "entry": MoodOut.model_validate(entry) if entry else None
    }

@router.put("/{entry_id}", response_model=MoodOut)
def update_mood(
    entry_id: int,
    payload: MoodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(MoodEntry).filter(
        MoodEntry.id == entry_id,
        MoodEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found.")

    if payload.mood:
        if payload.mood not in VALID_MOODS:
            raise HTTPException(status_code=400, detail=f"Invalid mood value.")
        entry.mood = payload.mood
    if payload.note is not None:
        entry.note = payload.note.strip() if payload.note else None

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mood(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(MoodEntry).filter(
        MoodEntry.id == entry_id,
        MoodEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found.")

    db.delete(entry)
    db.commit()
    return None
