from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.quiz import Quiz, QuizCreate, QuizUpdate


async def create_quiz(*, session: AsyncSession, quiz_in: QuizCreate, owner_id: str) -> Quiz:
    """
    Create a new quiz in the database.

    Args:
        session (AsyncSession): The DB session
        quiz_in (QuizCreate): Pydantic model with new quiz data
        owner_id (str): ID of user who owns quiz

    Returns:
        Quiz: New Quiz DB object
    """
    # dictionary of the quiz data, including the owner_id
    quiz_data = quiz_in.model_dump()
    db_quiz = Quiz(**quiz_data, owner_id=owner_id)

    session.add(db_quiz)
    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz


async def get_quiz(*, session: AsyncSession, quiz_id: int) -> Quiz | None:
    """
    Get a single quiz by its ID.

    Args:
        session (AsyncSession): The DB session
        quiz_id (int): The ID of the quiz to retrieve

    Returns:
        Optional[Quiz]: Quiz object if found, else None
    """
    return await session.get(Quiz, quiz_id)


async def get_quizzes(*, session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Quiz]:
    """
    Get a list of quizzes with pagination.

    Args:
        session(AsyncSession): The DB session
        skip (int): Number of quizzes to skip for pagination
        limit (int): Max number of quizzes to return

    Returns:
        List[Quiz]: List of quiz objects
    """
    # TODO: Add filtering based on category, difficulty, owner id, etc
    statement = select(Quiz).offset(skip).limit(limit)
    result = await session.execute(statement)
    quizzes = result.scalars().all()
    return list(quizzes)


async def update_quiz(*, session: AsyncSession, db_quiz: Quiz, quiz_in: QuizUpdate) -> Quiz:
    """
    Update an existing quiz.

    Args:
        session (AsyncSession): The DB session
        db_quiz (Quiz): Existing quiz object to update
        quiz_in (QuizUpdate): Pydantic model with fields to update

    Returns:
        Quiz: Updated Quiz DB object
    """
    # data from the input schema excluding any unset
    update_data = quiz_in.model_dump(exclude_unset=True)

    # update object with new data
    db_quiz.sqlmodel_update(update_data)

    session.add(db_quiz)
    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz


async def remove_quiz(*, session: AsyncSession, db_quiz: Quiz) -> None:
    """
    Delete a quiz from the database.

    Args:
        session (AsyncSession): The DB session
        db_quiz (Quiz): Quiz object to delete
    """
    await session.delete(db_quiz)
    await session.commit()
