import uuid

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserCreate
from app.services import auth_service

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

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
  """
  Create a new user in the database.

  Args:
      `db`: Async database session for executing queries.
      `user_in`: `UserCreate` object containing the details of the user to be created.

  Returns:
      The newly created User object.
  """
  new_user = User(
    email = user_in.email,
    username = user_in.username,
    password = auth_service.hash_password(user_in.password) if user_in.password else None,
    google_id = user_in.google_id
  )

  db.add(new_user)
  await db.commit()
  await db.refresh(new_user)
  return new_user