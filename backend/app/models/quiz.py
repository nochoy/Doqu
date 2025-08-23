from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
# from .question import Question
# from typing import List
# When question table is created, reimplement (import Relationship from sqlmodel)

class Quiz(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: str # Field(foreign_key="user.id") for later when User table is created
    title: str
    description: str
    category: str = Field(index=True)
    difficulty: int = Field(ge=1, le=5)
    is_public: bool = Field(default=True)
    # questions: List["Question"] = Relationship(back_populates="quiz")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    