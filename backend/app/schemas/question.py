from sqlmodel import SQLModel

# temp basic schema
class QuestionRead(SQLModel):
    id: int
    content: str