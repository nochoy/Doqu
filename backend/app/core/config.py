from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]

    # AI/ML
    GOOGLE_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
