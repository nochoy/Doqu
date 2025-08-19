import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.models.user import User

class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_user_success(self, client: TestClient, test_user_data: dict):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert "id" in data
        assert "hashed_password" not in data

@pytest.mark.asyncio
class TestAsyncAuthEndpoints:
    """Test authentication endpoints with async client."""
    
    async def test_async_register_user(self, async_client: AsyncClient, test_user_data: dict):
        """Test async user registration."""
        response = await async_client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]