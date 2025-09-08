import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

class Question(SQLModel, table=True):
    """
    Represents a question in the database.
    """

    __tablename__ = "questions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quiz_id: uuid.UUID = Field(foreign_key="quizzes.id", nullable=False)
    question_text: str = Field(nullable=False)
    question_type: str = Field(nullable=False)
    correct_answer: str = Field(nullable=False)
    points: int = Field(nullable=False)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        onupdate=datetime.now(timezone.utc),
    )

    quiz: "Quiz" = Relationship(back_populates="questions")


class Quiz(SQLModel, table=True):
    """
    Represents a quiz in the database.
    """

    __tablename__ = "quizzes"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(nullable=False)
    description: str = Field(nullable=True)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        onupdate=datetime.now(timezone.utc),
    )

    questions: List[Question] = Relationship(back_populates="quiz")
