import uuid
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.quiz import QuizCreate, QuizRead, QuizUpdate
from app.services import quiz_service
from app.services.quiz_service import QuizNotFoundException, QuizPermissionException

router = APIRouter()


async def get_current_user_id() -> uuid.UUID:
    # In a real app, this would decode a JWT token and return the user's ID.
    return uuid.UUID("00000000-0000-0000-0000-000000000000")


# TODO: Move checking logic to quiz service
@router.post("/", response_model=QuizRead, status_code=201)
async def create_quiz(
    session: Annotated[AsyncSession, Depends(get_db)],
    quiz_in: QuizCreate,
    current_user_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
) -> QuizRead:
    """
    Creates a new quiz.

    Args:
        session (AsyncSession): The DB session injected by dependency
        quiz_in (QuizCreate): The quiz data from request body

    Returns:
        QuizRead: The publicly accessible data for the newly created quiz
    """
    # TODO: Implement ID tied to User table

    created_quiz = await quiz_service.create_quiz(
        session=session, quiz_in=quiz_in, owner_id=current_user_id
    )
    return QuizRead.model_validate(created_quiz)


@router.get("/", response_model=List[QuizRead])
async def read_quizzes(
    session: Annotated[AsyncSession, Depends(get_db)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> List[QuizRead]:
    """
    Get a list of quizzes with pagination.

    Args:
        session (AsyncSession): The DB session injected by dependency
        skip (int): Number of quizzes to skip for pagination
        limit (int): Maximum number of quizzes to return

    Returns:
        List[QuizRead]: List of quiz objects
    """
    quizzes = await quiz_service.get_quizzes(session=session, skip=skip, limit=limit)
    return [QuizRead.model_validate(quiz) for quiz in quizzes]


@router.get("/{quiz_id}", response_model=QuizRead)
async def read_quiz(
    session: Annotated[AsyncSession, Depends(get_db)],
    quiz_id: Annotated[int, Path(ge=1)],
) -> QuizRead:
    """
    Get a single quiz by its ID.

    Args:
        session (AsyncSession): The DB session injected by dependency
        quiz_id (int): ID of the quiz to retrieve

    Raises:
        HTTPException: 404 error if the quiz with the given ID is not found

    Returns:
        QuizRead: Publicly accessible data for the requested quiz.
    """
    try:
        db_quiz = await quiz_service.get_quiz(session=session, quiz_id=quiz_id)
    except QuizNotFoundException:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return QuizRead.model_validate(db_quiz)


@router.patch("/{quiz_id}", response_model=QuizRead)
async def update_quiz(
    session: Annotated[AsyncSession, Depends(get_db)],
    quiz_id: Annotated[int, Path(ge=1)],
    quiz_in: QuizUpdate,
    user_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
) -> QuizRead:
    """
    Update an existing quiz.

    Args:
        session (AsyncSession): The DB session injected by dependency
        quiz_id (int): ID of the quiz to update
        quiz_in (QuizUpdate): Quiz data from request body to update

    Raises:
        HTTPException: 404 error if the quiz with the given ID is not found
        HTTPException: 403 error if user ID does not match quiz owner ID

    Returns:
        QuizRead: Publicly accessible data for the updated quiz
    """
    # TODO: check if owner once users are set up

    try:
        updated_quiz = await quiz_service.update_quiz(
            session=session, quiz_id=quiz_id, quiz_in=quiz_in, user_id=user_id
        )
    except QuizNotFoundException:
        raise HTTPException(status_code=404, detail="Quiz not found")
    except QuizPermissionException:
        raise HTTPException(status_code=403, detail="Not authorized to update this quiz")
    except ValueError:
        raise HTTPException(status_code=422, detail="Cannot set non-nullable fields to null")
    return QuizRead.model_validate(updated_quiz)


@router.delete("/{quiz_id}", status_code=204)
async def delete_quiz(
    session: Annotated[AsyncSession, Depends(get_db)],
    quiz_id: Annotated[int, Path(ge=1)],
    user_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
) -> None:
    """
    Delete a quiz by its ID.

    Args:
        session (AsyncSession): DB session injected by dependency
        quiz_id (int): ID of the quiz to delete

    Raises:
        HTTPException: 404 error if the quiz with the given ID is not found
        HTTPException: 403 error if user ID does not match quiz owner ID

    Returns:
        Status code 204 No Content Successful
    """
    # TODO: check ownership

    try:
        await quiz_service.remove_quiz(session=session, quiz_id=quiz_id, user_id=user_id)
    except QuizNotFoundException:
        raise HTTPException(status_code=404, detail="Quiz not found")
    except QuizPermissionException:
        raise HTTPException(status_code=403, detail="Not authorized to delete this quiz")
    return
