from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas import ChatPrompt, ChatMessageOut, ChatSessionOut
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["MindBridge Assistant AI"])

CONVERSATION_STARTERS = [
    "I'm feeling really overwhelmed with upcoming semester exams.",
    "Can you teach me a quick breathing exercise to calm down?",
    "I'm having trouble sleeping because my mind keeps racing.",
    "How can I manage feeling lonely or isolated on campus?",
    "What should I expect if I book an appointment with a counsellor?"
]

@router.get("/starters")
def get_starters():
    """Returns curated conversation starters for students."""
    return {"starters": CONVERSATION_STARTERS}

@router.post("", response_model=ChatMessageOut)
async def send_chat_message(
    payload: ChatPrompt,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Processes student query through RAG pipeline, enforces safety protocols,
    and returns empathetic AI wellness support.
    """
    clean_msg = payload.message.strip()
    if not clean_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Find or create session
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id,
            ChatSession.user_id == current_user.id
        ).first()

    if not session:
        # Title generated from first 30 chars of user query
        title = clean_msg[:30] + ("..." if len(clean_msg) > 30 else "")
        session = ChatSession(
            user_id=current_user.id,
            title=title
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg_record = ChatMessage(
        session_id=session.id,
        role="user",
        content=clean_msg
    )
    db.add(user_msg_record)
    db.commit()

    # Generate RAG response
    rag_result = await rag_service.generate_response(user_msg_record.content)

    # Save assistant message
    ai_msg_record = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=rag_result["content"],
        sources=rag_result.get("sources", []),
        is_crisis=rag_result.get("is_crisis", False)
    )
    db.add(ai_msg_record)
    db.commit()
    db.refresh(ai_msg_record)

    return ai_msg_record

@router.get("/sessions", response_model=List[ChatSessionOut])
def get_user_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists student's past chat sessions."""
    return db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()

@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return session

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permits students to completely delete their conversation history."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    db.delete(session)
    db.commit()
    return None
