import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import field_validator
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel

from .question import QuestionRead

# SQLModel Table


class Quiz(SQLModel, table=True):
    """Represents a quiz in the database."""

    id: Optional[int] = Field(default=None, primary_key=True)

    owner_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)

    title: str = Field(min_length=1, max_length=50, nullable=False)
    description: Optional[str] = Field(default=None, max_length=250, nullable=True)
    category: Optional[str] = Field(default=None, max_length=50, index=True, nullable=True)
    difficulty: Optional[int] = Field(default=None, ge=1, le=5, nullable=True)
    is_public: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )

    # TODO: Implement questions: List["Question"] = Relationship(back_populates="quiz")
    # when Question table is created (incl imports)


# Request Models


class QuizBase(SQLModel):
    """Base model for quiz data, all optional fields"""

    title: Optional[str] = Field(default=None, min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, max_length=250)
    category: Optional[str] = None
    difficulty: Optional[int] = Field(default=None, ge=1, le=5)
    is_public: Optional[bool] = None


class QuizCreate(QuizBase):
    """Model for creating new quiz, requires title"""

    title: str = Field(min_length=1, max_length=50)

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        """
        Ensure the title is not empty or just whitespace.
        """
        if not value or not value.strip():
            raise ValueError("Title must not be empty or blank")
        return value.strip()


class QuizUpdate(QuizBase):
    """Model for updating a quiz, all optional fields"""

    pass


class QuizRead(QuizCreate):
    """Model for reading quiz data"""

    id: int
    owner_id: uuid.UUID
    created_at: datetime


class QuizReadWithQuestions(QuizRead):
    """Model for reading all questions in a quiz"""

    questions: List["QuestionRead"] = Field(default_factory=list)
