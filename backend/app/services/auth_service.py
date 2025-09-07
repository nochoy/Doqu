import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import MissingBackendError, UnknownHashError
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow

from app.core.config import settings
from app.models.user import GoogleLogin, GoogleUserData, TokenData, User, UserCreate
from app.services import user_service

# Password hashing context
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Must match frontend origin + configured in Google Cloud Console
redirect_uri = settings.CORS_ORIGINS[0]

# Client config for Google OAuth flow
client_config = {
    "web": {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "redirect_uris": [redirect_uri],
        "javascript_origins": [redirect_uri]
    }
}

# --- Helper Functions --- #
def hash_password(password: str) -> str:
    """
    Hashes a plaintext password using the bcrypt algorithm.

    Args:
        `password`: The plaintext password to be hashed.

    Returns:
        The hashed password as a string.
    """
    return str(password_context.hash(password))


def verify_password(plaintext_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a hashed one.

    Args:
        `plaintext_password`: The plain text password to verify
        `hashed_password`: The hashed password to compare against

    Returns:
        True if the password matches, False otherwise or errors out
    """
    try:
        return bool(password_context.verify(plaintext_password, hashed_password))
    except (UnknownHashError, MissingBackendError, ValueError):
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JSON Web Token (JWT) for user authentication.

    Args:
        `data`: A dictionary containing the data to encode in the token.
        `expires_delta`: An optional timedelta for the token's expiration time.
                       If not provided, the token will expire after a default period.

    Returns:
        A string representing the encoded JWT.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return str(encoded_jwt)


def get_data_from_token(token: str) -> TokenData | None:
    """
    Extract user information from a JSON Web Token (JWT).

    Args:
        `token`: The JWT from which to extract user information.

    Returns:
        A TokenData object containing the user's ID and email if the token is valid,
        otherwise None.
    """
    try:
        verified_payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        user_id: str | None = verified_payload.get("sub")
        email: str | None = verified_payload.get("email")

        if user_id is None or email is None:
            return None

        token_data = TokenData(user_id=uuid.UUID(user_id), email=email)
    except (JWTError, ValueError):
        return None
    return token_data

def verify_google_token(request: GoogleLogin) -> GoogleUserData:
    """
    Exchanges a Google OAuth2 authorization code for an ID token and extracts user information.

    Args:
        request: A GoogleLogin object containing the OAuth2 authorization code.

    Returns:
        A GoogleUserData object containing the Google ID, user email, and user name if the token is valid.
    """

    flow = Flow.from_client_config(
        client_config,
        scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        redirect_uri=redirect_uri
    )

    #  Exchange authorization code for credentials
    flow.fetch_token(code=request.code)
    credentials = flow.credentials

    decoded_token = id_token.verify_oauth2_token(
        credentials.id_token,
        google_requests.Request(),
        settings.GOOGLE_CLIENT_ID,
    )

    google_id = decoded_token.get("sub") or ''
    email = decoded_token.get("email") or ''
    name = decoded_token.get("name") or ''

    return GoogleUserData(google_id=google_id, email=email, name=name)


# --- Database Functions --- #
async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
    """
    Authenticate a user by their email and password.

    Args:
        `session`: Async database session for executing queries.
        `email`: Email of the user to authenticate.
        `password`: Plain text password of the user to authenticate.

    Returns:
        The authenticated User object if credentials are valid, otherwise None.
    """
    user = await user_service.get_user_by_email(session, email)

    if (
        not user
        or not password
        or not user.password
        or not verify_password(password, user.password)
    ):
        return None
    return user

async def link_google_to_user(session: AsyncSession, google_user_data: GoogleUserData) -> User:
    """
    Link a Google account to an existing user or create a new user account.

    Args:
        session: Async database session for executing queries.
        google_user_data: Dictionary containing google_id, email, and name

    Returns:
        The User object linked with the Google account.
    """

    # Check if user already created an account w/ Google -> just login
    user = await user_service.get_user_by_google_id(session, google_user_data.google_id)
    if not user:

        # Check if user made an account w/ email + password -> link w/ Google ID
        user = await user_service.get_user_by_email(session, google_user_data.email)

        if user:    # Link existing email account w/ Google ID
            user.google_id = google_user_data.google_id
            session.add(user)
            await session.commit()
            await session.refresh(user)
        else:       # First time logging in, create a new account
            username = google_user_data.name or google_user_data.email.split("@")[0]
            new_user = UserCreate(email=google_user_data.email, username=username, google_id=google_user_data.google_id)
            user = await user_service.create_user(session, new_user)
    
    return user
