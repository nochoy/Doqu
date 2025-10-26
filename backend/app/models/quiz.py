import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from pydantic import field_validator
from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel, Relationship

from .question import Question, QuestionRead

# --- SQLModel Table --- #


class Quiz(SQLModel, table=True):
    """Represents a quiz in the database."""

    __tablename__ = "quizzes"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True, nullable=False)

    owner_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)

    title: str = Field(min_length=1, max_length=50, nullable=False)
    description: Optional[str] = Field(default=None, max_length=250, nullable=True)
    category: Optional[str] = Field(default=None, max_length=50, index=True, nullable=True)
    difficulty: Optional[int] = Field(default=None, ge=1, le=5, nullable=True)
    is_public: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=func.now()),
        default_factory=lambda: datetime.now(timezone.utc),
    )

    questions: List["Question"] = Relationship(
        back_populates="quiz", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# --- Request Models --- #


class QuizBase(SQLModel):
    """Base model for quiz data, all optional fields"""

    title: Optional[str] = Field(default=None, min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, max_length=250)
    category: Optional[str] = Field(default=None, max_length=50)
    difficulty: Optional[int] = Field(default=None, ge=1, le=5)
    is_public: Optional[bool] = None

    @field_validator("title", mode="before")
    @classmethod
    def normalize_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("Title must not be empty or blank")
        return stripped_value

    @field_validator("description", "category", mode="before")
    @classmethod
    def normalize_optional_str(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped_value = value.strip()
        return stripped_value or None


class QuizCreate(QuizBase):
    """Model for creating new quiz, requires title"""

    title: str = Field(min_length=1, max_length=50)
    is_public: bool = Field(default=True)


class QuizUpdate(QuizBase):
    """Model for updating a quiz, all optional fields"""

    pass


class QuizRead(QuizBase):
    """Model for reading quiz data"""

    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    title: str
    is_public: bool


class QuizReadWithQuestions(QuizRead):
    """Model for reading all questions in a quiz"""

    questions: list[QuestionRead] = Field(default_factory=list)


# Resolve forward refs at runtime for Pydantic schema generation
if not TYPE_CHECKING:
    QuizReadWithQuestions.model_rebuild()
