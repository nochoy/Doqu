import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
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
    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz


async def get_quiz(session: AsyncSession, quiz_id: uuid.UUID) -> Quiz:
    """
    Get a single quiz by its ID.

    Args:
        session (AsyncSession): The DB session
        quiz_id (uuid.UUID): The ID of the quiz to retrieve

    Returns:
        Quiz: Quiz object

    Raises:
        QuizNotFoundException: If quiz id not found
    """
    statement = select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
    result = await session.execute(statement)
    db_quiz = result.scalars().first()
    if not db_quiz:
        raise QuizNotFoundException("Quiz not found.")
    return db_quiz


async def get_quizzes(
    session: AsyncSession,
    owner_id: uuid.UUID | None = None,
    category: str | None = None,
    difficulty: int | None = None,
    offset: int = 0,
    limit: int = 100,
) -> List[Quiz]:
    """
    Get a list of quizzes with pagination and optional
    filtering on owner_id, category, and difficulty.

    Args:
        session(AsyncSession): The DB session
        owner_id (uuid.UUID | None): Filter by owner ID if provided
        category (str | None): Filter by category if provided
        difficulty (int | None): Filter by difficulty if provided (1-5)
        offset (int): Number of quizzes to skip for pagination
        limit (int): Max number of quizzes to return

    Returns:
        List[Quiz]: List of quiz objects
    """
    statement = select(Quiz)

    # Filters
    if owner_id is not None:
        statement = statement.where(Quiz.owner_id == owner_id)
    if category is not None:
        statement = statement.where(Quiz.category == category)
    if difficulty is not None:
        statement = statement.where(Quiz.difficulty == difficulty)

    # Pagination
    statement = statement.order_by(Quiz.id).offset(offset).limit(limit)  # type: ignore[arg-type]

    result = await session.execute(statement)
    quizzes = result.scalars().all()
    return list(quizzes)


async def get_quizzes_by_owner(session: AsyncSession, owner_id: uuid.UUID) -> List[Quiz]:
    """
    Get all quizzes owned by a specific user.

    Args:
        session (AsyncSession): The DB session
        owner_id (uuid.UUID): The ID of the owner

    Returns:
        List[Quiz]: A list of quiz objects
    """
    statement = select(Quiz).where(Quiz.owner_id == owner_id)
    result = await session.execute(statement)
    quizzes = result.scalars().all()
    return list(quizzes)


async def update_quiz(
    session: AsyncSession, quiz_id: uuid.UUID, quiz_in: QuizUpdate, user_id: uuid.UUID
) -> Quiz:
    """
    Update an existing quiz.

    Args:
        session (AsyncSession): The DB session
        quiz_id (uuid.UUID): Existing quiz id to update
        quiz_in (QuizUpdate): Pydantic model with fields to update

    Returns:
        Quiz: Updated Quiz DB object if found

    Raises:
        QuizNotFoundException: If quiz id not found
        QuizPermissionException: If user is not owner
    """
    db_quiz = await get_quiz(session=session, quiz_id=quiz_id)
    if db_quiz.owner_id != user_id:
        raise QuizPermissionException("User does not have permission to update this quiz.")

    raw_update_data = quiz_in.model_dump(exclude_unset=True)
    non_nullable_cols = {
        c.name for c in db_quiz.__class__.__table__.columns if not c.nullable  # type: ignore
    }
    invalid_nulls = [k for k, v in raw_update_data.items() if k in non_nullable_cols and v is None]
    if invalid_nulls:
        raise ValueError(f"Cannot set non-nullable fields to null: {', '.join(invalid_nulls)}")
    if raw_update_data:
        db_quiz.sqlmodel_update(raw_update_data)

    await session.commit()
    await session.refresh(db_quiz)
    return db_quiz


async def remove_quiz(session: AsyncSession, quiz_id: uuid.UUID, user_id: uuid.UUID) -> None:
    """
    Delete a quiz from the database.

    Args:
        session (AsyncSession): The DB session
        quiz_id (uuid.UUID): Quiz id to delete

    Raises:
        QuizNotFoundException: If quiz id not found
        QuizPermissionException: If user is not owner
    """
    db_quiz = await get_quiz(session=session, quiz_id=quiz_id)
    if db_quiz.owner_id != user_id:
        raise QuizPermissionException("User does not have permission to delete this quiz.")
    await session.delete(db_quiz)
    await session.commit()
    return
