from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, JSON, DateTime
from datetime import datetime, timezone
from sqlalchemy import Column
import uuid
from enum import Enum
from typing import Dict, Any

# if TYPE_CHECKING:
#     from app.models.quiz import Quiz

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
        created_at (datetime): Timestamp when the question was created, defaults to current UTC time.

    Relationships:
        quiz (Quiz): A relationship with the Quiz model indicating that each question belongs to one quiz.
    """
    __tablename__ = "questions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    # quiz_id: uuid.UUID = Field(foreign_key="quiz.id")
    question_text: str = Field(max_length=250)
    type: QuestionType = Field(default=QuestionType.MULTIPLE_CHOICE)
    time_limit: int = Field(default=30)
    explanation: str | None = Field(default=None, max_length=250)
    correct_answer: Dict[str, Any] = Field(sa_column=Column(JSON))
    possible_answers: Dict[str, Any] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )

class QuestionCreate(SQLModel):
    """
    Represents data required to create a new question.

    Notes:
        Explanation is optional but must be no longer than 250 characters.
    """
    # quiz_id: uuid.UUID
    question_text: str
    type: QuestionType
    time_limit: int = 30
    explanation: Optional[str] = None
    correct_answer: Dict[str, Any]
    possible_answers: Dict[str, Any]


class QuestionUpdate(SQLModel):
    """
    Represents fields that can be updated for an existing question.
    """
    # quiz_id: Optional[uuid.UUID] = None
    question_text: Optional[str] = None
    type: Optional[QuestionType] = None
    time_limit: int = 30
    explanation: Optional[str] = None
    correct_answer: Optional[dict] = None
    possible_answers: Optional[dict] = None

class QuestionRead(QuestionCreate):
    """
    Represents data returned when reading or retrieving questions.
    """
    id: uuid.UUID
    # quiz_id: uuid.UUID
