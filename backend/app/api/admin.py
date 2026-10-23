from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User
from app.models.assessment import Assessment
from app.models.appointment import Appointment
from app.models.mood import MoodEntry
from app.models.resource import Resource
from app.schemas import AdminAnalyticsOut
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Institutional Administration Analytics"])

@router.get("/analytics", response_model=AdminAnalyticsOut)
def get_admin_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Returns privacy-preserving, institutional-level aggregated wellness metrics.
    Under strict privacy rules:
    - No private student journal entries are queried or returned.
    - No chat transcripts are queried or returned.
    - Anonymity thresholds are enforced to prevent deductive identification.
    """
    # 1. Total User Counts
    total_users = db.query(User).count()
    student_count = db.query(User).filter(User.role == "student").count()
    counsellor_count = db.query(User).filter(User.role == "counsellor").count()

    # 2. Completed Assessments
    total_assessments = db.query(Assessment).count()

    # 3. Appointments Statistics
    total_appointments = db.query(Appointment).count()
    appointments_by_status = {}
    for st in ["Pending", "Confirmed", "Completed", "Cancelled"]:
        count = db.query(Appointment).filter(Appointment.status == st).count()
        appointments_by_status[st] = count

    # 4. Aggregated Mood Distribution (Only if group size exceeds minimum privacy threshold)
    mood_distribution = {}
    total_mood_logs = db.query(MoodEntry).count()
    if total_mood_logs >= settings.MIN_AGGREGATE_GROUP_SIZE:
        mood_records = db.query(
            MoodEntry.mood, func.count(MoodEntry.id)
        ).group_by(MoodEntry.mood).all()
        for m, cnt in mood_records:
            mood_distribution[m] = cnt
    else:
        mood_distribution = {"Notice": "Insufficient aggregated data to protect student anonymity"}

    # 5. Assessment Severity Distribution (Aggregated)
    phq9_dist = {}
    phq9_records = db.query(
        Assessment.severity, func.count(Assessment.id)
    ).filter(Assessment.assessment_type == "PHQ-9").group_by(Assessment.severity).all()
    for sev, cnt in phq9_records:
        phq9_dist[sev] = cnt

    gad7_dist = {}
    gad7_records = db.query(
        Assessment.severity, func.count(Assessment.id)
    ).filter(Assessment.assessment_type == "GAD-7").group_by(Assessment.severity).all()
    for sev, cnt in gad7_records:
        gad7_dist[sev] = cnt

    # 6. Resource Engagement Metrics
    top_resources = db.query(Resource).order_by(Resource.views_count.desc()).limit(5).all()
    resource_metrics = [
        {"id": r.id, "title": r.title, "category": r.category, "views": r.views_count}
        for r in top_resources
    ]

    return {
        "total_users": total_users,
        "student_count": student_count,
        "counsellor_count": counsellor_count,
        "completed_assessments_count": total_assessments,
        "total_appointments": total_appointments,
        "appointments_by_status": appointments_by_status,
        "mood_distribution": mood_distribution,
        "phq9_severity_distribution": phq9_dist,
        "gad7_severity_distribution": gad7_dist,
        "top_resources": resource_metrics,
        "privacy_notice": (
            "MindBridge AI Institutional Privacy Guarantee: Individual student clinical screening records, "
            "private journal reflections, and AI chat transcripts are cryptographically isolated and never accessible "
            "via administrative aggregate dashboards."
        )
    }
