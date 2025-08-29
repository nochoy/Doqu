import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


# --- SQLModel Tables --- #
class User(SQLModel, table=True):
    """
    Represents a user in the database.

    SQLModel table includes fields for user identification, authentication, and status.
    It supports both password-based and Google ID-based authentication methods.
    """

    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    username: str = Field(nullable=False)
    password: Optional[str] = Field(default=None, nullable=True)
    google_id: Optional[str] = Field(default=None, nullable=True, unique=True, index=True)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )  # lambda called independently for every row insertion


# --- Request Models --- #
class UserCreate(BaseModel):
    """
    Pydantic model for registering a new user with email, name, and authentication method.

    Validates that exactly one authentication method (`password` or `google_id`) is provided.
    Raises ValueError if both or neither authentication methods are specified.
    """

    email: EmailStr
    username: str
    password: Optional[str] = None
    google_id: Optional[str] = None

    @model_validator(mode="after")
    def check_auth_method(self) -> "UserCreate":
        if not self.password and not self.google_id:
            raise ValueError("Either password or google_id must be provided")
        if self.password and self.google_id:
            raise ValueError("Cannot provide both password and google_id")
        return self


class UserRead(BaseModel):
    """
    Pydantic model for reading user information.

    This model is used to represent user data that is read from the database,
    including email, username, user ID, active status, and creation timestamp.
    """

    # Validate fields from SQLAlchemy object attributes
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    username: str
    id: uuid.UUID
    is_active: bool
    created_at: datetime


class UserLogin(BaseModel):
    """
    Pydantic model for user login with email and password.
    """

    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    """
    Pydantic model for Google user login with `google_id_token`.
    """

    google_id_token: str


class Token(BaseModel):
    """
    Pydantic model for authenticating users.
    """

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Pydantic model for data extracted from JWT token after being successfully decoded and validated.    """

    user_id: uuid.UUID
    email: EmailStr
