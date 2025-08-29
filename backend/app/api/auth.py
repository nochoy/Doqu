from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.user import Token, UserCreate, UserLogin, UserRead
from app.services import auth_service, user_service
from app.utils.responses import get_responses

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses=get_responses(409),
)
async def register(
    user_create: UserCreate,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> UserRead:
    """
    Register a new user.

    This endpoint allows for the registration of a new user. It checks if the email
    provided is already registered and raises an HTTP 409 error if it is. If the email
    is not registered, it creates a new user.

    Args:
        `user_create` (`UserCreate`): User creation data (email and password)
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        UserRead: The newly created user.
    """

    try:
        user = await user_service.create_user(session, user_create)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    return UserRead.model_validate(user)


@router.post("/login", response_model=Token, responses=get_responses(401))
async def login(
    form_data: UserLogin,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    """
    Authenticate a user and return a JWT access token.

    This endpoint allows a user to log in by providing their email and password.
    If the credentials are correct, an access token is generated and returned.
    If the credentials are incorrect, an HTTP 401 error is raised.

    Args:
        `form_data` (UserLogin): User login data (email and password).
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        Token: Access token and token type
    """
    user = await auth_service.authenticate_user(session, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    return Token.model_validate({"access_token": access_token, "token_type": "bearer"})
