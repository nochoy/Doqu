from sqlalchemy.ext.asyncio import AsyncSession
from app.models.questions import Question, QuestionCreate, QuestionUpdate
from sqlmodel import select
import uuid

async def create_question(*, session: AsyncSession, question_in: QuestionCreate) -> Question:
    """
    Creates a new question in the database.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        question_in (QuestionCreate): Data for creating the new question.

    Returns:
        Question: The newly created question.
    """
    question_data = question_in.model_dump()
    db_question = Question(**question_data)

    session.add(db_question)
    await session.commit()
    await session.refresh(db_question)
    return db_question


async def get_question(*, session: AsyncSession, question_id: uuid.UUID) -> Question | None:
    """
    Retrieves a question from the database by its ID.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        question_id (uuid.UUID): The unique identifier of the question.

    Returns:
        Question or None: The retrieved question, or None if not found.
    """
    return await session.get(Question, question_id)


async def get_all_questions(*, session: AsyncSession) -> list[Question]:
    """
    Retrieves all questions from the database.

    Args:
        session (AsyncSession): The SQLAlchemy async session.

    Returns:
        list[Question]: A list of all questions.
    """
    result = await session.execute(select(Question))
    return result.scalars().all()

async def update_question(*, session: AsyncSession, db_question: Question, question_in: QuestionUpdate) -> Question:
    """
    Updates an existing question in the database.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        db_question (Question): The existing question to be updated.
        question_in (QuestionUpdate): Updated data for the question.

    Returns:
        Question: The updated question.
    """
    update_data = question_in.model_dump(exclude_unset=True)
    db_question.sqlmodel_update(update_data)

    session.add(db_question)
    await session.commit()
    await session.refresh(db_question)
    return db_question


async def remove_question(*, session: AsyncSession, question_id: uuid.UUID) -> None:
    """
    Deletes a question from the database by its ID.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        question_id (uuid.UUID): The unique identifier of the question to be deleted.

    Raises:
        HTTPException: If the specified question does not exist.
    """
    db_question = await get_question(session=session, question_id=question_id)
    if db_question:
        await session.delete(db_question)
        await session.commit()
