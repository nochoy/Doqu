import uuid

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
  """
  Retrieve a user from the database by their unique UUID.

  Args:
      `db`: Async database session for executing queries.
      `user_id`: UUID of the user to retrieve.

  Returns:
      User object if found, None otherwise.
  """
  return await db.get(User, user_id)

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
  """
  Retrieve a user from the database by their email.

  Args:
      `db`: Async database session for executing queries.
      `email`: Email of the user to retrieve.

  Returns:
      The User object if found, otherwise None.
  """
  statement = select(User).where(User.email == email)
  result = await db.exec(statement)
  return result.first()