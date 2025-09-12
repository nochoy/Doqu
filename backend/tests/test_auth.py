import uuid
from datetime import timedelta
from unittest.mock import patch

import pytest
from google.auth.exceptions import GoogleAuthError
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRead
from app.services.auth_service import GoogleUserData, create_access_token


# Helper to register a user and return their ID
async def register_user(client: AsyncClient, email: str, username: str, password: str) -> uuid.UUID:
    register_data = {"email": email, "username": username, "password": password}
    register_response = await client.post("/api/auth/register", json=register_data)
    assert register_response.status_code == 201, f"Registration failed: {register_response.json()}"
    user_id = UserRead(**register_response.json()).id
    return user_id


@pytest.mark.asyncio
async def test_register_user_success_email_password(
    async_client: AsyncClient, session: AsyncSession
):
    """
    Test successful user registration with email and password.
    The response should contain user data and set an access_token cookie.
    """
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepassword",
    }
    response = await async_client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201

    # 1. Check for the cookie
    assert "access_token" in response.cookies
    assert response.cookies["access_token"] is not None

    # 2. Check the response body for user data
    user_read = UserRead(**response.json())
    assert user_read.email == user_data["email"]
    assert user_read.username == user_data["username"]

    # 3. Verify user in DB
    db_user = await session.get(User, user_read.id)
    assert db_user is not None
    assert db_user.email == user_data["email"]


@pytest.mark.asyncio
async def test_register_user_duplicate_email(async_client: AsyncClient):
    """
    Test registration with an already existing email.
    """
    user_data = {
        "email": "duplicate@example.com",
        "username": "uniqueuser",
        "password": "securepassword",
    }
    await async_client.post("/api/auth/register", json=user_data)

    duplicate_user_data = {
        "email": "duplicate@example.com",
        "username": "anotheruser",
        "password": "anotherpassword",
    }
    response = await async_client.post("/api/auth/register", json=duplicate_user_data)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_user_success(async_client: AsyncClient):
    """
    Test successful user login.
    The response should contain user data and set an access_token cookie.
    """
    await register_user(async_client, "login@example.com", "loginuser", "loginpassword")

    login_data = {"email": "login@example.com", "password": "loginpassword"}
    response = await async_client.post("/api/auth/login", json=login_data)

    assert response.status_code == 200

    # 1. Check for the cookie
    assert "access_token" in response.cookies
    assert response.cookies["access_token"] is not None

    # 2. Check the response body for user data
    user_read = UserRead(**response.json())
    assert user_read.email == login_data["email"]


@pytest.mark.asyncio
async def test_login_user_incorrect_password(async_client: AsyncClient):
    """
    Test login with incorrect password.
    """
    await register_user(async_client, "wrongpass@example.com", "wrongpassuser", "correctpassword")

    login_data = {"email": "wrongpass@example.com", "password": "incorrectpassword"}
    response = await async_client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_read_users_me_success(async_client: AsyncClient):
    """Test accessing /api/users/me with a valid cookie."""
    await register_user(async_client, "me@example.com", "meuser", "mepassword")

    login_data = {"email": "me@example.com", "password": "mepassword"}
    login_response = await async_client.post("/api/auth/login", json=login_data)
    auth_cookies = login_response.cookies

    # Use the cookie from the login response for the authenticated request
    response = await async_client.get("/api/users/me", cookies=auth_cookies)

    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.email == "me@example.com"


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
    """Test accessing /api/users/me with a cookie for an inactive user."""
    user_id = await register_user(async_client, "inactive@example.com", "inactiveuser", "password")

    # Deactivate the user directly in the database
    db_user = await session.get(User, user_id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    login_data = {"email": "inactive@example.com", "password": "password"}
    login_response = await async_client.post("/api/auth/login", json=login_data)
    auth_cookies = login_response.cookies

    response = await async_client.get("/api/users/me", cookies=auth_cookies)
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
async def test_read_users_me_invalid_cookie(async_client: AsyncClient):
    """Test accessing /api/users/me with an invalid/malformed cookie."""
    cookies = {"access_token": "invalid.jwt.token"}
    response = await async_client.get("/api/users/me", cookies=cookies)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_users_me_expired_token_cookie(async_client: AsyncClient):
    """Test accessing /api/users/me with an expired token in the cookie."""
    expired_token = create_access_token(
        data={"sub": str(uuid.uuid4()), "email": "expired@example.com"},
        expires_delta=timedelta(minutes=-1),
    )
    cookies = {"access_token": expired_token}
    response = await async_client.get("/api/users/me", cookies=cookies)
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


@pytest.mark.asyncio
async def test_logout_user(async_client: AsyncClient):
    """Test the logout endpoint, which should clear the cookie."""
    await register_user(async_client, "logout@example.com", "logoutuser", "password")

    login_data = {"email": "logout@example.com", "password": "password"}
    login_response = await async_client.post("/api/auth/login", json=login_data)
    assert "access_token" in login_response.cookies

    # Now, call logout with the same client instance
    logout_response = await async_client.post("/api/auth/logout")
    assert logout_response.status_code == 204


@pytest.mark.asyncio
async def test_google_login_success(async_client: AsyncClient):
    """Test successful Google OAuth authentication."""
    with (
        patch("app.services.auth_service.verify_google_token") as mock_verify,
        patch("app.services.auth_service.link_google_to_user") as mock_link,
    ):

        mock_google_data = GoogleUserData(
            google_id="google_123", email="test@example.com", name="Test User"
        )
        mock_verify.return_value = mock_google_data

        # The link_google_to_user function returns a full User object
        mock_user = User(
            id=uuid.uuid4(), email="test@example.com", username="Test User", google_id="google_123"
        )
        mock_link.return_value = mock_user

        google_login_data = {"code": "valid_google_code"}
        response = await async_client.post("/api/auth/google", json=google_login_data)

        assert response.status_code == 200
        assert "access_token" in response.cookies

        user_read = UserRead(**response.json())
        assert user_read.email == "test@example.com"


@pytest.mark.asyncio
async def test_google_login_auth_error(async_client: AsyncClient, session: AsyncSession):
    """
    Test Google login failure when token verification raises GoogleAuthError.
    """
    with patch("app.services.auth_service.verify_google_token") as mock_verify:
        mock_verify.side_effect = GoogleAuthError("Invalid Google token")

        google_login_data = {"code": "invalid_google_code"}
        response = await async_client.post("/api/auth/google", json=google_login_data)

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid Google token"


@pytest.mark.asyncio
async def test_google_login_missing_user_data(async_client: AsyncClient, session: AsyncSession):
    """
    Test Google login failure when required user data is missing from token.
    """
    with patch("app.services.auth_service.verify_google_token") as mock_verify:
        # Test missing google_id
        mock_google_data = GoogleUserData(google_id="", email="test@example.com", name="Test User")
        mock_verify.return_value = mock_google_data

        google_login_data = {"code": "missing_data_code"}
        response = await async_client.post("/api/auth/google", json=google_login_data)

        assert response.status_code == 400
        assert "Email or Google ID not found in token" in response.json()["detail"]
