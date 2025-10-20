from fastapi import FastAPI

from quizling.api.error_handlers import register_error_handlers
from quizling.api.router import router

app = FastAPI(
    title="Quizling API",
    description="API for managing and retrieving quiz questions generated from documents",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

register_error_handlers(app)
app.include_router(router)


@app.get("/", tags=["health"])
async def root() -> dict[str, str]:
    return {"status": "healthy", "service": "Quizling API"}


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "healthy"}
