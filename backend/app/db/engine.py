import logging

from sqlalchemy import Engine, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Async engine for FastAPI async endpoints
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_recycle=300,
)

# Sync engine for legacy/sync operations
sync_engine: Engine = create_engine(
    settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql"),
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_recycle=300,
)

logger.info("Database engines initialized successfully")
