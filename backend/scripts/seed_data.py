import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.counsellor import Counsellor
from app.models.appointment import AvailabilitySlot, Appointment
from app.models.resource import Resource
from app.models.assessment import Assessment
from app.models.mood import MoodEntry
from app.models.journal import JournalEntry

def seed():
    print("[SEED] Initializing MindBridge AI Database Seed...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Administrator Account
        admin = db.query(User).filter(User.email == "admin@mindbridge.edu").first()
        if not admin:
            admin = User(
                display_name="Campus Wellness Dean",
                email="admin@mindbridge.edu",
                password_hash=get_password_hash("Admin@123456"),
                role="admin"
            )
            db.add(admin)
            print("  Created Admin: admin@mindbridge.edu / Admin@123456")

        # 2. Demo Student Account
        student = db.query(User).filter(User.email == "student@mindbridge.edu").first()
        if not student:
            student = User(
                display_name="Alex Chen",
                email="student@mindbridge.edu",
                password_hash=get_password_hash("Student@123456"),
                role="student"
            )
            db.add(student)
            print("  Created Student: student@mindbridge.edu / Student@123456")

        # 3. Demo Counsellor Accounts & Profiles
        counsellor_user = db.query(User).filter(User.email == "counsellor@mindbridge.edu").first()
        if not counsellor_user:
            counsellor_user = User(
                display_name="Dr. Priya Sharma",
                email="counsellor@mindbridge.edu",
                password_hash=get_password_hash("Counsellor@123456"),
                role="counsellor"
            )
            db.add(counsellor_user)
            db.commit()
            db.refresh(counsellor_user)
            print("  Created Counsellor User: counsellor@mindbridge.edu / Counsellor@123456")

        db.commit()

        # Seed Counsellor Profiles
        counsellor_profiles = [
            {
                "user_id": counsellor_user.id if counsellor_user else None,
                "display_name": "Dr. Priya Sharma, Ph.D.",
                "email": "priya.sharma@mindbridge.edu",
                "expertise": "Cognitive Behavioral Therapy (CBT), Exam Anxiety, Performance Panic",
                "professional_bio": (
                    "[Sample Demo Profile] Dr. Priya Sharma has 8+ years experience guiding college students "
                    "through academic stress, performance anxiety, and cognitive restructuring. Certified in CBT and Mindfulness-Based Stress Reduction."
                )
            },
            {
                "user_id": None,
                "display_name": "Dr. Rajesh Kumar, LMHC",
                "email": "rajesh.kumar@mindbridge.edu",
                "expertise": "Academic Burnout, Sleep Hygiene, Mindfulness & Meditation",
                "professional_bio": (
                    "[Sample Demo Profile] Dr. Rajesh specializes in helping engineering and graduate students "
                    "overcome chronic procrastination, circadian rhythm disruption, and thesis burnout through practical behavioral habits."
                )
            },
            {
                "user_id": None,
                "display_name": "Sarah Jenkins, M.A., LPC",
                "email": "sarah.jenkins@mindbridge.edu",
                "expertise": "Campus Social Transition, Imposter Phenomenon, Student Well-being",
                "professional_bio": (
                    "[Sample Demo Profile] Sarah supports first-year students and international scholars "
                    "navigating cultural transitions, social isolation, and self-doubt with warm, person-centered counseling."
                )
            }
        ]

        created_counsellors = []
        for cp in counsellor_profiles:
            c = db.query(Counsellor).filter(Counsellor.email == cp["email"]).first()
            if not c:
                c = Counsellor(
                    user_id=cp["user_id"],
                    display_name=cp["display_name"],
                    email=cp["email"],
                    expertise=cp["expertise"],
                    professional_bio=cp["professional_bio"],
                    is_active=True
                )
                db.add(c)
                db.commit()
                db.refresh(c)
                print(f"  Added Counsellor Profile: {c.display_name}")
            created_counsellors.append(c)

        # Seed Availability Slots for Counsellors (upcoming week)
        now = datetime.now(timezone.utc)
        for c in created_counsellors:
            existing_slots = db.query(AvailabilitySlot).filter(AvailabilitySlot.counsellor_id == c.id).count()
            if existing_slots == 0:
                for day_offset in range(1, 5):
                    for hour in [10, 14, 16]:
                        slot_start = (now + timedelta(days=day_offset)).replace(hour=hour, minute=0, second=0, microsecond=0)
                        slot_end = slot_start + timedelta(minutes=45)
                        slot = AvailabilitySlot(
                            counsellor_id=c.id,
                            start_time=slot_start,
                            end_time=slot_end,
                            is_available=True
                        )
                        db.add(slot)
                print(f"  Generated availability slots for {c.display_name}")
        db.commit()

        # Seed Self-Help Resources (8 Core Categories)
        resources_data = [
            {
                "title": "4-7-8 Breathing Technique for Rapid Calm",
                "category": "Mindfulness & Breathing",
                "reading_time": "3 min read",
                "short_description": "An evidence-based diaphragmatic breathing technique to downregulate autonomic stress in under 3 minutes.",
                "content": (
                    "When experiencing intense stress or panic before an exam or presentation, your heart rate accelerates "
                    "and breathing becomes shallow. The 4-7-8 breathing method acts as a natural tranquilizer for the nervous system.\n\n"
                    "Step 1: Empty your lungs completely through your mouth.\n"
                    "Step 2: Inhale quietly through your nose for a mental count of 4.\n"
                    "Step 3: Gently hold your breath for a count of 7.\n"
                    "Step 4: Exhale firmly through your mouth for a count of 8.\n"
                    "Step 5: Repeat this sequence for 4 breath cycles."
                ),
                "external_reference": "Harvard Health Publishing & Dr. Andrew Weil Integrative Medicine"
            },
            {
                "title": "Conquering Test Anxiety with Cognitive Reframing",
                "category": "Anxiety Coping",
                "reading_time": "5 min read",
                "short_description": "Transform catastrophic 'what-if' self-talk into constructive, actionable preparation strategies.",
                "content": (
                    "Test anxiety often originates from cognitive distortions like catastrophizing ('If I fail this midterm, my degree is over').\n\n"
                    "Cognitive Behavioral Therapy (CBT) teaches us to treat anxious thoughts as hypotheses rather than facts.\n\n"
                    "1. Identify the automatic thought.\n"
                    "2. Examine the evidence: Have you prepared? Can you score points on sections you know well?\n"
                    "3. Replace catastrophizing with realistic optimism: 'This is a tough test, but I have prepared, and one exam does not define my intelligence.'"
                ),
                "external_reference": "American Psychological Association (APA) Student Guide"
            },
            {
                "title": "The Student Sleep Hygiene Blueprint",
                "category": "Sleep Hygiene",
                "reading_time": "4 min read",
                "short_description": "Science-backed guidelines to restore REM sleep and cognitive recall without relying on excessive caffeine.",
                "content": (
                    "All-nighters do more harm than good: research proves staying awake all night reduces memory retention by up to 40%.\n\n"
                    "1. Anchor your wake-up time: Maintain the same wake time every morning to stabilize adenosine pressure.\n"
                    "2. View morning sunlight for 10 minutes to synchronize your circadian clock.\n"
                    "3. Set a caffeine cut-off 9 hours before your target sleep time.\n"
                    "4. Keep study notes outside the bed to keep your brain associating the mattress with rest."
                ),
                "external_reference": "National Sleep Foundation"
            },
            {
                "title": "Preventing and Reversing Academic Burnout",
                "category": "Academic Burnout",
                "reading_time": "6 min read",
                "short_description": "Recognize the subtle difference between temporary fatigue and chronic emotional exhaustion.",
                "content": (
                    "Burnout develops slowly when academic demands outpace cognitive recovery for weeks at a time.\n\n"
                    "Core symptoms include chronic cynicism, feeling detached from projects, and declining confidence.\n\n"
                    "Recovery begins with micro-breaks: schedule 10-minute digital detox walks between study sessions. "
                    "Remember that taking rest is not a reward for completing work; rest is a prerequisite for doing good work."
                ),
                "external_reference": "World Health Organization & College Mental Health Journal"
            },
            {
                "title": "Managing High-Stress Academic Deadlines",
                "category": "Stress Management",
                "reading_time": "4 min read",
                "short_description": "How to structure project milestones and defeat paralysis using the 25-minute Pomodoro protocol.",
                "content": (
                    "When facing multiple simultaneous project deadlines, the human brain suffers from decision fatigue.\n\n"
                    "Break the paralysis by defining the 'minimum viable next step'. Rather than thinking 'I must write a 20-page report', "
                    "commit to writing two sentences in 25 minutes. Once momentum begins, cognitive resistance fades."
                ),
                "external_reference": "Association for Psychological Science"
            },
            {
                "title": "Healthy Study Habits & Deep Focus",
                "category": "Healthy Study Habits",
                "reading_time": "5 min read",
                "short_description": "Evidence-based active recall and spaced repetition techniques to learn faster in fewer hours.",
                "content": (
                    "Passive re-reading of textbooks gives an illusion of competence with low retention.\n\n"
                    "Switch to Active Recall: Close your notebook and write down everything you remember about a concept from memory. "
                    "Space your reviews across 1, 3, and 7 days. This creates durable neural pathways."
                ),
                "external_reference": "Cognitive Science Society"
            },
            {
                "title": "Combating Loneliness and Fostering Campus Connections",
                "category": "Social Connection",
                "reading_time": "4 min read",
                "short_description": "Practical steps to build genuine peer friendships and overcome social hesitation at university.",
                "content": (
                    "Over 60% of university students report feeling lonely at some point during their degree.\n\n"
                    "Connecting doesn't require being the loudest extrovert in the hall. Join one club aligned with a niche interest, "
                    "invite a classmate to study together in the library, or participate in campus volunteer initiatives."
                ),
                "external_reference": "Higher Education Mental Health Alliance"
            },
            {
                "title": "What to Expect in Student Psychological Counseling",
                "category": "Seeking Professional Help",
                "reading_time": "4 min read",
                "short_description": "Demystifying campus therapy, confidentiality boundaries, and the intake consultation process.",
                "content": (
                    "Meeting with a counsellor is a collaborative, confidential space where you set the agenda.\n\n"
                    "Counsellors do not judge, grade, or lecture you. They listen actively and help you uncover cognitive patterns, "
                    "emotional triggers, and coping tools tailored to your individual values. You have full agency over your journey."
                ),
                "external_reference": "International Association of Counseling Services"
            }
        ]

        for res in resources_data:
            existing = db.query(Resource).filter(Resource.title == res["title"]).first()
            if not existing:
                r = Resource(
                    title=res["title"],
                    category=res["category"],
                    reading_time=res["reading_time"],
                    short_description=res["short_description"],
                    content=res["content"],
                    external_reference=res["external_reference"],
                    views_count=12
                )
                db.add(r)
                print(f"  Added Resource: {res['title']}")
        db.commit()

        # Seed sample mood entries & assessment for student@mindbridge.edu for rich initial dashboard
        if student:
            existing_mood = db.query(MoodEntry).filter(MoodEntry.user_id == student.id).count()
            if existing_mood == 0:
                moods_sample = [
                    ("Happy", "Felt good after completing algorithm assignment", now - timedelta(days=6)),
                    ("Neutral", "Normal study day in campus library", now - timedelta(days=5)),
                    ("Stressed", "Upcoming calculus quiz is causing some worry", now - timedelta(days=4)),
                    ("Anxious", "Midterm exam tomorrow morning", now - timedelta(days=3)),
                    ("Happy", "Exam went much better than expected!", now - timedelta(days=2)),
                    ("Very Happy", "Celebrated submission with study group", now - timedelta(days=1)),
                    ("Happy", "Feeling rested and ready for the week", now)
                ]
                for m, note, dt in moods_sample:
                    entry = MoodEntry(user_id=student.id, mood=m, note=note, created_at=dt)
                    db.add(entry)
                print("  Added sample mood trajectory for demo student")

            existing_assess = db.query(Assessment).filter(Assessment.user_id == student.id).count()
            if existing_assess == 0:
                phq = Assessment(
                    user_id=student.id,
                    assessment_type="PHQ-9",
                    answers=[1, 1, 1, 0, 1, 0, 1, 0, 0],
                    total_score=5,
                    severity="Mild",
                    flagged_safety=False,
                    completed_at=now - timedelta(days=3)
                )
                gad = Assessment(
                    user_id=student.id,
                    assessment_type="GAD-7",
                    answers=[1, 1, 0, 1, 0, 1, 0],
                    total_score=4,
                    severity="Minimal Anxiety",
                    flagged_safety=False,
                    completed_at=now - timedelta(days=3)
                )
                db.add(phq)
                db.add(gad)
                print("  Added baseline PHQ-9 & GAD-7 screening for demo student")

            existing_journal = db.query(JournalEntry).filter(JournalEntry.user_id == student.id).count()
            if existing_journal == 0:
                j = JournalEntry(
                    user_id=student.id,
                    title="Midterm Week Reflection",
                    content=(
                        "I was really anxious earlier this week about the machine learning exam, but practicing "
                        "box breathing before entering the exam room genuinely helped steady my focus. "
                        "I want to keep building this habit."
                    ),
                    mood_tag="Happy",
                    created_at=now - timedelta(days=2)
                )
                db.add(j)
                print("  Added sample journal reflection for demo student")

        db.commit()
        print("[SUCCESS] MindBridge AI Database Seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

