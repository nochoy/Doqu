import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.quiz import Quiz


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "MC"
    TRUE_OR_FALSE = "TF"
    SELECT_MULTIPLE = "SM"


class Question(SQLModel, table=True):
    """
    Represents a question in the database.

    Attributes:
        id (UUID): Unique identifier for the question, automatically generated.
        quiz_id (UUID): Foreign key referencing the associated quiz.
        question_text (str): The text of the question, up to 250 characters.
        type (QuestionType): The type of question (multiple choice, true/false, select multiple).
        time_limit (int): Time limit (in seconds) to answer the question. Defaults to 30.
        explanation (str | None): Optional explanation shown after answering, up to 250 characters.
        correct_answer (Dict[str, Any]): JSON field storing the correct answer(s).
        possible_answers (Dict[str, Any]): JSON field storing all possible answer options.
        created_at (datetime): Timestamp when the question was created. UTC Time.

    Relationships:
        quiz (Quiz): A relationship with the Quiz model.
    """

    __tablename__ = "questions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    quiz_id: uuid.UUID = Field(foreign_key="quizzes.id")
    question_text: str = Field(min_length=1, max_length=250)
    type: QuestionType = Field(default=QuestionType.MULTIPLE_CHOICE)
    time_limit: int = Field(default=30, ge=1, le=60)
    explanation: Optional[str] = Field(default=None, max_length=250)
    correct_answer: Dict[str, Any] = Field(sa_column=Column(JSON))
    possible_answers: Dict[str, Any] = Field(sa_column=Column(JSON))
    point_value: int = Field(default=1, ge=1, le=100)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )

    quiz: "Quiz" = Relationship(back_populates="questions")


class QuestionCreate(SQLModel):
    """
    Represents data required to create a new question.

    Notes:
        Explanation is optional but must be no longer than 250 characters.
    """

    quiz_id: uuid.UUID
    question_text: str = Field(min_length=1, max_length=250)
    type: QuestionType
    time_limit: int = Field(default=30, ge=1, le=60)
    explanation: Optional[str] = Field(default=None, max_length=250)
    correct_answer: Dict[str, Any]
    possible_answers: Dict[str, Any]
    point_value: int = Field(default=1, ge=1, le=100)


class QuestionUpdate(SQLModel):
    """
    Represents fields that can be updated for an existing question.
    """

    question_text: Optional[str] = Field(default=None, min_length=1, max_length=250)
    type: Optional[QuestionType] = None
    time_limit: Optional[int] = Field(default=None, ge=1, le=60)
    explanation: Optional[str] = Field(default=None, max_length=250)
    correct_answer: Optional[Dict[str, Any]] = None
    possible_answers: Optional[Dict[str, Any]] = None
    point_value: Optional[int] = Field(default=None, ge=10, le=100)


class QuestionRead(SQLModel):
    """
    Represents data returned when reading or retrieving questions.
    """

    id: uuid.UUID
    quiz_id: uuid.UUID
    question_text: str
    type: QuestionType
    time_limit: int
    explanation: Optional[str] = None
    correct_answer: Dict[str, Any]
    possible_answers: Dict[str, Any]
    point_value: int
    created_at: datetime
