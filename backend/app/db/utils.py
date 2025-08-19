import logging

from sqlalchemy import text

from .engine import async_engine, sync_engine

logger = logging.getLogger(__name__)


async def check_db_connection_async() -> bool:
    """
    Check if the database connection is healthy using async engine.

    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def check_db_connection_sync() -> bool:
    """
    Check if the database connection is healthy using sync engine.

    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with sync_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


# Default to async version for FastAPI
check_db_connection = check_db_connection_async
