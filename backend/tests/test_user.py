# backend/tests/test_user.py

import uuid

import pytest
from httpx import AsyncClient, Cookies
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRead


# Helper to register a user for tests that need a pre-existing user
async def register_user(client: AsyncClient, email: str, username: str, password: str) -> UserRead:
    user_data = {"email": email, "username": username, "password": password}
    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201, f"Helper registration failed: {response.json()}"
    return UserRead(**response.json())


# Helper to login a user and return the cookies
async def login_user_and_get_cookies(client: AsyncClient, email: str, password: str) -> Cookies:
    login_data = {"email": email, "password": password}
    login_response = await client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200, f"Helper login failed: {login_response.json()}"
    assert "access_token" in login_response.cookies
    return login_response.cookies


@pytest.mark.asyncio
async def test_read_user_by_id_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by ID with a valid cookie (fetching own user details).
    """
    registered_user = await register_user(
        async_client, "idtest@example.com", "idtestuser", "idtestpassword"
    )
    auth_cookies = await login_user_and_get_cookies(
        async_client, "idtest@example.com", "idtestpassword"
    )

    response = await async_client.get(f"/api/users/{registered_user.id}", cookies=auth_cookies)
    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.id == registered_user.id
    assert user_read.email == "idtest@example.com"
    assert user_read.username == "idtestuser"


@pytest.mark.asyncio
async def test_read_user_by_id_unauthorized(async_client: AsyncClient):
    """
    Test retrieving a user by ID without a cookie.
    """
    random_uuid = uuid.uuid4()
    response = await async_client.get(f"/api/users/{random_uuid}")
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_id_inactive_user(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by ID with a cookie for an inactive user.
    """
    registered_user = await register_user(
        async_client, "inactiveid@example.com", "inactiveiduser", "password"
    )

    # Deactivate the user directly in the database
    db_user = await session.get(User, registered_user.id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    auth_cookies = await login_user_and_get_cookies(
        async_client, "inactiveid@example.com", "password"
    )

    response = await async_client.get(f"/api/users/{registered_user.id}", cookies=auth_cookies)
    assert response.status_code == 403
    assert "Inactive user" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_id_nonexistent(async_client: AsyncClient):
    """
    Test retrieving a non-existent user by ID with a valid cookie.
    """
    await register_user(async_client, "nonexistentid@example.com", "nonexistentiduser", "password")
    auth_cookies = await login_user_and_get_cookies(
        async_client, "nonexistentid@example.com", "password"
    )

    non_existent_uuid = uuid.uuid4()
    response = await async_client.get(f"/api/users/{non_existent_uuid}", cookies=auth_cookies)
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_email_success(async_client: AsyncClient):
    """
    Test retrieving a user by email with a valid cookie (fetching own user details).
    """
    await register_user(async_client, "emailtest@example.com", "emailtestuser", "emailtestpassword")
    auth_cookies = await login_user_and_get_cookies(
        async_client, "emailtest@example.com", "emailtestpassword"
    )

    response = await async_client.get(
        "/api/users/",
        params={"email": "emailtest@example.com"},
        cookies=auth_cookies,
    )
    assert response.status_code == 200
    user_read = UserRead(**response.json())
    assert user_read.email == "emailtest@example.com"
    assert user_read.username == "emailtestuser"


@pytest.mark.asyncio
async def test_read_user_by_email_unauthorized(async_client: AsyncClient):
    """
    Test retrieving a user by email without a cookie.
    """
    response = await async_client.get("/api/users/", params={"email": "any@example.com"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_email_inactive_user(async_client: AsyncClient, session: AsyncSession):
    """
    Test retrieving a user by email with a cookie for an inactive user.
    """
    registered_user = await register_user(
        async_client, "inactiveemail@example.com", "inactiveemailuser", "password"
    )

    # Deactivate the user directly in the database
    db_user = await session.get(User, registered_user.id)
    db_user.is_active = False
    session.add(db_user)
    await session.commit()

    auth_cookies = await login_user_and_get_cookies(
        async_client, "inactiveemail@example.com", "password"
    )

    response = await async_client.get(
        "/api/users/",
        params={"email": "inactiveemail@example.com"},
        cookies=auth_cookies,
    )
    assert response.status_code == 403
    assert "Inactive user" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_email_nonexistent(async_client: AsyncClient):
    """
    Test retrieving a non-existent user by email with a valid cookie.
    """
    await register_user(
        async_client, "nonexistentemail2@example.com", "nonexistentemailuser2", "password"
    )
    auth_cookies = await login_user_and_get_cookies(
        async_client, "nonexistentemail2@example.com", "password"
    )

    response = await async_client.get(
        "/api/users/",
        params={"email": "anothernonexistent@example.com"},
        cookies=auth_cookies,
    )
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_read_user_by_id_invalid_uuid_format(async_client: AsyncClient):
    """
    Test retrieving a user by ID with an invalid UUID format.
    """
    await register_user(async_client, "validuser@example.com", "validuser", "password")
    auth_cookies = await login_user_and_get_cookies(
        async_client, "validuser@example.com", "password"
    )

    response = await async_client.get(
        "/api/users/invalid-uuid-format",  # Invalid UUID
        cookies=auth_cookies,
    )
    assert response.status_code == 422  # FastAPI path parameter validation error
    assert "Input should be a valid UUID" in response.json()["detail"][0]["msg"]


@pytest.mark.asyncio
async def test_read_user_by_email_invalid_email_format(async_client: AsyncClient):
    """
    Test retrieving a user by email with an invalid email format.
    """
    await register_user(async_client, "validuser2@example.com", "validuser2", "password")
    auth_cookies = await login_user_and_get_cookies(
        async_client, "validuser2@example.com", "password"
    )

    response = await async_client.get(
        "/api/users/",
        params={"email": "invalid-email"},  # Invalid email
        cookies=auth_cookies,
    )
    assert response.status_code == 422  # FastAPI query parameter validation error
    assert "value is not a valid email address" in response.json()["detail"][0]["msg"]


@pytest.mark.asyncio
async def test_read_user_by_email_missing_email_query_param(async_client: AsyncClient):
    """
    Test retrieving a user by email without providing the email query parameter.
    """
    await register_user(async_client, "validuser3@example.com", "validuser3", "password")
    auth_cookies = await login_user_and_get_cookies(
        async_client, "validuser3@example.com", "password"
    )

    response = await async_client.get("/api/users/", cookies=auth_cookies)
    assert response.status_code == 422  # FastAPI query parameter validation error
    assert "Field required" in response.json()["detail"][0]["msg"]
