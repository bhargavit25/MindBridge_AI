from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Tuple
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
    "Anxious",
    "Stressed",
    "Sad",
    "Very Sad"
]

MOOD_TO_RATING: Dict[str, int] = {
    "Very Sad": 1,
    "Sad": 2,
    "Stressed": 3,
    "Anxious": 4,
    "Neutral": 5,
    "Happy": 6,
    "Very Happy": 7
}

RATING_TO_MOOD: Dict[int, str] = {v: k for k, v in MOOD_TO_RATING.items()}

MOOD_ALIASES: Dict[str, str] = {
    "very happy": "Very Happy",
    "great": "Very Happy",
    "excellent": "Very Happy",
    "happy": "Happy",
    "good": "Happy",
    "neutral": "Neutral",
    "okay": "Neutral",
    "ok": "Neutral",
    "anxious": "Anxious",
    "nervous": "Anxious",
    "worried": "Anxious",
    "stressed": "Stressed",
    "overwhelmed": "Stressed",
    "sad": "Sad",
    "low": "Sad",
    "down": "Sad",
    "very sad": "Very Sad",
    "very low": "Very Sad",
    "depressed": "Very Sad"
}

def normalize_mood(raw_mood: Any, rating: Optional[int] = None) -> Tuple[str, int]:
    """Validates and maps input mood label or rating into standard project scale."""
    # 1. Check if mood is empty/null/whitespace
    if raw_mood is None or (isinstance(raw_mood, str) and not raw_mood.strip()):
        if rating is not None and isinstance(rating, int) and 1 <= rating <= 7:
            m = RATING_TO_MOOD[rating]
            return m, rating
        raise HTTPException(
            status_code=400,
            detail=f"Mood value is required and cannot be empty. Must be one of: {', '.join(VALID_MOODS)}"
        )

    # 2. Check if raw_mood is an integer or numeric string
    if isinstance(raw_mood, int):
        if 1 <= raw_mood <= 7:
            m = RATING_TO_MOOD[raw_mood]
            return m, raw_mood
        raise HTTPException(status_code=400, detail="Numeric mood rating must be between 1 and 7.")

    raw_str = str(raw_mood).strip()
    if raw_str.isdigit():
        num = int(raw_str)
        if 1 <= num <= 7:
            m = RATING_TO_MOOD[num]
            return m, num
        raise HTTPException(status_code=400, detail="Numeric mood rating must be between 1 and 7.")

    # 3. Lookup alias / normalized form
    norm_key = raw_str.lower()
    if norm_key in MOOD_ALIASES:
        standard = MOOD_ALIASES[norm_key]
        return standard, MOOD_TO_RATING[standard]

    for valid in VALID_MOODS:
        if norm_key == valid.lower():
            return valid, MOOD_TO_RATING[valid]

    raise HTTPException(
        status_code=400,
        detail=f"Invalid mood value '{raw_mood}'. Must be one of: {', '.join(VALID_MOODS)}"
    )

def format_mood_out(entry: MoodEntry) -> MoodOut:
    out = MoodOut.model_validate(entry)
    out.rating = MOOD_TO_RATING.get(entry.mood, 5)
    return out

@router.post("", response_model=MoodOut, status_code=status.HTTP_201_CREATED)
def record_mood(
    payload: MoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mood_str, _ = normalize_mood(payload.mood, payload.rating)
    clean_note = payload.note.strip() if (payload.note and payload.note.strip()) else None

    entry = MoodEntry(
        user_id=current_user.id,
        mood=mood_str,
        note=clean_note
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return format_mood_out(entry)

@router.get("", response_model=List[MoodOut])
def get_mood_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id
    ).order_by(MoodEntry.created_at.desc()).all()
    return [format_mood_out(r) for r in records]

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
        "entry": format_mood_out(entry) if entry else None
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

    if payload.mood is not None or payload.rating is not None:
        mood_str, _ = normalize_mood(payload.mood, payload.rating)
        entry.mood = mood_str
    if payload.note is not None:
        entry.note = payload.note.strip() if payload.note.strip() else None

    db.commit()
    db.refresh(entry)
    return format_mood_out(entry)

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
