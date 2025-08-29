from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.services import auth_service, user_service

# HTTPBearer is used to extract the token from the Authorization header
http_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    session: Annotated[AsyncSession, Depends(get_db)],
    http_credentials: Annotated[HTTPAuthorizationCredentials, Depends(http_scheme)],
) -> User:
    """
    FastAPI dependency to authenticate and retrieve the current user
    based on the provided JWT token.

    Args:
        `session`: Async database session for executing queries.
        `http_credentials`: The Bearer credentials extracted from the Authorization header.

    Returns:
        The authenticated User object.

    Raises:
        HTTPException: If the token is invalid, the user is not found, or the user is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if http_credentials is None:
        raise credentials_exception

    token = http_credentials.credentials
    if not token:
        raise credentials_exception

    token_data = auth_service.get_data_from_token(token)
    if token_data is None:
        raise credentials_exception

    user = await user_service.get_user_by_id(session, token_data.user_id)
    if user is None:
        raise credentials_exception

    return user


# Wrapper dependency for readability
async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """
    FastAPI dependency to ensure the current user is active.

    Args:
        `current_user`: The current authenticated user, retrieved using \
        the `get_current_user` dependency.

    Returns:
        The current active User object.

    Raises:
        HTTPException: If the user is not active.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    return current_user
