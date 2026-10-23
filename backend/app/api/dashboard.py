from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.assessment import Assessment
from app.models.mood import MoodEntry
from app.models.journal import JournalEntry
from app.models.appointment import Appointment
from app.models.resource import Resource
from app.schemas import AssessmentOut, MoodOut, JournalOut, AppointmentOut, ResourceOut
from app.services.risk_service import risk_service
from app.api.appointments import format_appointment

router = APIRouter(prefix="/dashboard", tags=["Student Dashboard"])

@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Greeting
    display_name = current_user.display_name

    # 2. Today's Mood
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_mood = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.created_at >= today_start
    ).order_by(MoodEntry.created_at.desc()).first()

    # 3. Latest PHQ-9 & GAD-7
    latest_phq9 = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.assessment_type == "PHQ-9"
    ).order_by(Assessment.completed_at.desc()).first()

    latest_gad7 = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.assessment_type == "GAD-7"
    ).order_by(Assessment.completed_at.desc()).first()

    # 4. Mood History (last 14 days)
    two_weeks_ago = datetime.now(timezone.utc) - timedelta(days=14)
    recent_moods = db.query(MoodEntry).filter(
        MoodEntry.user_id == current_user.id,
        MoodEntry.created_at >= two_weeks_ago
    ).order_by(MoodEntry.created_at.asc()).all()

    # Calculate negative mood ratio for risk service
    negative_moods = [m for m in recent_moods if m.mood in ["Sad", "Very Sad", "Anxious", "Stressed"]]
    neg_ratio = len(negative_moods) / len(recent_moods) if recent_moods else 0.0

    # 5. Wellness Risk Indicator
    risk_info = risk_service.classify_wellness_risk(
        phq9_score=latest_phq9.total_score if latest_phq9 else None,
        gad7_score=latest_gad7.total_score if latest_gad7 else None,
        q9_flag=latest_phq9.flagged_safety if latest_phq9 else False,
        recent_negative_mood_ratio=neg_ratio
    )

    # 6. Recent Private Journals (last 3)
    recent_journals = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).order_by(JournalEntry.created_at.desc()).limit(3).all()

    # 7. Upcoming Appointments
    now = datetime.now(timezone.utc)
    upcoming_appts = db.query(Appointment).filter(
        Appointment.student_id == current_user.id,
        Appointment.status.in_(["Pending", "Confirmed"])
    ).order_by(Appointment.created_at.desc()).limit(3).all()

    # 8. Recommended Self-Help Resources (top 3)
    recommended_resources = db.query(Resource).order_by(Resource.views_count.desc()).limit(3).all()

    return {
        "user": {
            "id": current_user.id,
            "display_name": display_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "today_mood": MoodOut.model_validate(today_mood) if today_mood else None,
        "latest_phq9": AssessmentOut.model_validate(latest_phq9) if latest_phq9 else None,
        "latest_gad7": AssessmentOut.model_validate(latest_gad7) if latest_gad7 else None,
        "mood_history": [MoodOut.model_validate(m) for m in recent_moods],
        "wellness_risk": risk_info,
        "recent_journals": [JournalOut.model_validate(j) for j in recent_journals],
        "upcoming_appointments": [format_appointment(a) for a in upcoming_appts],
        "recommended_resources": [ResourceOut.model_validate(r) for r in recommended_resources]
    }
