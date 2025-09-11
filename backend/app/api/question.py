from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.question import QuestionCreate, QuestionUpdate, QuestionRead
from app.services import question_services
from app.utils.responses import get_responses

import uuid

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/", response_model=QuestionRead, status_code=201)
async def create_question(question_in: QuestionCreate, session: AsyncSession = Depends(get_db)):
    """
    FastAPI endpoint to create a new question.

    Args:
        question_in (QuestionCreate): The data for creating a new question.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        Question: The newly created question.
    """
    question = await question_services.create_question(session=session, question_in=question_in)
    return question


@router.get("/{question_id}", response_model=QuestionRead)
async def read_question(question_id: uuid.UUID, session: AsyncSession = Depends(get_db)):
    """
    FastAPI endpoint to retrieve a question by its unique identifier.

    Args:
        question_id (uuid.UUID): Unique identifier of the question.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        QuestionRead: The retrieved question.

    Raises:
        HTTPException: If the specified question does not exist.
    """
    question = await question_services.get_question(session=session, question_id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/{question_id}", response_model=QuestionRead)
async def update_question(
    question_id: uuid.UUID, question_in: QuestionUpdate, session: AsyncSession = Depends(get_db)
):
    """
    FastAPI endpoint to update an existing question.

    Args:
        question_id (uuid.UUID): Unique identifier of the question to update.
        question_in (QuestionUpdate): Data for updating the question.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        QuestionRead: The updated question.

    Raises:
        HTTPException: If the specified question does not exist.
    """
    db_question = await question_services.get_question(session=session, question_id=question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    updated_question = await question_services.update_question(
        session=session, db_question=db_question, question_in=question_in
    )
    return updated_question


@router.delete("/{question_id}", status_code=204)
async def delete_question(question_id: uuid.UUID, session: AsyncSession = Depends(get_db)):
    """
    FastAPI endpoint to delete a question by its unique identifier.

    Args:
        question_id (uuid.UUID): Unique identifier of the question to delete.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Raises:
        HTTPException: If the specified question does not exist.
    """
    db_question = await question_services.get_question(session=session, question_id=question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    await question_services.remove_question(session=session, question_id=question_id)
    return None


@router.get("/", response_model=list[QuestionRead])
async def read_all_questions(session: AsyncSession = Depends(get_db)):
    """
    FastAPI endpoint to retrieve all questions.

    Args:
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        list[QuestionRead]: A list of all questions.
    """
    questions = await question_services.get_all_questions(session=session)
    return questions
