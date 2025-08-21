import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.main import app
from app.db.session import get_db

# Use the async-compatible SQLite driver
DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False)

async def get_session_override():
    async with AsyncSession(engine) as session:
        yield session

app.dependency_overrides[get_db] = get_session_override

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

# --- Your Async Tests ---

@pytest.mark.asyncio
async def test_create_quiz(client: AsyncClient):
    response = await client.post(
        "/quiz/",
        json={"title": "Test Quiz", "description": "Desc", "category": "Test", "difficulty": 3, "is_public": True}
    )
    data = response.json()
    assert response.status_code == 200
    assert data["title"] == "Test Quiz"

@pytest.mark.asyncio
async def test_read_quiz(client: AsyncClient):
    create_response = await client.post(
        "/quiz/",
        json={"title": "Specific", "description": "Desc S", "category": "Cat S", "difficulty": 2, "is_public": True}
    )
    quiz_id = create_response.json()["id"]
    
    response = await client.get(f"/quiz/{quiz_id}")
    data = response.json()
    
    assert response.status_code == 200
    assert data["id"] == quiz_id

@pytest.mark.asyncio
async def test_read_quiz_not_found(client: AsyncClient):
    response = await client.get("/quiz/999")
    assert response.status_code == 404