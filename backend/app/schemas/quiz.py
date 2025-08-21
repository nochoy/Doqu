from typing import List, Optional
from sqlmodel import SQLModel

from ..schemas.question import QuestionRead 

# creating a quiz (what the user sends to the API)
class QuizCreate(SQLModel):
    title: str
    description: str
    category: str
    difficulty: int
    is_public: bool = True

# updating a quiz (all fields are optional)
class QuizUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[int] = None
    is_public: Optional[bool] = None

# reading a quiz (what the API sends back to the user)
# inherits from Create schema and adds fields the DB generates
class QuizRead(QuizCreate):
    id: int
    owner_id: str

# reading a quiz with all of its questions
class QuizReadWithQuestions(QuizRead):
    questions: List[QuestionRead] = []