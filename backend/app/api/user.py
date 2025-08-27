from typing import Annotated
import uuid
from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User, UserRead
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
async def read_user_me(current_user: User = Depends(get_current_active_user)) -> UserRead:
    """
    Retrieve the current authenticated user's information.

    This endpoint allows the currently authenticated user to fetch their own user details.
    It uses the `get_current_active_user` dependency to ensure the user is authenticated.

    Args:
        `current_user` (User): Current authenticated active user, provided by the dependency

    Returns:
        UserRead: The authenticated user's information including id, username, email, 
        active status, and created timestamp.
    """
    return current_user

@router.get("/{user_id}", response_model=UserRead)
async def read_user_by_id(
    user_id: Annotated[uuid.UUID, Path()],
    session: Annotated[AsyncSession, get_db],
) -> UserRead:
    """
    Retrieve a user's information by their unique user ID.

    Args:
        `user_id` (uuid.UUID): Unique identifier of the user to retrieve.
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        UserRead: The requested user's information including id, username, email, 
        active status, and created timestamp.
    """
    return user_service.get_user_by_id(session, user_id)

@router.get("/", response_model=UserRead)
async def read_user_by_email(
    email: Annotated[str, Query()],
    session: Annotated[AsyncSession, get_db],
    _: User = Depends(get_current_active_user),
) -> UserRead:
    """
    Retrieve a user's information by their unique email address.

    Args:
        `email` (str): Email address of the user to retrieve.
        `session` (AsyncSession): Async database session for executing queries.
        _ (User): Current authenticated active user, provided by the dependency.

    Returns:
        UserRead object containing the user's information.
    """
    return user_service.get_user_by_email(session, email)
