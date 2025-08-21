from sqlmodel import Field, SQLModel, Relationship
from typing import List

class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    