import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import StaticPool
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.db.session import get_db
from app.main import app

# Test database URL - using SQLite in-memory for tests
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    expire_on_commit=False,
    autoflush=False,
    class_=AsyncSession,
    bind=engine,
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Create a test database engine."""
    yield engine


@pytest_asyncio.fixture(scope="function")
async def session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates a test database session, yields it, and drops tables afterwards.
    """
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create and yield the session for the test to use
    async with TestingSessionLocal() as session:
        yield session

    # Drop all tables to clean up for the next test
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture(scope="function")
def client(session: AsyncSession) -> Generator[TestClient, None, None]:
    """Create a sync test client with overridden DB dependency."""

    def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def async_client(session: AsyncSession) -> AsyncClient:  # Return type is AsyncClient
    """Create an async test client with overridden DB dependency."""

    def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_db] = override_get_db

    # Explicitly enter the async context manager and yield the client
    client = AsyncClient(app=app, base_url="http://test")
    yield client
    await client.aclose()  # Ensure client is closed

    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
    }


@pytest.fixture
def test_quiz_data():
    """Sample quiz data for testing."""
    return {
        "title": "Test Quiz",
        "description": "A test quiz for unit testing",
        "questions": [
            {
                "question_text": "What is 2+2?",
                "question_type": "multiple_choice",
                "options": ["3", "4", "5", "6"],
                "correct_answer": "4",
                "points": 10,
            },
            {
                "question_text": "Is Python a programming language?",
                "question_type": "true_false",
                "correct_answer": "true",
                "points": 5,
            },
        ],
    }
