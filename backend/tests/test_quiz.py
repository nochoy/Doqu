# ruff: S101, S106
import pytest
from httpx import AsyncClient
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.main import app
from app.models.quiz import QuizCreate, QuizUpdate
from app.models.user import User, UserCreate
from app.services import quiz_service, user_service
# Added import for custom service exceptions
from app.services.quiz_service import QuizNotFoundException, QuizPermissionException

# --- Helper Functions to Replace Fixtures ---


async def create_test_user(session: AsyncSession) -> User:
    """Creates a user in the database for testing purposes."""
    user_create = UserCreate(
        email="test@example.com",
        username="testuser",
        password="password123",
    )
    return await user_service.create_user(session, user_create)


async def get_authenticated_client(
    async_client: AsyncClient, session: AsyncSession
) -> AsyncClient:
    """Creates a user and returns an authenticated client."""
    test_user = await create_test_user(session)
    app.dependency_overrides[get_current_active_user] = lambda: test_user
    return async_client


# --- Authentication Tests ---


@pytest.mark.asyncio
async def test_create_quiz_unauthorized(async_client: AsyncClient):
    """Tests that creating a quiz without authentication fails with a 401 error."""
    response = await async_client.post("/api/quizzes/", json={"title": "Test Quiz"})
    assert response.status_code == 401



# --- CRUD Tests ---


