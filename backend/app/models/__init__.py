from sqlmodel import SQLModel

from .user import User
from .quiz import Quiz

# Add tables here
__all__ = ["User", "Quiz"]

# Export the Base metadata for Alembic
Base = SQLModel
