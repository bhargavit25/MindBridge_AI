import os
os.environ["SKIP_OLLAMA_HTTP"] = "true"
import sys
import asyncio
import pytest
from datetime import datetime, timezone, timedelta

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.assessment import Assessment
from app.models.mood import MoodEntry
from app.models.chat import ChatSession, ChatMessage
from app.schemas import AssessmentCreate, MoodCreate, MoodUpdate, ChatPrompt
from app.api.assessments import submit_phq9, submit_gad7, get_latest_assessments, get_assessment_history
from app.api.mood import record_mood, get_mood_history, get_today_mood, update_mood, delete_mood, normalize_mood
from app.api.chat import send_chat_message
from app.services.rag_service import rag_service
from app.core.safety import detect_crisis_language, generate_safety_response
from fastapi import HTTPException

# Setup test DB
TEST_DB_URL = "sqlite:///./test_verification.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def setup_module():
    os.environ["SKIP_OLLAMA_HTTP"] = "true"
    Base.metadata.create_all(bind=test_engine)

def teardown_module():
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_verification.db"):
        try:
            os.remove("./test_verification.db")
        except Exception:
            pass

def create_mock_user(db, email="test_student@mindbridge.edu"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            display_name="Test Student",
            email=email,
            password_hash="fakehash123",
            role="student"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# =========================================================================
# ISSUE 1 TESTS: PHQ-9 & GAD-7 SCREENING SCORES AND VISIBILITY
# =========================================================================
def test_phq9_scoring_and_visibility():
    db = TestSession()
    user = create_mock_user(db, "phq9_user@mindbridge.edu")

    # 1. Standard PHQ-9 (9 items: 0..3)
    answers = [1, 2, 1, 0, 1, 1, 0, 1, 0] # Sum = 7 -> Mild
    payload = AssessmentCreate(answers=answers)
    result = submit_phq9(payload=payload, current_user=user, db=db)

    assert result.total_score == 7
    assert result.score == 7, "score alias must match total_score"
    assert result.severity == "Mild"
    assert result.flagged_safety is False
    assert result.recommendation is not None
    assert result.interpretation == result.recommendation, "interpretation alias must match recommendation"
    assert "mild depressive symptoms" in result.recommendation.lower()

    # 2. PHQ-9 Question 9 Safety Trigger (Item index 8 > 0)
    crisis_answers = [1, 1, 1, 1, 1, 1, 1, 1, 2] # Q9 = 2
    crisis_payload = AssessmentCreate(answers=crisis_answers)
    crisis_result = submit_phq9(payload=crisis_payload, current_user=user, db=db)

    assert crisis_result.total_score == 10
    assert crisis_result.flagged_safety is True
    assert crisis_result.safety_info is not None
    assert crisis_result.safety_info["flagged"] is True

    # 3. Invalid PHQ-9 checks (8 answers instead of 9)
    with pytest.raises(HTTPException) as exc1:
        submit_phq9(payload=AssessmentCreate(answers=[1] * 8), current_user=user, db=db)
    assert exc1.value.status_code == 400

    db.close()

def test_gad7_scoring_and_visibility():
    db = TestSession()
    user = create_mock_user(db, "gad7_user@mindbridge.edu")

    # 1. Standard GAD-7 (7 items: 0..3)
    answers = [2, 3, 2, 1, 1, 2, 1] # Sum = 12 -> Moderate Anxiety
    payload = AssessmentCreate(answers=answers)
    result = submit_gad7(payload=payload, current_user=user, db=db)

    assert result.total_score == 12
    assert result.score == 12, "score alias must match total_score"
    assert "Moderate Anxiety" in result.severity
    assert result.recommendation is not None
    assert result.interpretation == result.recommendation
    assert "counsellor" in result.recommendation.lower() or "coping" in result.recommendation.lower()

    # 2. Invalid GAD-7 checks (8 answers instead of 7)
    with pytest.raises(HTTPException) as exc2:
        submit_gad7(payload=AssessmentCreate(answers=[1] * 8), current_user=user, db=db)
    assert exc2.value.status_code == 400

    db.close()

def test_assessments_latest_and_history_persistence():
    db = TestSession()
    user = create_mock_user(db, "persist_user@mindbridge.edu")

    # Submit both assessments
    submit_phq9(AssessmentCreate(answers=[0, 1, 0, 1, 0, 1, 0, 0, 0]), current_user=user, db=db)
    submit_gad7(AssessmentCreate(answers=[1, 1, 1, 0, 1, 0, 1]), current_user=user, db=db)

    # Test /latest
    latest = get_latest_assessments(current_user=user, db=db)
    assert latest["phq9"] is not None
    assert latest["phq9"].total_score == 3
    assert latest["phq9"].score == 3
    assert latest["phq9"].recommendation is not None
    assert latest["phq9"].interpretation is not None

    assert latest["gad7"] is not None
    assert latest["gad7"].total_score == 5
    assert latest["gad7"].score == 5
    assert latest["gad7"].recommendation is not None
    assert latest["gad7"].interpretation is not None

    # Test /history
    history = get_assessment_history(current_user=user, db=db)
    assert len(history) >= 2
    for h in history:
        assert h.total_score is not None
        assert h.score == h.total_score
        assert h.recommendation is not None
        assert h.interpretation is not None

    db.close()

# =========================================================================
# ISSUE 2 TESTS: MOOD TRACKER VALIDATION, SCALES, AND PERSISTENCE
# =========================================================================
def test_mood_validations_and_scales():
    db = TestSession()
    user = create_mock_user(db, "mood_user@mindbridge.edu")

    # 1. Test all 7 official moods
    expected_ratings = {
        "Very Sad": 1,
        "Sad": 2,
        "Stressed": 3,
        "Anxious": 4,
        "Neutral": 5,
        "Happy": 6,
        "Very Happy": 7
    }

    for mood_name, expected_rate in expected_ratings.items():
        entry = record_mood(MoodCreate(mood=mood_name, note=f"Note for {mood_name}"), current_user=user, db=db)
        assert entry.mood == mood_name
        assert entry.rating == expected_rate

    # 2. Test case-insensitivity and trimming
    trimmed = record_mood(MoodCreate(mood="  happy  "), current_user=user, db=db)
    assert trimmed.mood == "Happy"
    assert trimmed.rating == 6

    # 3. Test synonym / alias mappings
    alias_tests = [
        ("great", "Very Happy", 7),
        ("good", "Happy", 6),
        ("okay", "Neutral", 5),
        ("low", "Sad", 2),
        ("very low", "Very Sad", 1)
    ]
    for raw_alias, target_mood, target_rating in alias_tests:
        res = record_mood(MoodCreate(mood=raw_alias), current_user=user, db=db)
        assert res.mood == target_mood
        assert res.rating == target_rating

    # 4. Test numeric rating input
    num_res = record_mood(MoodCreate(mood="", rating=3), current_user=user, db=db)
    assert num_res.mood == "Stressed"
    assert num_res.rating == 3

    # 5. Test invalid values rejected with 400
    invalid_cases = ["", "   ", "completely_unknown_mood", "xyz123"]
    for inv in invalid_cases:
        with pytest.raises(HTTPException) as exc:
            record_mood(MoodCreate(mood=inv), current_user=user, db=db)
        assert exc.value.status_code == 400

    # 6. Test mood history and update
    all_moods = get_mood_history(current_user=user, db=db)
    assert len(all_moods) >= 7
    first_id = all_moods[0].id

    # Update mood
    updated = update_mood(entry_id=first_id, payload=MoodUpdate(mood="Very Happy", note="Updated note"), current_user=user, db=db)
    assert updated.mood == "Very Happy"
    assert updated.note == "Updated note"

    # Today mood query
    today_res = get_today_mood(current_user=user, db=db)
    assert today_res["recorded"] is True
    assert today_res["entry"] is not None

    db.close()

# =========================================================================
# ISSUE 3 TESTS: CHATBOT RESPONSE GENERATION, DIRECT ANSWERS, SAFETY
# =========================================================================
def test_chatbot_exam_anxiety_direct_answer():
    # User asks: "I feel anxious before exams. What should I do?"
    user_msg = "I feel anxious before exams. What should I do?"
    response = rag_service.generate_response_sync(user_msg)

    assert response["is_crisis"] is False
    content = response["content"]

    # 1. Must give direct answer first (not just a question)
    assert not content.strip().startswith("?"), "Response must not start with a question"
    assert not content.strip().endswith("?"), "Response must provide guidance rather than ending abruptly with a question"

    # 2. Must contain empathetic, practical advice
    content_lower = content.lower()
    assert "anxiety" in content_lower
    assert "breathing" in content_lower or "break" in content_lower or "pomodoro" in content_lower
    assert "counsellor" in content_lower or "counselor" in content_lower

    # 3. Must reference relevant educational sources
    assert len(response.get("sources", [])) > 0

def test_chatbot_breathing_technique():
    user_msg = "Can you teach me a quick breathing exercise to calm down?"
    response = rag_service.generate_response_sync(user_msg)

    assert response["is_crisis"] is False
    content = response["content"]

    # Should give concrete steps (inhale, exhale, counts)
    assert "inhale" in content.lower()
    assert "exhale" in content.lower()

def test_chatbot_crisis_interception():
    # Crisis trigger query
    crisis_msg = "I want to kill myself, I cannot take this anymore"
    response = rag_service.generate_response_sync(crisis_msg)

    assert response["is_crisis"] is True
    content = response["content"]

    # Must provide verified emergency helplines
    assert "14416" in content or "988" in content
    assert "Tele-MANAS" in content or "Lifeline" in content

def test_chatbot_chat_endpoint_with_history():
    db = TestSession()
    user = create_mock_user(db, "chat_user@mindbridge.edu")

    # Send message via API router
    prompt = ChatPrompt(message="I am having trouble sleeping because my mind keeps racing.")
    import inspect
    res = send_chat_message(payload=prompt, current_user=user, db=db)
    # If returned coroutine or direct object:
    if inspect.iscoroutine(res):
        import asyncio
        chat_out = asyncio.run(res)
    else:
        chat_out = res

    assert chat_out.session_id is not None
    assert chat_out.content is not None
    assert "sleep" in chat_out.content.lower()

    db.close()