@pytest.mark.asyncio
async def test_create_quiz_success(async_client: AsyncClient, session: AsyncSession):
    """Tests successful creation of a quiz with an authenticated user."""
    authenticated_client = await get_authenticated_client(async_client, session)
    response = await authenticated_client.post(
        "/api/quizzes/", json={"title": "My Awesome Quiz"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Awesome Quiz"


@pytest.mark.asyncio
async def test_read_quizzes_success(async_client: AsyncClient, session: AsyncSession):
    """Tests successfully retrieving a list of quizzes."""
    authenticated_client = await get_authenticated_client(async_client, session)
    await authenticated_client.post("/api/quizzes/", json={"title": "Quiz 1"})
    await authenticated_client.post("/api/quizzes/", json={"title": "Quiz 2"})

    response = await authenticated_client.get("/api/quizzes/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["title"] == "Quiz 1"


@pytest.mark.asyncio
async def test_read_quiz(async_client: AsyncClient, session: AsyncSession):
    """Tests retrieving a single, existing quiz."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post(
        "/api/quizzes/", json={"title": "Specific"}
    )
    quiz_id = create_response.json()["id"]

    response = await authenticated_client.get(f"/api/quizzes/{quiz_id}")
    assert response.status_code == 200
    assert response.json()["id"] == quiz_id


@pytest.mark.asyncio
async def test_update_quiz_success(async_client: AsyncClient, session: AsyncSession):
    """Tests successfully updating a quiz as its owner."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post(
        "/api/quizzes/", json={"title": "Original"}
    )
    quiz_id = create_response.json()["id"]

    response = await authenticated_client.patch(
        f"/api/quizzes/{quiz_id}", json={"title": "Updated"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated"


@pytest.mark.asyncio
async def test_update_quiz_with_no_data(async_client: AsyncClient, session: AsyncSession):
    """Tests that updating a quiz with an empty payload does not change the quiz."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post(
        "/api/quizzes/", json={"title": "Original Title"}
    )
    quiz_id = create_response.json()["id"]

    response = await authenticated_client.patch(f"/api/quizzes/{quiz_id}", json={})
    assert response.status_code == 200
    assert response.json()["title"] == "Original Title"


@pytest.mark.asyncio
async def test_delete_quiz_success(async_client: AsyncClient, session: AsyncSession):
    """Tests successfully deleting a quiz as its owner."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post(
        "/api/quizzes/", json={"title": "To Be Deleted"}
    )
    quiz_id = create_response.json()["id"]

    delete_response = await authenticated_client.delete(f"/api/quizzes/{quiz_id}")
    assert delete_response.status_code == 204

    get_response = await authenticated_client.get(f"/api/quizzes/{quiz_id}")
    assert get_response.status_code == 404


# --- Permission and Edge Case Tests ---


@pytest.mark.asyncio
async def test_update_quiz_permission_denied(
    async_client: AsyncClient, session: AsyncSession
):
    """Tests that updating a quiz owned by another user returns a 403 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post("/api/quizzes/", json={"title": "Owner's Quiz"})
    quiz_id = create_response.json()["id"]

    attacker_create = UserCreate(email="attacker@example.com", username="attacker", password="pw")
    attacker = await user_service.create_user(session, attacker_create)
    app.dependency_overrides[get_current_active_user] = lambda: attacker

    response = await authenticated_client.patch(
        f"/api/quizzes/{quiz_id}", json={"title": "Hacked Title"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_quiz_permission_denied(
    async_client: AsyncClient, session: AsyncSession
):
    """Tests that deleting a quiz owned by another user returns a 403 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post("/api/quizzes/", json={"title": "Owner's Quiz"})
    quiz_id = create_response.json()["id"]

    attacker_create = UserCreate(email="attacker@example.com", username="attacker", password="pw")
    attacker = await user_service.create_user(session, attacker_create)
    app.dependency_overrides[get_current_active_user] = lambda: attacker

    response = await authenticated_client.delete(f"/api/quizzes/{quiz_id}")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_quiz_set_non_nullable_to_null(
    async_client: AsyncClient, session: AsyncSession
):
    """Tests that trying to set a non-nullable field to null fails with a 422 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    create_response = await authenticated_client.post("/api/quizzes/", json={"title": "Test Title"})
    quiz_id = create_response.json()["id"]

    response = await authenticated_client.patch(
        f"/api/quizzes/{quiz_id}", json={"title": None}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_read_quizzes_pagination_edge_cases(
    async_client: AsyncClient, session: AsyncSession
):
    """Tests pagination with out-of-bounds skip and limit values."""
    authenticated_client = await get_authenticated_client(async_client, session)
    for i in range(5):
        await authenticated_client.post("/api/quizzes/", json={"title": f"Quiz {i}"})

    response = await authenticated_client.get("/api/quizzes/?skip=-5&limit=2")
    assert response.status_code == 422

    response = await authenticated_client.get("/api/quizzes/?skip=10&limit=5")
    assert response.status_code == 200
    assert len(response.json()) == 0


# --- Service-Level DB Error Tests to Cover Rollbacks ---


@pytest.mark.asyncio
async def test_create_quiz_db_error_rolls_back(session: AsyncSession, mocker):
    """Tests that a database error during quiz creation calls session.rollback()."""
    test_user = await create_test_user(session)
    mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.commit", side_effect=SQLAlchemyError)
    mock_rollback = mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.rollback")
    quiz_in = QuizCreate(title="Will Fail")

    with pytest.raises(SQLAlchemyError):
        await quiz_service.create_quiz(session, quiz_in, test_user.id)

    mock_rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_quiz_db_error_rolls_back(session: AsyncSession, mocker):
    """Tests that a database error during quiz update calls session.rollback()."""
    test_user = await create_test_user(session)
    quiz_in = QuizCreate(title="Test Title")
    quiz = await quiz_service.create_quiz(session, quiz_in, test_user.id)

    mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.commit", side_effect=SQLAlchemyError)
    mock_rollback = mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.rollback")
    update_in = QuizUpdate(title="Will Fail Update")

    with pytest.raises(SQLAlchemyError):
        await quiz_service.update_quiz(session, quiz.id, update_in, test_user.id)

    mock_rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_quiz_db_error_rolls_back(session: AsyncSession, mocker):
    """Tests that a database error during quiz deletion calls session.rollback()."""
    test_user = await create_test_user(session)
    quiz_in = QuizCreate(title="Test Title")
    quiz = await quiz_service.create_quiz(session, quiz_in, test_user.id)

    mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.commit", side_effect=SQLAlchemyError)
    mock_rollback = mocker.patch("sqlalchemy.ext.asyncio.AsyncSession.rollback")

    with pytest.raises(SQLAlchemyError):
        await quiz_service.remove_quiz(session, quiz.id, test_user.id)

    mock_rollback.assert_awaited_once()


# --- Original Validation and Not Found Tests ---


@pytest.mark.asyncio
async def test_update_quiz_not_found(async_client: AsyncClient, session: AsyncSession):
    """Tests that updating a non-existent quiz returns a 404 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    response = await authenticated_client.patch("/api/quizzes/999", json={"title": "New Title"})
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_quiz_not_found(async_client: AsyncClient, session: AsyncSession):
    """Tests that deleting a non-existent quiz returns a 404 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    response = await authenticated_client.delete("/api/quizzes/999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_quiz_long_title(async_client: AsyncClient, session: AsyncSession):
    """Tests that creating a quiz with a title > 50 chars fails with a 422 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    long_title = "a" * 51
    response = await authenticated_client.post(
        "/api/quizzes/", json={"title": long_title}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_quiz_missing_title(async_client: AsyncClient, session: AsyncSession):
    """Tests that creating a quiz with a missing title fails with a 422 error."""
    authenticated_client = await get_authenticated_client(async_client, session)
    response = await authenticated_client.post(
        "/api/quizzes/", json={"description": "Desc"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
@pytest.mark.parametrize("title", ["", "   "])
async def test_create_quiz_blank_title(async_client: AsyncClient, session: AsyncSession, title: str):
    """Creating a quiz with empty/blank title should fail with 422."""
    authenticated_client = await get_authenticated_client(async_client, session)
    response = await authenticated_client.post("/api/quizzes/", json={"title": title})
    assert response.status_code == 422
    
    
# --- NEW: Router-Level Exception Handling Tests ---


@pytest.mark.asyncio
async def test_read_quiz_service_not_found_exception(
    async_client: AsyncClient, mocker
):
    """Tests that the router correctly handles QuizNotFoundException from the service."""
    mocker.patch(
        "app.services.quiz_service.get_quiz",
        side_effect=QuizNotFoundException("Quiz from service not found"),
    )
    # The read_quiz endpoint does not require authentication
    response = await async_client.get("/api/quizzes/1")
    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz not found"


@pytest.mark.asyncio
async def test_update_quiz_service_exceptions(
    async_client: AsyncClient, session: AsyncSession, mocker
):
    """Tests the router's handling of various exceptions from the update_quiz service."""
    authenticated_client = await get_authenticated_client(async_client, session)
    
    # Test QuizNotFoundException from service
    mocker.patch(
        "app.services.quiz_service.update_quiz",
        side_effect=QuizNotFoundException("Not Found"),
    )
    response_404 = await authenticated_client.patch("/api/quizzes/1", json={"title": "..."})
    assert response_404.status_code == 404
    assert response_404.json()["detail"] == "Quiz not found"

    # Test QuizPermissionException from service
    mocker.patch(
        "app.services.quiz_service.update_quiz",
        side_effect=QuizPermissionException("Permission Denied"),
    )
    response_403 = await authenticated_client.patch("/api/quizzes/1", json={"title": "..."})
    assert response_403.status_code == 403
    assert response_403.json()["detail"] == "Not authorized to update this quiz"
    
    # Test ValueError from service
    mocker.patch(
        "app.services.quiz_service.update_quiz",
        side_effect=ValueError("Invalid value for a field"),
    )
    response_422 = await authenticated_client.patch("/api/quizzes/1", json={"title": "..."})
    assert response_422.status_code == 422
    assert response_422.json()["detail"] == "Cannot set non-nullable fields to null"


@pytest.mark.asyncio
async def test_delete_quiz_service_exceptions(
    async_client: AsyncClient, session: AsyncSession, mocker
):
    """Tests the router's handling of exceptions from the remove_quiz service."""
    authenticated_client = await get_authenticated_client(async_client, session)

    # Test QuizNotFoundException from service
    mocker.patch(
        "app.services.quiz_service.remove_quiz",
        side_effect=QuizNotFoundException("Not Found"),
    )
    response_404 = await authenticated_client.delete("/api/quizzes/1")
    assert response_404.status_code == 404
    assert response_404.json()["detail"] == "Quiz not found"

    # Test QuizPermissionException from service
    mocker.patch(
        "app.services.quiz_service.remove_quiz",
        side_effect=QuizPermissionException("Permission Denied"),
    )
    response_403 = await authenticated_client.delete("/api/quizzes/1")
    assert response_403.status_code == 403
    assert response_403.json()["detail"] == "Not authorized to delete this quiz"