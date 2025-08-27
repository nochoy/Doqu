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
        User object if found, None otherwise.
    """
    return await session.get(User, user_id)


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    """
    Retrieve a user from the database by their email.

    Args:
        `session`: Async database session for executing queries.
        `email`: Email of the user to retrieve.

    Returns:
        The User object if found, otherwise None.
    """
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalars().first()


async def create_user(session: AsyncSession, user_in: UserCreate) -> User:
    """
    Create a new user in the database.

    Args:
        `session`: Async database session for executing queries.
        `user_in`: `UserCreate` object containing the details of the user to be created.

    Returns:
        The newly created User object.
    """
    new_user = User(
        email=user_in.email,
        username=user_in.username,
        password=auth_service.hash_password(user_in.password) if user_in.password else None,
        google_id=user_in.google_id,
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user
