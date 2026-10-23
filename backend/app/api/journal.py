from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.journal import JournalEntry
from app.schemas import JournalCreate, JournalUpdate, JournalOut

router = APIRouter(prefix="/journal", tags=["Private Journal"])

@router.post("", response_model=JournalOut, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    payload: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = JournalEntry(
        user_id=current_user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        mood_tag=payload.mood_tag
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("", response_model=List[JournalOut])
def get_journal_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns private journal entries strictly for the authenticated student."""
    return db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).order_by(JournalEntry.created_at.desc()).all()

@router.get("/{entry_id}", response_model=JournalOut)
def get_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized.")
    return entry

@router.put("/{entry_id}", response_model=JournalOut)
def update_journal_entry(
    entry_id: int,
    payload: JournalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized.")

    if payload.title is not None:
        entry.title = payload.title.strip()
    if payload.content is not None:
        entry.content = payload.content.strip()
    if payload.mood_tag is not None:
        entry.mood_tag = payload.mood_tag

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found or unauthorized.")

    db.delete(entry)
    db.commit()
    return None
