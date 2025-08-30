from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.questions import QuestionCreate, QuestionUpdate, QuestionRead
from app.services import questions_services
from app.utils.responses import get_responses

import uuid

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/create", response_model=QuestionRead, status_code=201)
async def create_question(
    question_in: QuestionCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    FastAPI endpoint to create a new question.

    Args:
        question_in (QuestionCreate): The data for creating a new question.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        Question: The newly created question.
    """
    question = await questions_services.create_question(session=db, question_in=question_in)
    return question


@router.get("/read/{question_id}", response_model=QuestionRead)
async def read_question(question_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
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
    question = await questions_services.get_question(session=db, question_id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/update/{question_id}", response_model=QuestionRead)
async def update_question(
    question_id: uuid.UUID, 
    question_in: QuestionUpdate, 
    db: AsyncSession = Depends(get_db)
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
    db_question = await questions_services.get_question(session=db, question_id=question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    updated_question = await questions_services.update_question(
        session=db, db_question=db_question, question_in=question_in
    )
    return updated_question


@router.delete("/remove/{question_id}", status_code=204)
async def delete_question(question_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    FastAPI endpoint to delete a question by its unique identifier.

    Args:
        question_id (uuid.UUID): Unique identifier of the question to delete.
        db (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Raises:
        HTTPException: If the specified question does not exist.
    """
    db_question = await questions_services.get_question(session=db, question_id=question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    await questions_services.remove_question(session=db, question_id=question_id)
    return None

