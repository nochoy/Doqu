from sqlmodel import SQLModel

from .quiz import Quiz
from .user import User

# Add tables here
__all__ = ["User", "Quiz"]

# Export the Base metadata for Alembic
Base = SQLModel
