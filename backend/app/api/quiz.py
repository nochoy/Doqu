from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import quiz as crud_quiz
from app.schemas import quiz as quiz_schemas

from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=quiz_schemas.QuizRead)
async def create_quiz(
    *,
    session: AsyncSession = Depends(get_db),
    quiz_in: quiz_schemas.QuizCreate
):
    """
    Create a new quiz.
    """
    owner_id = "1" # Placeholder id
    
    quiz = await crud_quiz.create_quiz(session=session, quiz_in=quiz_in, owner_id=owner_id)
    return quiz

@router.get("/", response_model=List[quiz_schemas.QuizRead])
async def read_quizzes(
    *,
    session: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve all quizzes with pagination.
    """
    quizzes = await crud_quiz.get_quizzes(session=session, skip=skip, limit=limit)
    return quizzes

@router.get("/{quiz_id}", response_model=quiz_schemas.QuizRead)
async def read_quiz(
    *,
    session: AsyncSession = Depends(get_db),
    quiz_id: int
):
    """
    Get a single quiz by its ID.
    """
    db_quiz = await crud_quiz.get_quiz(session=session, quiz_id=quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return db_quiz

@router.patch("/{quiz_id}", response_model=quiz_schemas.QuizRead)
async def update_quiz(
    *,
    session: AsyncSession = Depends(get_db),
    quiz_id: int,
    quiz_in: quiz_schemas.QuizUpdate
):
    """
    Update a quiz.
    """
    db_quiz = await crud_quiz.get_quiz(session=session, quiz_id=quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # check if owner once users are set up
    
    updated_quiz = await crud_quiz.update_quiz(session=session, db_quiz=db_quiz, quiz_in=quiz_in)
    return updated_quiz

@router.delete("/{quiz_id}", status_code=204)
async def delete_quiz(
    *,
    session: AsyncSession = Depends(get_db),
    quiz_id: int,
):
    """
    Delete a quiz by ID.
    """
    db_quiz = await crud_quiz.get_quiz(session=session, quiz_id=quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # check ownership

    await crud_quiz.remove_quiz(session=session, db_quiz=db_quiz)
    return Response(status_code=204)