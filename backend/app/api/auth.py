from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.models.user import User, UserCreate, UserLogin
from app.services import auth_service, user_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=User)
async def register(user_create: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    """
    Register a new user.

    This endpoint allows for the registration of a new user. It checks if the email
    provided is already registered and raises an HTTP 400 error if it is. If the email
    is not registered, it creates a new user.

    Args:
        `user_create` (`UserCreate`): User creation data (email and password)
        `db` (AsyncSession): Async database session for executing queries.

    Returns:
        User: The newly created user.
    """
    existing_user_email = await auth_service.get_user_by_email(db, user_create.email)
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registerd"
        )

    return await user_service.create_user(user_create)

@router.post("/login", response_model=User)
async def login(form_data: UserLogin, db: AsyncSession = Depends(get_db)) -> dict:
    """
    Authenticate a user and return a JWT access token.

    This endpoint allows a user to log in by providing their email and password.
    If the credentials are correct, an access token is generated and returned.
    If the credentials are incorrect, an HTTP 401 error is raised.

    Args:
        `form_data` (UserLogin): User login data (email and password).
        `db` (AsyncSession): Async database session for executing queries.

    Returns:
        dict: A dictionary containing the access token and token type.
    """
    user = await auth_service.authenticate_user(db, form_data.email, form_data.password)
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

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Retrieve the current authenticated user's information.

    This endpoint allows the currently authenticated user to fetch their own user details.
    It uses the `get_current_active_user` dependency to ensure the user is authenticated.

    Args:
        current_user (User): The currently authenticated user, provided by the dependency.

    Returns:
        User: The authenticated user's information.
    """
    return current_user
