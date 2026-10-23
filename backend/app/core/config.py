import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MindBridge AI"
    TAGLINE: str = "Your Mind Matters. Support Starts Here."
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mindbridge_jwt_secret_college_major_project_2026_secure_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database: Supports PostgreSQL or seamlessly falls back to SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mindbridge.db")
    
    # AI & Ollama
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "tinyllama")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Privacy & Safety
    MIN_AGGREGATE_GROUP_SIZE: int = 3  # Minimum threshold for student group privacy
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
