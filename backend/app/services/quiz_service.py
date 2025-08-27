import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.quiz import Quiz, QuizCreate, QuizUpdate


class QuizNotFoundException(Exception):
    """Raised when a quiz is not found in the database."""

    pass


class QuizPermissionException(Exception):
    """Raised when a user does not have permission to perform an action."""

    pass


async def create_quiz(session: AsyncSession, quiz_in: QuizCreate, owner_id: uuid.UUID) -> Quiz:
    """
    Create a new quiz in the database.

    Args:
        session (AsyncSession): The DB session
        quiz_in (QuizCreate): Pydantic model with new quiz data
        owner_id (uuid.UUID): ID of user who owns quiz

    Returns:
        Quiz: New Quiz DB object
    """
    # dictionary of the quiz data, including the owner_id
    quiz_data = quiz_in.model_dump(exclude_unset=True, exclude_none=True)
    db_quiz = Quiz(**quiz_data, owner_id=owner_id)

    session.add(db_quiz)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(db_quiz)
    return db_quiz


async def get_quiz(session: AsyncSession, quiz_id: int) -> Quiz:
    """
    Get a single quiz by its ID.

    Args:
        session (AsyncSession): The DB session
        quiz_id (int): The ID of the quiz to retrieve

    Returns:
        Optional[Quiz]: Quiz object

    Raises:
        QuizNotFoundException: If quiz id not found
    """
    db_quiz = await session.get(Quiz, quiz_id)
    if not db_quiz:
        raise QuizNotFoundException("Quiz not found.")
    return db_quiz


async def get_quizzes(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Quiz]:
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
    max_limit = 100
    safe_limit = max(0, min(limit, max_limit))
    safe_skip = max(0, skip)
    statement = select(Quiz).order_by(Quiz.id).offset(safe_skip).limit(safe_limit)  # type: ignore
    result = await session.execute(statement)
    quizzes = result.scalars().all()
    return quizzes  # type: ignore


async def update_quiz(
    session: AsyncSession, quiz_id: int, quiz_in: QuizUpdate, user_id: uuid.UUID
) -> Quiz:
    """
    Update an existing quiz.

    Args:
        session (AsyncSession): The DB session
        quiz_id (int): Existing quiz id to update
        quiz_in (QuizUpdate): Pydantic model with fields to update

    Returns:
        Optional[Quiz]: Updated Quiz DB object if found, else None

    Raises:
        QuizNotFoundException: If quiz id not found
        QuizPermissionException: If user is not owner
    """
    db_quiz = await get_quiz(session=session, quiz_id=quiz_id)
    if db_quiz.owner_id != user_id:
        raise QuizPermissionException("User does not have permission to update this quiz.")

    update_data = quiz_in.model_dump(exclude_unset=True, exclude_none=True)
    non_nullable_cols = {
        c.name for c in db_quiz.__class__.__table__.columns if not c.nullable  # type: ignore
    }
    invalid_nulls = [k for k, v in update_data.items() if v is None and k in non_nullable_cols]
    if invalid_nulls:
        raise ValueError(f"Cannot set non-nullable fields to null: {', '.join(invalid_nulls)}")
    if update_data:
        db_quiz.sqlmodel_update(update_data)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(db_quiz)
    return db_quiz


async def remove_quiz(session: AsyncSession, quiz_id: int, user_id: uuid.UUID) -> None:
    """
    Delete a quiz from the database.

    Args:
        session (AsyncSession): The DB session
        quiz_id (int): Quiz id to delete

    Raises:
        QuizNotFoundException: If quiz id not found
        QuizPermissionException: If user is not owner
    """
    db_quiz = await get_quiz(session=session, quiz_id=quiz_id)
    if not db_quiz:
        raise QuizNotFoundException("Quiz not found.")
    if db_quiz.owner_id != user_id:
        raise QuizPermissionException("User does not have permission to delete this quiz.")
    try:
        await session.delete(db_quiz)
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    return
