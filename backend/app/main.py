import asyncpg  # type: ignore
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.api import auth
from app.core.config import settings
from app.db import check_db_connection, init_db

app = FastAPI(title="Doqu API", description="Real-time quiz platform API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")


@app.on_event("startup")
async def startup_event() -> None:
    try:
        await init_db()
    except (OperationalError, asyncpg.exceptions.ConnectionDoesNotExistError, OSError) as e:
        print(
            "\n🛑 ERROR: COULD NOT CONNECT TO THE DATABASE. Is your Postgres container running?\n"
        )
        print(f"Error details: {e}\n")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Welcome to Doqu API", "version": "1.0.0"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    if await check_db_connection():
        return {"status": "ok", "database_connection": "successful"}
    else:
        raise HTTPException(status_code=503, detail="Database connection failed")
