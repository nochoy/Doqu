from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from .question import Question
from typing import List

class Quiz(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: str # Field(foreign_key="user.id") for later when User table is created
    title: str
    description: str
    category: str = Field(index=True)
    difficulty: int
    is_public: bool = Field(default=True)
    # questions: List["Question"] = Relationship(back_populates="quiz")
    created_at: datetime = Field(default_factory=datetime.now)
    