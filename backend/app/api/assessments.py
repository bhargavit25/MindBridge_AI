from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.assessment import Assessment
from app.schemas import AssessmentCreate, AssessmentOut
from app.core.safety import evaluate_phq9_safety, VERIFIED_CRISIS_RESOURCES

router = APIRouter(prefix="/assessments", tags=["Assessments"])

# Standard PHQ-9 questions reference
PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless",
    "Thoughts that you would be better off dead or of hurting yourself in some way"
]

# Standard GAD-7 questions reference
GAD7_QUESTIONS = [
    "Feeling nervous, anxious or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen"
]

def interpret_phq9(score: int) -> Tuple[str, str]:
    if score <= 4:
        return "Minimal or None", "Your responses indicate minimal or no depressive symptoms. Continue practicing proactive self-care."
    elif score <= 9:
        return "Mild", "Your responses suggest mild depressive symptoms. Engaging in regular physical activity, sleep hygiene, and mindfulness may be beneficial."
    elif score <= 14:
        return "Moderate", "Your responses suggest moderate depressive symptoms. We encourage scheduling a confidential consultation with a campus counsellor."
    elif score <= 19:
        return "Moderately Severe", "Your responses suggest moderately severe symptoms. Professional psychological support is strongly recommended."
    else:
        return "Severe", "Your responses indicate severe symptoms. We strongly urge you to connect with campus mental health services or a licensed professional."

def interpret_gad7(score: int) -> Tuple[str, str]:
    if score <= 4:
        return "Minimal Anxiety", "Your score suggests minimal anxiety levels. Keep maintaining balanced daily routines and stress-reduction habits."
    elif score <= 9:
        return "Mild Anxiety", "Your score suggests mild anxiety. Relaxation strategies like 4-7-8 breathing and thought journaling can help ease tension."
    elif score <= 14:
        return "Moderate Anxiety", "Your score indicates moderate anxiety. Meeting with a mental health counsellor to explore coping strategies is recommended."
    else:
        return "Severe Anxiety", "Your score indicates severe anxiety symptoms. Reaching out for professional therapeutic guidance is strongly advised."

@router.get("/questions")
def get_assessment_questions():
    """Returns official questionnaire wording and standard 0-3 scale options."""
    options = [
        {"value": 0, "label": "Not at all"},
        {"value": 1, "label": "Several days"},
        {"value": 2, "label": "More than half the days"},
        {"value": 3, "label": "Nearly every day"}
    ]
    return {
        "phq9": {
            "title": "PHQ-9 (Patient Health Questionnaire)",
            "description": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
            "questions": PHQ9_QUESTIONS,
            "options": options
        },
        "gad7": {
            "title": "GAD-7 (Generalized Anxiety Disorder)",
            "description": "Over the last 2 weeks, how often have you been bothered by the following problems?",
            "questions": GAD7_QUESTIONS,
            "options": options
        }
    }

@router.post("/phq9", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def submit_phq9(
    payload: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(payload.answers) != 9:
        raise HTTPException(status_code=400, detail="PHQ-9 requires exactly 9 responses.")
    if any(a < 0 or a > 3 for a in payload.answers):
        raise HTTPException(status_code=400, detail="Each response must be between 0 and 3.")

    total = sum(payload.answers)
    severity, recommendation = interpret_phq9(total)
    
    # Question 9 safety evaluation (item index 8)
    q9_answer = payload.answers[8]
    safety_eval = evaluate_phq9_safety(q9_answer)
    flagged = safety_eval["flagged"]

    record = Assessment(
        user_id=current_user.id,
        assessment_type="PHQ-9",
        answers=payload.answers,
        total_score=total,
        severity=severity,
        flagged_safety=flagged
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    out = AssessmentOut.model_validate(record)
    out.recommendation = recommendation
    if flagged:
        out.safety_info = safety_eval
    return out

@router.post("/gad7", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def submit_gad7(
    payload: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(payload.answers) != 7:
        raise HTTPException(status_code=400, detail="GAD-7 requires exactly 7 responses.")
    if any(a < 0 or a > 3 for a in payload.answers):
        raise HTTPException(status_code=400, detail="Each response must be between 0 and 3.")

    total = sum(payload.answers)
    severity, recommendation = interpret_gad7(total)

    record = Assessment(
        user_id=current_user.id,
        assessment_type="GAD-7",
        answers=payload.answers,
        total_score=total,
        severity=severity,
        flagged_safety=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    out = AssessmentOut.model_validate(record)
    out.recommendation = recommendation
    return out

@router.get("/history", response_model=List[AssessmentOut])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all past assessments completed by the authenticated student."""
    records = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.completed_at.desc()).all()
    
    results = []
    for r in records:
        item = AssessmentOut.model_validate(r)
        if r.assessment_type == "PHQ-9":
            _, item.recommendation = interpret_phq9(r.total_score)
        else:
            _, item.recommendation = interpret_gad7(r.total_score)
        results.append(item)
    return results

@router.get("/latest")
def get_latest_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the latest PHQ-9 and GAD-7 results for the student dashboard."""
    latest_phq9 = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.assessment_type == "PHQ-9"
    ).order_by(Assessment.completed_at.desc()).first()

    latest_gad7 = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.assessment_type == "GAD-7"
    ).order_by(Assessment.completed_at.desc()).first()

    return {
        "phq9": AssessmentOut.model_validate(latest_phq9) if latest_phq9 else None,
        "gad7": AssessmentOut.model_validate(latest_gad7) if latest_gad7 else None
    }
