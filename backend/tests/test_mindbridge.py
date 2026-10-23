import pytest
from datetime import datetime, timedelta, timezone

def test_auth_registration_and_login(client):
    # 1. Register Student
    res = client.post("/api/auth/register", json={
        "display_name": "Test Student",
        "email": "teststudent@univ.edu",
        "password": "Password123!",
        "role": "student"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "teststudent@univ.edu"
    assert data["user"]["role"] == "student"

    # 2. Duplicate email rejected
    res_dup = client.post("/api/auth/register", json={
        "display_name": "Test Student 2",
        "email": "teststudent@univ.edu",
        "password": "Password123!"
    })
    assert res_dup.status_code == 400

    # 3. Successful Login
    res_login = client.post("/api/auth/login", json={
        "email": "teststudent@univ.edu",
        "password": "Password123!"
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token

    # 4. Invalid Password
    res_bad = client.post("/api/auth/login", json={
        "email": "teststudent@univ.edu",
        "password": "WrongPassword!"
    })
    assert res_bad.status_code == 401

    # 5. Access /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "teststudent@univ.edu"

def test_phq9_and_gad7_scoring(client):
    # Register user
    res = client.post("/api/auth/register", json={
        "display_name": "Assessment Tester",
        "email": "assess@univ.edu",
        "password": "Password123!",
        "role": "student"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. PHQ-9 without safety flag
    phq_data = {"answers": [1, 1, 2, 0, 1, 1, 0, 1, 0]}  # sum = 7 -> Mild
    res_phq = client.post("/api/assessments/phq9", json=phq_data, headers=headers)
    assert res_phq.status_code == 201
    phq_res = res_phq.json()
    assert phq_res["total_score"] == 7
    assert phq_res["severity"] == "Mild"
    assert phq_res["flagged_safety"] is False

    # 2. PHQ-9 with Question 9 safety trigger (> 0)
    phq_crisis = {"answers": [2, 2, 2, 2, 2, 2, 2, 2, 1]}  # Q9 is 1 -> safety trigger
    res_crisis = client.post("/api/assessments/phq9", json=phq_crisis, headers=headers)
    assert res_crisis.status_code == 201
    crisis_res = res_crisis.json()
    assert crisis_res["flagged_safety"] is True
    assert "safety_info" in crisis_res
    assert crisis_res["safety_info"]["flagged"] is True

    # 3. GAD-7 scoring
    gad_data = {"answers": [2, 3, 2, 1, 1, 2, 1]}  # sum = 12 -> Moderate Anxiety
    res_gad = client.post("/api/assessments/gad7", json=gad_data, headers=headers)
    assert res_gad.status_code == 201
    gad_res = res_gad.json()
    assert gad_res["total_score"] == 12
    assert "Moderate Anxiety" in gad_res["severity"]

    # 4. Assessment History
    res_hist = client.get("/api/assessments/history", headers=headers)
    assert res_hist.status_code == 200
    assert len(res_hist.json()) >= 3

def test_mood_and_journal_isolation(client):
    # User A
    res_a = client.post("/api/auth/register", json={
        "display_name": "Alice Student",
        "email": "alice@univ.edu",
        "password": "Password123!"
    })
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B
    res_b = client.post("/api/auth/register", json={
        "display_name": "Bob Student",
        "email": "bob@univ.edu",
        "password": "Password123!"
    })
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Alice creates a private journal
    res_j = client.post("/api/journal", json={
        "title": "Alice's Secret Thoughts",
        "content": "Confidential reflections about exam pressure.",
        "mood_tag": "Stressed"
    }, headers=headers_a)
    assert res_j.status_code == 201
    alice_journal_id = res_j.json()["id"]

    # Bob lists journals -> Alice's journal must NOT appear
    bob_journals = client.get("/api/journal", headers=headers_b).json()
    assert all(j["id"] != alice_journal_id for j in bob_journals)

    # Bob attempts to read Alice's journal directly -> 404 unauthorized
    res_hacker = client.get(f"/api/journal/{alice_journal_id}", headers=headers_b)
    assert res_hacker.status_code == 404

    # Alice creates mood entry
    res_m = client.post("/api/moods", json={
        "mood": "Happy",
        "note": "Studied with friends"
    }, headers=headers_a)
    assert res_m.status_code == 201
    mood_id = res_m.json()["id"]

    # Bob lists moods -> Alice's mood does not appear
    bob_moods = client.get("/api/moods", headers=headers_b).json()
    assert all(m["id"] != mood_id for m in bob_moods)

def test_counsellor_booking_and_double_booking_prevention(client):
    # 1. Admin creates counsellor profile & slot
    admin_reg = client.post("/api/auth/register", json={
        "display_name": "Head Admin",
        "email": "admin_test@univ.edu",
        "password": "Password123!",
        "role": "admin"
    })
    admin_token = admin_reg.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create Counsellor User
    c_user = client.post("/api/auth/register", json={
        "display_name": "Dr. Counsel",
        "email": "dr_counsel@univ.edu",
        "password": "Password123!",
        "role": "counsellor"
    })
    c_token = c_user.json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Create slot via counsellor
    now = datetime.now(timezone.utc)
    slot_res = client.post("/api/counsellors/slots", json={
        "start_time": (now + timedelta(days=2)).isoformat(),
        "end_time": (now + timedelta(days=2, minutes=45)).isoformat()
    }, headers=c_headers)
    assert slot_res.status_code == 201
    slot_id = slot_res.json()["id"]
    counsellor_id = slot_res.json()["counsellor_id"]

    # Student 1 books slot
    s1_reg = client.post("/api/auth/register", json={
        "display_name": "Student One",
        "email": "student1@univ.edu",
        "password": "Password123!"
    })
    s1_headers = {"Authorization": f"Bearer {s1_reg.json()['access_token']}"}

    booking1 = client.post("/api/appointments", json={
        "counsellor_id": counsellor_id,
        "availability_slot_id": slot_id,
        "notes": "Need advice on study burnout"
    }, headers=s1_headers)
    assert booking1.status_code == 201
    assert booking1.json()["status"] == "Confirmed"

    # Student 2 attempts to book the EXACT SAME slot -> Must be rejected (Double-booking prevention!)
    s2_reg = client.post("/api/auth/register", json={
        "display_name": "Student Two",
        "email": "student2@univ.edu",
        "password": "Password123!"
    })
    s2_headers = {"Authorization": f"Bearer {s2_reg.json()['access_token']}"}

    booking2 = client.post("/api/appointments", json={
        "counsellor_id": counsellor_id,
        "availability_slot_id": slot_id,
        "notes": "Attempting second booking on same slot"
    }, headers=s2_headers)
    assert booking2.status_code == 409  # Conflict!

def test_admin_rbac_and_privacy(client):
    # Regular Student
    stu_reg = client.post("/api/auth/register", json={
        "display_name": "Standard Student",
        "email": "normstudent@univ.edu",
        "password": "Password123!",
        "role": "student"
    })
    stu_headers = {"Authorization": f"Bearer {stu_reg.json()['access_token']}"}

    # Student denied access to Admin Analytics (403 Forbidden)
    res_deny = client.get("/api/admin/analytics", headers=stu_headers)
    assert res_deny.status_code == 403

    # Admin access granted
    admin_reg = client.post("/api/auth/register", json={
        "display_name": "Verified Admin",
        "email": "analytics_admin@univ.edu",
        "password": "Password123!",
        "role": "admin"
    })
    admin_headers = {"Authorization": f"Bearer {admin_reg.json()['access_token']}"}
    res_admin = client.get("/api/admin/analytics", headers=admin_headers)
    assert res_admin.status_code == 200
    analytics = res_admin.json()
    assert "total_users" in analytics
    assert "privacy_notice" in analytics
    # Ensure no individual transcripts or private journals leaked
    assert "transcripts" not in analytics
    assert "journals" not in analytics

def test_crisis_safety_layer_interception(client):
    # Register user
    reg = client.post("/api/auth/register", json={
        "display_name": "Chat User",
        "email": "chatuser@univ.edu",
        "password": "Password123!"
    })
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    # User sends message indicating crisis / self-harm
    crisis_msg = {"message": "I don't think I can go on anymore, I want to kill myself"}
    res = client.post("/api/chat", json=crisis_msg, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["is_crisis"] is True
    # Emergency helplines provided
    assert "14416" in data["content"] or "988" in data["content"]
    assert "Tele-MANAS" in data["content"] or "Lifeline" in data["content"]
