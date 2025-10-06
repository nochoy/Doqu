from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from google.auth.exceptions import GoogleAuthError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import GoogleLogin, UserCreate, UserCreateEmail, UserLogin, UserRead
from app.services import auth_service, user_service
from app.utils.auth import set_auth_cookie
from app.utils.responses import get_responses

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses=get_responses(409),
)
async def register(
    user_create: UserCreateEmail,
    session: Annotated[AsyncSession, Depends(get_db)],
    response: Response,
) -> UserRead:
    """
    Register a new user.

    This endpoint allows for the registration of a new user. It checks if the email
    provided is already registered and raises an HTTP 409 error if it is. If the email
    is not registered, it creates a new user.

    Args:
        `user_create` (`UserCreateEmail`): User creation data (email and password)
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        UserRead: The newly created user.

    Raises:
        HTTPException: 409 Conflict if email is already registered.
    """
    try:
        user_in = UserCreate(
            email=user_create.email,
            username=user_create.username,
            password=user_create.password,
        )

        user = await user_service.create_user(session, user_in)

        access_token = auth_service.create_access_token(
            data={"sub": str(user.id), "email": user.email},
        )

        set_auth_cookie(response, access_token)

        return UserRead.model_validate(user)

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        ) from None


@router.post("/login", response_model=UserRead, responses=get_responses(401))
async def login(
    form_data: UserLogin,
    session: Annotated[AsyncSession, Depends(get_db)],
    response: Response,
) -> UserRead:
    """
    Authenticate a user and set an HTTP-only cookie with the access token.
    This endpoint allows a user to log in by providing their email and password.
    If the credentials are correct, an access token is generated and returned.
    If the credentials are incorrect, an HTTP 401 error is raised.

    Args:
        `form_data` (UserLogin): User login data (email and password).
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        UserRead: The authenticated user's information.

    Raises:
        HTTPException: 401 Unauthorized if the credentials are invalid.
    """

    normalized_email = form_data.email.strip().lower()

    user = await auth_service.authenticate_user(session, normalized_email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email},
    )

    set_auth_cookie(response, access_token)

    return UserRead.model_validate(user)


@router.post(
    "/google",
    response_model=UserRead,
    summary="Login a Google account user",
    responses=get_responses(401, 400),
)
async def google_login(
    request: GoogleLogin,
    session: Annotated[AsyncSession, Depends(get_db)],
    response: Response,
) -> UserRead:
    """
    Authenticate a user using Google OAuth and set an HTTP-only cookie with the access token.
    This endpoint allows a user to log in using their Google account. It verifies the
    Google token, extracts user information, and links the Google account to an existing
    user or creates a new user if necessary. If the Google token is invalid, an HTTP 401
    error is raised.

    Args:
        `request` (GoogleLogin): Google login data containing the authorization code.
        `session` (AsyncSession): Async database session for executing queries.

    Returns:
        UserRead: The authenticated user's information.

    Raises:
        HTTPException: 400 Bad Request if required Google user data is missing.
        HTTPException: 401 Unauthorized if the Google token is invalid.
    """
    try:
        google_user_data = auth_service.verify_google_token(request)

        if (not google_user_data.google_id) or (not google_user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or Google ID not found in token",
            )

        user = await auth_service.link_google_to_user(session, google_user_data)

        access_token = auth_service.create_access_token(
            data={"sub": str(user.id), "email": user.email},
        )

        set_auth_cookie(response, access_token)

        return UserRead.model_validate(user)

    except (ValueError, GoogleAuthError) as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        ) from err


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    """
    Log out the user by deleting the access token cookie.

    This endpoint logs out the user by removing the access token cookie from the response.
    It effectively invalidates the user's session on the client side.

    Args:
        `response` (Response): The response object to modify.
    """
    response.delete_cookie("access_token", "/")
