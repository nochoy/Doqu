from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate

# CREATE
async def create_quiz(*, session: AsyncSession, quiz_in: QuizCreate, owner_id: str) -> Quiz:
    """
    Create a new quiz in the database.
    """
    # dictionary of the quiz data, including the owner_id
    quiz_data = quiz_in.model_dump()
    db_quiz = Quiz(**quiz_data, owner_id=owner_id)
    
    session.add(db_quiz)
    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz

# READ ONE
async def get_quiz(*, session: AsyncSession, quiz_id: int) -> Quiz | None:
    """
    Get a single quiz by its ID.
    """
    return await session.get(Quiz, quiz_id)

# READ MANY
async def get_quizzes(*, session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Quiz]:
    """
    Get a list of quizzes with pagination.
    """
    statement = select(Quiz).offset(skip).limit(limit)
    result = await session.execute(statement)
    quizzes = result.scalars().all()
    return quizzes

# UPDATE
async def update_quiz(*, session: AsyncSession, db_quiz: Quiz, quiz_in: QuizUpdate) -> Quiz:
    """
    Update an existing quiz.
    """
    # data from the input schema excluding any unset
    update_data = quiz_in.model_dump(exclude_unset=True)
    
    # update object with new data
    db_quiz.sqlmodel_update(update_data)
    
    session.add(db_quiz)
    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz

# DELETE
async def remove_quiz(*, session: AsyncSession, db_quiz: Quiz) -> None:
    """
    Delete a quiz from the database.
    """
    await session.delete(db_quiz)
    await session.commit()