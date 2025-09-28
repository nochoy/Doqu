import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.quiz import QuizCreate
from app.services.quiz_service import create_quiz
from app.models.question import QuestionCreate
import uuid

pytestmark = pytest.mark.asyncio


async def test_create_question_for_quiz(
    async_client: AsyncClient, session: AsyncSession, test_user_data: dict
):
    """
    Test creating a question for a quiz.
    """
    # Create a user and a quiz first
    from app.services.user_service import create_user
    from app.models.user import UserCreate

    user_in = UserCreate(
        email=test_user_data["email"],
        username=test_user_data["username"],
        password=test_user_data["password"],
    )
    user = await create_user(session=session, user_in=user_in)

    quiz_in = QuizCreate(title="Test Quiz", description="A quiz for testing.")
    quiz = await create_quiz(session=session, quiz_in=quiz_in, owner_id=user.id)

    # Now create a question for the quiz
    question_in = QuestionCreate(
        quiz_id=quiz.id,
        question_text="What is the capital of France?",
        type="MC",
        correct_answer={"answer": "Paris"},
        possible_answers={"options": ["Paris", "London", "Berlin", "Madrid"]},
    )

    # Log in the user to get an access token
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.post(
        "/api/questions/", json=question_in.model_dump(), headers=headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["question_text"] == question_in.question_text
    assert data["quiz_id"] == quiz.id


async def test_create_question_with_invalid_time_limit(
    async_client: AsyncClient, session: AsyncSession, test_user_data: dict
):
    """
    Test creating a question with an invalid time limit.
    """
    # Create a user and a quiz first
    from app.services.user_service import create_user
    from app.models.user import UserCreate

    user_in = UserCreate(
        email=test_user_data["email"],
        username=test_user_data["username"],
        password=test_user_data["password"],
    )
    user = await create_user(session=session, user_in=user_in)

    quiz_in = QuizCreate(title="Test Quiz", description="A quiz for testing.")
    quiz = await create_quiz(session=session, quiz_in=quiz_in, owner_id=user.id)

    # Log in the user to get an access token
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to create a question with time_limit = 0
    question_in_zero = QuestionCreate(
        quiz_id=quiz.id,
        question_text="What is the capital of France?",
        type="MC",
        time_limit=0,
        correct_answer={"answer": "Paris"},
        possible_answers={"options": ["Paris", "London", "Berlin", "Madrid"]},
    )
    response = await async_client.post(
        "/api/questions/", json=question_in_zero.model_dump(), headers=headers
    )
    assert response.status_code == 422

    # Attempt to create a question with time_limit > 60
    question_in_large = QuestionCreate(
        quiz_id=quiz.id,
        question_text="What is the capital of France?",
        type="MC",
        time_limit=61,
        correct_answer={"answer": "Paris"},
        possible_answers={"options": ["Paris", "London", "Berlin", "Madrid"]},
    )
    response = await async_client.post(
        "/api/questions/", json=question_in_large.model_dump(), headers=headers
    )
    assert response.status_code == 422
