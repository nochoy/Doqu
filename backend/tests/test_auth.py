import uuid
from datetime import timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Token, User, UserRead
from app.services.auth_service import create_access_token

# Assuming 'async_client' and 'session' fixtures are available from conftest.py


# Helper to register and login a user, returning the token and user_id
async def register_and_login_user(client: AsyncClient, email: str, username: str, password: str):
    register_data = {"email": email, "username": username, "password": password}
    register_response = await client.post("/api/auth/register", json=register_data)
    assert register_response.status_code == 201, f"Registration failed: {register_response.json()}"
    user_id = UserRead(**register_response.json()).id

    login_data = {"email": email, "password": password}
    login_response = await client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = Token(**login_response.json())
    return token.access_token, user_id

@pytest.mark.asyncio
async def test_register_user_success_email_password(
    async_client: AsyncClient, session: AsyncSession
):
    """
    Test successful user registration with email and password.
    """
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepassword",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    user_read = UserRead(**response.json())
    assert user_read.email == user_data["email"]
    assert user_read.username == user_data["username"]
    assert user_read.is_active is True
    assert user_read.id is not None

    # Verify user is in DB
    db_user = await session.get(User, user_read.id)
    assert db_user is not None
    assert db_user.email == user_data["email"]
    assert db_user.username == user_data["username"]
    assert db_user.password is not None
    assert db_user.google_id is None  # Ensure google_id is None for password user


