import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.user import User, UserCreate
from app.services import auth_service


async def get_user_by_id(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    """
    Retrieve a user from the database by their unique UUID.

    Args:
        `session`: Async database session for executing queries.
        `user_id`: UUID of the user to retrieve.

    Returns:
        User: The User object if found, otherwise None.
    """
    return await session.get(User, user_id)


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    """
    Retrieve a user from the database by their email.

    Args:
        `session`: Async database session for executing queries.
        `email`: Email of the user to retrieve.

    Returns:
        User: The User object if found, otherwise None.
    """
    statement = select(User).where(User.email == email.strip().lower())
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_in: UserCreate) -> User:
    """
    Create a new user in the database.

    Args:
        `session`: Async database session for executing queries.
        `user_in`: `UserCreate` object containing the details of the user to be created.

    Returns:
        User: The newly created User object.
    """

    normalized_email = user_in.email.strip().lower()
    normalized_username = user_in.username.strip()
    normalized_password = user_in.password.strip() if user_in.password else None
    hashed_password = auth_service.hash_password(normalized_password)
    normalized_google_id = user_in.google_id.strip() if user_in.google_id else None

    new_user = User(
        email=normalized_email,
        username=normalized_username,
        password=hashed_password,
        google_id=normalized_google_id,
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user
