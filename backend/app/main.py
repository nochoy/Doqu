from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
app.include_router(auth.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Welcome to Doqu API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    if await check_db_connection():
        return {"status": "ok", "database_connection": "successful"}
    else:
        raise HTTPException(status_code=503, detail="Database connection failed")
