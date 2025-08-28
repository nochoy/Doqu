import pytest
from httpx import AsyncClient
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.user import User, UserCreate, UserRead, Token
from app.services.auth_service import hash_password, create_access_token
from app.services.user_service import get_user_by_id, get_user_by_email # Import user_service functions
from app.core.config import settings

# Assuming 'async_client' and 'session' fixtures are available from conftest.py

# Helper to register and login a user, returning the token and user_id
# This helper is duplicated from test_auth.py for self-containment,
# but in a larger project, you might put common helpers in a separate test_utils.py
async def register_and_login_user(client: AsyncClient, email: str, username: str, password: str):
    register_data = {"email": email, "username": username, "password": password}
    register_response = await client.post("/api/auth/register", json=register_data)
    assert register_response.status_code == 201
    user_id = UserRead(**register_response.json()).id

    login_data = {"email": email, "password": password}
    login_response = await client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    token = Token(**login_response.json())
    return token.access_token, user_id, UserRead(**register_response.json()) # Also return the UserRead object

@pytest.mark.asyncio
async def test_read_user_by_id_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by ID with a valid token (fetching own user details).
    """
    access_token, user_id, _ = await register_and_login_user(async_client, "idtest@example.com", "idtestuser", "idtestpassword")

    response = await async_client.get(
        f"/api/users/{user_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.id == user_id
    assert user_read.email == "idtest@example.com"
    assert user_read.username == "idtestuser"

@pytest.mark.asyncio
async def test_read_user_by_id_unauthorized(async_client: AsyncClient):
    """
    Test retrieving a user by ID without a token.
    """
    random_uuid = uuid.uuid4() 
    response = await async_client.get(f"/api/users/{random_uuid}")
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_read_user_by_id_inactive_user(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by ID with a token for an inactive user.
    """
    access_token, user_id, _ = await register_and_login_user(async_client, "inactiveid@example.com", "inactiveiduser", "password")

    # Deactivate the user directly in the database
    db_user = await session.get(User, user_id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    response = await async_client.get(
        f"/api/users/{user_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 400
    assert "Inactive user" in response.json()["detail"]

@pytest.mark.asyncio
async def test_read_user_by_id_nonexistent(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a non-existent user by ID with a valid token.
    """
    access_token, _, _ = await register_and_login_user(async_client, "nonexistentid@example.com", "nonexistentiduser", "password")
    
    non_existent_uuid = uuid.uuid4()
    response = await async_client.get(
        f"/api/users/{non_existent_uuid}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 404 
    assert "User not found" in response.json()["detail"] 

@pytest.mark.asyncio
async def test_read_user_by_email_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by email with a valid token (fetching own user details).
    """
    access_token, _, _ = await register_and_login_user(async_client, "emailtest@example.com", "emailtestuser", "emailtestpassword")

    response = await async_client.get(
        "/api/users/",
        params={"email": "emailtest@example.com"},
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.email == "emailtest@example.com"
    assert user_read.username == "emailtestuser"

@pytest.mark.asyncio
async def test_read_user_by_email_unauthorized(async_client: AsyncClient):
    """
    Test retrieving a user by email without a token.
    """
    response = await async_client.get("/api/users/", params={"email": "any@example.com"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_read_user_by_email_inactive_user(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by email with a token for an inactive user.
    """
    access_token, user_id, _ = await register_and_login_user(async_client, "inactiveemail@example.com", "inactiveemailuser", "password")

    # Deactivate the user directly in the database
    db_user = await session.get(User, user_id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    response = await async_client.get(
        "/api/users/",
        params={"email": "inactiveemail@example.com"},
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 400
    assert "Inactive user" in response.json()["detail"]

@pytest.mark.asyncio
async def test_read_user_by_email_nonexistent(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a non-existent user by email with a valid token.
    """
    access_token, _, _ = await register_and_login_user(async_client, "nonexistentemail2@example.com", "nonexistentemailuser2", "password")

    response = await async_client.get(
        "/api/users/",
        params={"email": "anothernonexistent@example.com"},
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 404 
    assert "User not found" in response.json()["detail"]
