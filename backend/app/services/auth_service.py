import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import TokenData, User
from app.services.user_service import get_user_by_email

# Password hashing context
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
        True if the password matches, False otherwise
    """
    return bool(password_context.verify(plaintext_password, hashed_password))


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
    except JWTError:
        return None
    return token_data


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
    user = await get_user_by_email(session, email)

    if (
        not user
        or not password
        or not user.password
        or not verify_password(password, user.password)
    ):
        return None
    return user
