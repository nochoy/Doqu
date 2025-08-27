import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import StaticPool
import uuid
from app.api.quiz import get_current_user_id

from app.main import app
from app.db.session import get_db

# Use the async-compatible SQLite driver
DATABASE_URL = "sqlite+aiosqlite:///:memory:?cache=shared"
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"uri": True},
    poolclass=StaticPool,
)

OWNER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
ATTACKER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")

async def get_session_override():
    async with AsyncSession(engine) as session:
        yield session

@pytest_asyncio.fixture(autouse=True)
async def override_db_dep():
    app.dependency_overrides[get_db] = get_session_override
    yield
    app.dependency_overrides.clear()

# This fixture creates a clean database for each test
@pytest_asyncio.fixture(autouse=True)
async def setup_and_teardown():
    # Run create_all and drop_all asynchronously
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    yield
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

# This is the async test client fixture
@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

# --- Async Tests ---

@pytest.mark.asyncio
async def test_create_quiz(client: AsyncClient):
    """Tests successful creation of a quiz."""
    response = await client.post(
        "/api/quizzes/",
        json={"title": "Test Quiz", "description": "Desc", "category": "Test", "difficulty": 3, "is_public": True}
    )
    data = response.json()
    assert response.status_code == 201
    assert data["title"] == "Test Quiz"

@pytest.mark.asyncio
async def test_read_quiz(client: AsyncClient):
    """Tests retrieving a single, existing quiz."""
    create_response = await client.post(
        "/api/quizzes/",
        json={"title": "Specific", "description": "Desc S", "category": "Cat S", "difficulty": 2, "is_public": True}
    )
    quiz_id = create_response.json()["id"]
    
    response = await client.get(f"/api/quizzes/{quiz_id}")
    data = response.json()
    
    assert response.status_code == 200
    assert data["id"] == quiz_id

@pytest.mark.asyncio
async def test_read_quiz_not_found(client: AsyncClient):
    """Tests that fetching a non-existent quiz returns a 404 error."""
    response = await client.get("/api/quizzes/999")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_quiz_long_title(client: AsyncClient):
    """Tests that creating a quiz with a title > 50 chars fails with a 422 error."""
    long_title = "a" * 51
    response = await client.post(
        "/api/quizzes/",
        json={"title": long_title, "description": "Desc", "category": "Test", "difficulty": 3, "is_public": True}
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_create_quiz_missing_title(client: AsyncClient):
    """Tests that creating a quiz with a missing title fails with a 422 error."""
    response = await client.post(
        "/api/quizzes/",
        json={"description": "Desc", "category": "Test", "difficulty": 3, "is_public": True}
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_update_quiz(client: AsyncClient):
    """Tests successfully updating a quiz."""
    create_response = await client.post(
        "/api/quizzes/",
        json={"title": "Original Title", "description": "Original Desc", "category": "Cat", "difficulty": 1}
    )
    quiz_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/quizzes/{quiz_id}",
        json={"title": "Updated Title"}
    )
    data = response.json()
    assert response.status_code == 200
    assert data["title"] == "Updated Title"
    assert data["description"] == "Original Desc" # Ensure other fields are unchanged

@pytest.mark.asyncio
async def test_delete_quiz(client: AsyncClient):
    """Tests successfully deleting a quiz."""
    create_response = await client.post(
        "/api/quizzes/",
        json={"title": "To Be Deleted", "description": "Delete me", "category": "Temp", "difficulty": 1}
    )
    quiz_id = create_response.json()["id"]

    # Delete the quiz
    delete_response = await client.delete(f"/api/quizzes/{quiz_id}")
    assert delete_response.status_code == 204

    # Verify it's gone
    get_response = await client.get(f"/api/quizzes/{quiz_id}")
    assert get_response.status_code == 404

@pytest.mark.asyncio
async def test_delete_quiz_not_found(client: AsyncClient):
    """Tests that deleting a non-existent quiz returns a 404 error."""
    response = await client.delete("/api/quizzes/999")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_update_quiz_not_found(client: AsyncClient):
    """Tests that updating a non-existent quiz returns a 404 error."""
    response = await client.patch(
        "/api/quizzes/999",
        json={"title": "Won't Work"}
    )
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_read_quizzes_with_pagination(client: AsyncClient):
    """Tests the pagination (skip and limit) for retrieving quizzes."""
    # Create a few quizzes to test with
    for i in range(5):
        await client.post(
            "/api/quizzes/",
            json={"title": f"Quiz {i+1}"}
        )

    # Test limit
    response = await client.get("/api/quizzes/?limit=2")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == 2

    # Test skip
    response = await client.get("/api/quizzes/?skip=3&limit=2")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["title"] == "Quiz 4" # Titles should be Quiz 4 and Quiz 5

@pytest.mark.asyncio
async def test_update_quiz_permission_denied(client: AsyncClient):
    """Tests that updating a quiz owned by another user returns a 403 error."""
    # Override the dependency to make the creator OWNER_ID
    app.dependency_overrides[get_current_user_id] = lambda: OWNER_ID
    
    create_response = await client.post(
        "/api/quizzes/",
        json={"title": "Protected Quiz"}
    )
    assert create_response.status_code == 201
    quiz_id = create_response.json()["id"]

    # Now, override the dependency to simulate an ATTACKER making the request
    app.dependency_overrides[get_current_user_id] = lambda: ATTACKER_ID

    # Attempt to update the quiz as the attacker
    response = await client.patch(
        f"/api/quizzes/{quiz_id}",
        json={"title": "Hacked Title"}
    )

    # Assert that the permission was denied
    assert response.status_code == 403
    
    # Clean up the override
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_quiz_permission_denied(client: AsyncClient):
    """Tests that deleting a quiz owned by another user returns a 403 error."""
    # Log in as the owner to create the quiz
    app.dependency_overrides[get_current_user_id] = lambda: OWNER_ID

    create_response = await client.post(
        "/api/quizzes/",
        json={"title": "Another Protected Quiz"}
    )
    assert create_response.status_code == 201
    quiz_id = create_response.json()["id"]

    # Log in as the attacker to attempt deletion
    app.dependency_overrides[get_current_user_id] = lambda: ATTACKER_ID

    delete_response = await client.delete(f"/api/quizzes/{quiz_id}")

    # Assert that the permission was denied
    assert delete_response.status_code == 403

    # Clean up the override
    app.dependency_overrides.clear()