@pytest.mark.asyncio
async def test_register_user_success_google_id(async_client: AsyncClient, session: AsyncSession):
    """
    Test successful user registration with Google ID (no password).
    """
    user_data = {
        "email": "google@example.com",
        "username": "googleuser",
        "google_id": "some_google_id_123",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    user_read = UserRead(**response.json())
    assert user_read.email == user_data["email"]
    assert user_read.username == user_data["username"]
    assert user_read.is_active is True
    assert user_read.id is not None

    # Verify user is in DB
    db_user = await session.get(User, user_read.id)
    assert db_user is not None
    assert db_user.email == user_data["email"]
    assert db_user.username == user_data["username"]
    assert db_user.password is None  # Ensure password is None for Google user
    assert db_user.google_id == user_data["google_id"]


@pytest.mark.asyncio
async def test_register_user_duplicate_email(async_client: AsyncClient, session: AsyncSession):
    """
    Test registration with an already existing email.
    """
    # First, register a user
    user_data = {
        "email": "duplicate@example.com",
        "username": "uniqueuser",
        "password": "securepassword",
    }
    await async_client.post("/api/auth/register", json=user_data)

    # Try to register again with the same email
    duplicate_user_data = {
        "email": "duplicate@example.com",
        "username": "anotheruser",
        "password": "anotherpassword",
    }
    response = await async_client.post("/api/auth/register", json=duplicate_user_data)
    assert response.status_code == 409
    assert "Email already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_user_no_auth_method(async_client: AsyncClient):
    """
    Test registration with neither password nor google_id.
    """
    user_data = {
        "email": "noauth@example.com",
        "username": "noauthuser",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 422  # Pydantic validation error
    assert "Either password or google_id must be provided" in response.json()["detail"][0]["msg"]


@pytest.mark.asyncio
async def test_register_user_both_auth_methods(async_client: AsyncClient):
    """
    Test registration with both password and google_id.
    """
    user_data = {
        "email": "bothauth@example.com",
        "username": "bothauthuser",
        "password": "securepassword",
        "google_id": "some_google_id_456",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 422  # Pydantic validation error
    assert "Cannot provide both password and google_id" in response.json()["detail"][0]["msg"]


@pytest.mark.asyncio
async def test_login_user_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test successful user login.
    """
    # Register a user first
    register_data = {
        "email": "login@example.com",
        "username": "loginuser",
        "password": "loginpassword",
    }
    await async_client.post("/api/auth/register", json=register_data)

    # Attempt to log in
    login_data = {
        "email": "login@example.com",
        "password": "loginpassword",
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token = Token(**response.json())
    assert token.access_token is not None
    assert token.token_type == "bearer"


@pytest.mark.asyncio
async def test_login_user_incorrect_password(async_client: AsyncClient, session: AsyncSession):
    """
    Test login with incorrect password.
    """
    # Register a user first
    register_data = {
        "email": "wrongpass@example.com",
        "username": "wrongpassuser",
        "password": "correctpassword",
    }
    await async_client.post("/api/auth/register", json=register_data)

    # Attempt to log in with wrong password
    login_data = {
        "email": "wrongpass@example.com",
        "password": "incorrectpassword",
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_user_unregistered_email(async_client: AsyncClient, session: AsyncSession):
    """
    Test login with an unregistered email.
    """
    login_data = {
        "email": "nonexistent@example.com",
        "password": "anypassword",
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_users_me_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test accessing /api/users/me with a valid token.
    """
    # Register and login a user
    access_token, _ = await register_and_login_user(
        async_client, "me@example.com", "meuser", "mepassword"
    )

    # Access /api/users/me
    response = await async_client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.email == "me@example.com"
    assert user_read.username == "meuser"


@pytest.mark.asyncio
async def test_read_users_me_unauthorized(async_client: AsyncClient):
    """
    Test accessing /api/users/me without a token.
    """
    response = await async_client.get("/api/users/me")
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]  # FastAPI's default message


@pytest.mark.asyncio
async def test_read_users_me_inactive_user(async_client: AsyncClient, session: AsyncSession):
    """
    Test accessing /api/users/me with a token for an inactive user.
    """
    # Register a user
    register_data = {
        "email": "inactive@example.com",
        "username": "inactiveuser",
        "password": "inactivepassword",
    }
    register_response = await async_client.post("/api/auth/register", json=register_data)
    user_id = UserRead(**register_response.json()).id

    # Deactivate the user directly in the database
    db_user = await session.get(User, user_id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    # Login the user (token will be valid, but user is inactive)
    login_data = {
        "email": "inactive@example.com",
        "password": "inactivepassword",
    }
    login_response = await async_client.post("/api/auth/login", json=login_data)
    token = Token(**login_response.json())

    # Access /api/users/me
    response = await async_client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {token.access_token}"}
    )
    assert response.status_code == 403
    assert "Inactive user" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_user_invalid_email_format(async_client: AsyncClient):
    """
    Test registration with an invalid email format.
    """
    user_data = {
        "email": "invalid-email",  # Invalid email
        "username": "invalidemailuser",
        "password": "securepassword",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 422  # Pydantic validation error
    assert (
        "value is not a valid email address" in response.json()["detail"][0]["msg"]
    )  # Corrected error message


@pytest.mark.asyncio
async def test_get_data_from_token_invalid_token(async_client: AsyncClient):
    """
    Test get_data_from_token via an API call with an invalid JWT token.
    This should be caught by the get_current_user dependency.
    """
    response = await async_client.get(
        "/api/users/me", headers={"Authorization": "Bearer invalid.jwt.token"}
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_data_from_token_expired_token(async_client: AsyncClient, session: AsyncSession):
    """
    Test get_data_from_token via an API call with an expired JWT token.
    """
    # Manually create an expired token
    user_id = uuid.uuid4()
    expired_token = create_access_token(
        data={"sub": str(user_id), "email": "expired@example.com"},
        expires_delta=timedelta(minutes=-1),  # Token expired 1 minute ago
    )

    response = await async_client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_google_only_user_with_password(
    async_client: AsyncClient, session: AsyncSession
):
    """
    Test login attempt with password for a user registered only with Google ID.
    """
    # Register a user with Google ID only
    user_data = {
        "email": "googleonly@example.com",
        "username": "googleonlyuser",
        "google_id": "google_id_for_login_test",
    }
    await async_client.post("/api/auth/register", json=user_data)

    # Attempt to log in with email and password (should fail)
    login_data = {
        "email": "googleonly@example.com",
        "password": "anypassword",  # This user has no password
    }
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]
