from sqlmodel import Field, SQLModel


class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)


# temp basic schema
class QuestionRead(SQLModel):
    id: int
    content: str
