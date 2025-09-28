import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    ValidationInfo,
    field_validator,
    model_validator,
)
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


# --- SQLModel Tables --- #
class User(SQLModel, table=True):
    """
    Represents a user in the database.

    This class defines the schema for the 'users' table, including fields for user ID, email,
    username, password, Google ID, active status, and timestamps for creation and updates. It
    uses SQLModel and SQLAlchemy for ORM capabilities and Pydantic for data validation.
    """

    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    username: str = Field(nullable=False)
    password: Optional[str] = Field(default=None, nullable=True)
    google_id: Optional[str] = Field(default=None, nullable=True, unique=True, index=True)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.now()),
        default_factory=lambda: datetime.now(timezone.utc),
    )  # lambda called independently for every row insertion
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=func.now(),
            server_default=func.now(),
        ),
        default_factory=lambda: datetime.now(timezone.utc),
    )


# --- Request Models --- #


class UserBase(BaseModel):
    """
    Pydantic model for base user information.

    This model includes fields for email, username, password, and Google ID. It also
    provides validation methods to ensure that required fields are not empty or blank
    and that optional fields are properly normalized.
    """

    email: EmailStr
    username: str
    password: Optional[str] = None
    google_id: Optional[str] = None

    @field_validator("email", "username", mode="before")
    @classmethod
    def normalize_required_str(cls, value: str, info: ValidationInfo) -> str:
        if value is None:
            raise ValueError(f"{info.field_name} cannot be None")
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError(f"{info.field_name} must not be empty or blank")
        return stripped_value.lower()

    @field_validator("password", "google_id", mode="before")
    @classmethod
    def normalize_optional_str(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped_value = value.strip()
        return stripped_value or None


class UserCreateEmail(UserBase):
    """
    Pydantic model for registering a new user with email, username, and password.
    """

    password: str


class UserCreate(UserBase):
    """
    Pydantic model for registering a new user with email, name, and authentication method.

    Validates that exactly one authentication method (`password` or `google_id`) is provided.
    Raises ValueError if both or neither authentication methods are specified.
    """

    @model_validator(mode="after")
    def check_auth_method(self) -> "UserCreate":
        if not self.password and not self.google_id:
            raise ValueError("Either password or google_id must be provided")
        if self.password and self.google_id:
            raise ValueError("Cannot provide both password and google_id")
        return self


class UserRead(UserBase):
    """
    Pydantic model for reading user information.

    This model is used to represent user data that is read from the database,
    including email, username, user ID, active status, creation/update timestamp.
    """

    # Validate fields from SQLAlchemy object attributes
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    """
    Pydantic model for user login with email and password.
    """

    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    """
    Pydantic model for Google user login with `code`.
    """

    code: str


class GoogleUserData(BaseModel):
    """
    Pydantic model for storing Google user data.

    This model includes fields for the user's Google ID, email, and name.
    """

    google_id: str
    email: EmailStr
    name: str


class TokenData(BaseModel):
    """
    Pydantic model for data extracted from JWT token after being successfully decoded and validated.

    This model includes fields for user id and email.
    """

    user_id: uuid.UUID
    email: EmailStr
