import asyncio

from sqlalchemy import text
from sqlmodel import SQLModel

from .engine import async_engine


async def init_db():
    """Initialize database with tables and extensions"""
    async with async_engine.begin() as conn:
        # Create all tables
        await conn.run_sync(SQLModel.metadata.create_all)

        # Create any necessary extensions
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))

    # Don't dispose the engine here - it's managed by the module


if __name__ == "__main__":
    asyncio.run(init_db())
