from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    display_name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = None

# --- Assessment Schemas ---
class AssessmentCreate(BaseModel):
    answers: List[int] = Field(..., min_length=7, max_length=9)

class AssessmentOut(BaseModel):
    id: int
    user_id: int
    assessment_type: str
    answers: List[int]
    total_score: int
    severity: str
    flagged_safety: bool
    completed_at: datetime
    recommendation: Optional[str] = None
    safety_info: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Mood Schemas ---
class MoodCreate(BaseModel):
    mood: str
    note: Optional[str] = None

class MoodUpdate(BaseModel):
    mood: Optional[str] = None
    note: Optional[str] = None

class MoodOut(BaseModel):
    id: int
    user_id: int
    mood: str
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Journal Schemas ---
class JournalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    mood_tag: Optional[str] = None

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_tag: Optional[str] = None

class JournalOut(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    mood_tag: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Counsellor & Slot Schemas ---
class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

class SlotOut(BaseModel):
    id: int
    counsellor_id: int
    start_time: datetime
    end_time: datetime
    is_available: bool

    class Config:
        from_attributes = True

class CounsellorOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    display_name: str
    professional_bio: str
    expertise: str
    email: str
    is_active: bool
    availability_slots: Optional[List[SlotOut]] = []

    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentCreate(BaseModel):
    counsellor_id: int
    availability_slot_id: int
    notes: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str  # "Pending", "Confirmed", "Completed", "Cancelled"
    counsellor_notes: Optional[str] = None

class AppointmentOut(BaseModel):
    id: int
    student_id: int
    counsellor_id: int
    availability_slot_id: int
    status: str
    notes: Optional[str] = None
    counsellor_notes: Optional[str] = None
    created_at: datetime
    student_name: Optional[str] = None
    counsellor_name: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Chat Schemas ---
class ChatPrompt(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[int] = None

class ChatMessageOut(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    sources: Optional[List[str]] = None
    is_crisis: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[ChatMessageOut]] = []

    class Config:
        from_attributes = True

# --- Resource Schemas ---
class ResourceOut(BaseModel):
    id: int
    title: str
    category: str
    short_description: str
    content: str
    reading_time: str
    external_reference: Optional[str] = None
    views_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Wellness & Risk Schemas ---
class WellnessRiskOut(BaseModel):
    indicator_type: str
    explanation: str
    factors: Dict[str, Any]
    recommendations: List[str]

# --- Admin Analytics Schemas ---
class AdminAnalyticsOut(BaseModel):
    total_users: int
    student_count: int
    counsellor_count: int
    completed_assessments_count: int
    total_appointments: int
    appointments_by_status: Dict[str, int]
    mood_distribution: Dict[str, Any]
    phq9_severity_distribution: Dict[str, Any]
    gad7_severity_distribution: Dict[str, Any]
    top_resources: List[Dict[str, Any]]
    privacy_notice: str
