"""
Service for quiz operations.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quiz import Quiz


async def create_quiz(session: AsyncSession, quiz: Quiz) -> Quiz:
    """
    Create a new quiz in the database
    """

    new_quiz = Quiz(
        title=quiz.title,
        description=quiz.description,
        created_at=quiz.created_at,
        updated_at=quiz.updated_at,
        questions=quiz.questions,
    )
    session.add(new_quiz)
    await session.commit()
    await session.refresh(new_quiz)
    return new_quiz
