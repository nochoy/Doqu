from sqlmodel import SQLModel

from .user import User

__all__ = [
    "User",
]

# Export the Base metadata for Alembic
Base = SQLModel
