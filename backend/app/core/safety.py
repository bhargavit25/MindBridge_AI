import re
from typing import Dict, Any, Tuple, List

# Verified crisis helplines and resources
VERIFIED_CRISIS_RESOURCES = [
    {
        "name": "Tele-MANAS (Govt of India 24x7 Mental Health Helpline)",
        "contact": "14416 or 1800-891-4416",
        "description": "Free, confidential 24/7 mental health counseling across India in multiple regional languages.",
        "region": "India"
    },
    {
        "name": "KIRAN Mental Health Helpline",
        "contact": "1800-599-0019",
        "description": "24/7 toll-free helpline providing psychological support, distress management, and mental health first aid.",
        "region": "India"
    },
    {
        "name": "988 Suicide & Crisis Lifeline",
        "contact": "Dial 988 (Call or Text)",
        "description": "Free and confidential support available 24/7 across the United States and Canada.",
        "region": "USA / Canada"
    },
    {
        "name": "Crisis Text Line",
        "contact": "Text HOME to 741741",
        "description": "Free, 24/7 crisis counseling via text message with a trained crisis counselor.",
        "region": "Global / USA / UK"
    },
    {
        "name": "Campus Emergency / Student Support",
        "contact": "Contact your University Health Center or Campus Security immediately",
        "description": "Immediate on-campus psychological and medical emergency assistance for enrolled students.",
        "region": "Campus"
    }
]

# Patterns indicating potential self-harm, suicidal ideation, or immediate crises
CRISIS_PATTERNS = [
    r"\b(suicid|kill myself|want to die|end my life|take my own life)\b",
    r"\b(self-harm|cutting myself|hurt myself|harm myself)\b",
    r"\b(no reason to live|better off dead|can'?t go on anymore)\b",
    r"\b(overdose|hang myself|jump off|swallow pills)\b",
    r"\b(goodbye cruel world|saying goodbye to everyone)\b"
]

_crisis_regex = re.compile("|".join(CRISIS_PATTERNS), re.IGNORECASE)

def detect_crisis_language(text: str) -> bool:
    """Detects if user input contains expressions of immediate distress or self-harm."""
    if not text:
        return False
    return bool(_crisis_regex.search(text))

def generate_safety_response() -> Dict[str, Any]:
    """
    Returns a compassionate, non-judgmental crisis intervention response
    with verified emergency helplines.
    """
    resources_text = "\n".join([
        f"- **{r['name']}**: {r['contact']} ({r['description']})"
        for r in VERIFIED_CRISIS_RESOURCES
    ])
    
    message = (
        "It sounds like you are going through a profoundly difficult time right now, "
        "and I want you to know that your life and well-being matter immensely.\n\n"
        "Because I am an AI assistant and not a human doctor or crisis counselor, "
        "I cannot provide emergency clinical support. Please reach out to someone who can help keep you safe:\n\n"
        f"{resources_text}\n\n"
        "Please connect with one of these verified resources, reach out to your university health center, "
        "or contact a trusted person nearby right away. You do not have to carry this alone."
    )
    
    return {
        "is_crisis": True,
        "content": message,
        "resources": VERIFIED_CRISIS_RESOURCES,
        "disclaimer": "MindBridge AI is an educational and supportive tool, not an emergency intervention service."
    }

def evaluate_phq9_safety(q9_score: int) -> Dict[str, Any]:
    """
    Evaluates Question 9 of the PHQ-9:
    'Thoughts that you would be better off dead, or of hurting yourself in some way'
    """
    if q9_score > 0:
        return {
            "flagged": True,
            "message": (
                "You indicated experiencing thoughts of being better off dead or hurting yourself. "
                "Your safety is paramount. We strongly recommend speaking with a campus counselor, "
                "mental health professional, or calling the Tele-MANAS helpline (14416) or 988 Lifeline."
            ),
            "helplines": VERIFIED_CRISIS_RESOURCES
        }
    return {"flagged": False, "message": ""}
