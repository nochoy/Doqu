from datetime import datetime, timezone
from typing import List, Optional

from pydantic import Field as PydanticField
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel

from .question import QuestionRead

# SQLModel Table


class Quiz(SQLModel, table=True):
    """Represents a quiz in the database."""

    id: Optional[int] = Field(default=None, primary_key=True)

    # TODO: Implement Field(foreign_key="user.id") for when User table is created (incl imports)
    owner_id: str = Field()

    title: str = Field(max_length=50)
    description: Optional[str] = Field(default=None, max_length=250, nullable=True)
    category: Optional[str] = Field(default=None, index=True, nullable=True)
    difficulty: Optional[int] = Field(default=None, ge=1, le=5, nullable=True)
    is_public: bool = Field(default=True)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )

    # TODO: Implement questions: List["Question"] = Relationship(back_populates="quiz")
    # when Question table is created (incl imports)


# Request Models


class QuizBase(SQLModel):
    """Common quiz fields to inherit from"""

    title: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=250)
    category: Optional[str] = None
    difficulty: Optional[int] = Field(default=None, ge=1, le=5)
    is_public: Optional[bool] = None


# creating a quiz (what the user sends to the API)
class QuizCreate(QuizBase):
    title: str = Field(max_length=50)


# updating a quiz (all fields are optional)
class QuizUpdate(QuizBase):
    pass


# reading a quiz (what the API sends back to the user)
# inherits from Create schema and adds fields the DB generates
class QuizRead(QuizCreate):
    id: int
    owner_id: str
    created_at: datetime


# reading a quiz with all of its questions
class QuizReadWithQuestions(QuizRead):
    questions: List["QuestionRead"] = PydanticField(default_factory=list)
