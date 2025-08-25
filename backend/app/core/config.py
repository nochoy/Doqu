from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuration settings for the application from environment variables.

    Includes configurations for the database, security, Google OAuth, CORS, and AI/ML services.

    Attributes:
        `DATABASE_URL` (str): The URL for the database connection.
        `POSTGRES_USER` (Optional[str]): The PostgreSQL username.
        `POSTGRES_PASSWORD` (Optional[str]): The PostgreSQL password.
        `POSTGRES_DB` (Optional[str]): The PostgreSQL database name.
        `SECRET_KEY` (str): The secret key for security purposes.
        `ALGORITHM` (str): The algorithm used for security, default is "HS256".
        `ACCESS_TOKEN_EXPIRE_DAYS` (int): The number of days before an access token expires, default is 30 days.
        `GOOGLE_CLIENT_ID` (Optional[str]): The Google OAuth client ID.
        `GOOGLE_CLIENT_SECRET` (Optional[str]): The Google OAuth client secret.
        `CORS_ORIGINS` (list[str]): A list of allowed CORS origins.
        `GOOGLE_API_KEY` (Optional[str]): The Google API key for AI/ML services.
        `model_config` (dict): Configuration for the Pydantic model, including the environment file and extra settings.
    """
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
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # AI/ML
    GOOGLE_API_KEY: Optional[str] = None

    model_config = {"env_file": ".env", "extra": "allow"}


settings = Settings()  # type: ignore[call-arg]
