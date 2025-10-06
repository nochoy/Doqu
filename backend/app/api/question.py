import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.question import QuestionCreate, QuestionRead, QuestionUpdate
from app.models.user import User
from app.services import question_services
from app.services.question_services import QuestionNotFoundException
from app.services.quiz_service import (
    QuizNotFoundException,
    QuizPermissionException,
    get_quiz,
)
from app.utils.responses import get_responses

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
    # dependencies=[Depends(get_current_active_user)],
    # responses=get_responses([400, 401, 404]),
)


@router.post(
    "/",
    response_model=QuestionRead,
    status_code=status.HTTP_201_CREATED,
    responses=get_responses(401, 403),
)
async def create_question(
    question_in: QuestionCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> QuestionRead:
    """
    FastAPI endpoint to create a new question.

    Args:
        question_in (QuestionCreate): The data for creating a new question.
        session (AsyncSession): Database session provided by FastAPI's dependency injection system.
        current_user (User): The authenticated user.

    Returns:
        Question: The newly created question.
    """
    try:
        quiz = await get_quiz(session=session, quiz_id=question_in.quiz_id)
        if quiz.owner_id != current_user.id:
            raise QuizPermissionException("Not authorized to add a question to this quiz")
    except QuizNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except QuizPermissionException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error has occurred",
        )
    question = await question_services.create_question(session=session, question_in=question_in)
    return QuestionRead.model_validate(question)


@router.get("/{question_id}", response_model=QuestionRead, responses=(get_responses(404)))
async def read_question(
    question_id: uuid.UUID, session: AsyncSession = Depends(get_db)
) -> QuestionRead:
    """
    FastAPI endpoint to retrieve a question by its unique identifier.

    Args:
        question_id (uuid.UUID): Unique identifier of the question.
        session (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        QuestionRead: The retrieved question.

    Raises:
        HTTPException 404: If the specified question does not exist.
    """
    question = await question_services.get_question(session=session, question_id=question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return QuestionRead.model_validate(question)


@router.patch("/{question_id}", response_model=QuestionRead, responses=get_responses(401, 403, 404))
async def update_question(
    question_id: uuid.UUID,
    question_in: QuestionUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> QuestionRead:
    """
    FastAPI endpoint to update an existing question.

    Args:
        question_id (uuid.UUID): Unique identifier of the question to update.
        question_in (QuestionUpdate): Data for updating the question.
        session (AsyncSession): Database session provided by FastAPI's dependency injection system.
        current_user (User): The authenticated user.

    Returns:
        QuestionRead: The updated question.

    Raises:
        HTTPException: If the specified question does not exist or user is not authorized.
    """
    try:
        db_question = await question_services.get_question(session=session, question_id=question_id)
        if not db_question:
            raise QuestionNotFoundException("Question not found")

        quiz = await get_quiz(session=session, quiz_id=db_question.quiz_id)
        if quiz.owner_id != current_user.id:
            raise QuizPermissionException("Not authorized to update this question")

    except QuestionNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except QuizNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except QuizPermissionException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error has occurred",
        )

    updated_question = await question_services.update_question(
        session=session, db_question=db_question, question_in=question_in
    )
    return QuestionRead.model_validate(updated_question)


@router.delete("/{question_id}", status_code=204, responses=get_responses(401, 403, 404))
async def delete_question(
    question_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    FastAPI endpoint to delete a question by its unique identifier.

    Args:
        question_id (uuid.UUID): Unique identifier of the question to delete.
        session (AsyncSession): Database session provided by FastAPI's dependency injection system.
        current_user (User): The authenticated user.

    Raises:
        HTTPException: If the specified question does not exist or user is not authorized.
    """
    try:
        db_question = await question_services.get_question(session=session, question_id=question_id)
        if not db_question:
            raise QuestionNotFoundException("Question not found")

        quiz = await get_quiz(session=session, quiz_id=db_question.quiz_id)
        if quiz.owner_id != current_user.id:
            raise QuizPermissionException("Not authorized to delete this question")

        await question_services.remove_question(session=session, question_id=question_id)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except QuizNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except QuizPermissionException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error has occurred",
        )
    return None


@router.get("/quiz/{quiz_id}", response_model=list[QuestionRead])
async def read_all_questions(
    quiz_id: uuid.UUID, session: AsyncSession = Depends(get_db)
) -> list[QuestionRead]:
    """
    FastAPI endpoint to retrieve all questions for a specific quiz.

    Args:
        quiz_id (uuid.UUID): The ID of the quiz.
        session (AsyncSession): Database session provided by FastAPI's dependency injection system.

    Returns:
        list[QuestionRead]: A list of all questions for the specified quiz.
    """
    questions = await question_services.get_all_questions(session=session, quiz_id=quiz_id)
    return [QuestionRead.model_validate(question) for question in questions]
