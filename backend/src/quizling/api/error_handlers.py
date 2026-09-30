import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pymongo import errors as pymongo_errors

from quizling.api.exceptions import QuizlingAPIError
from quizling.storage.db import MongoDBConnectionError

logger = logging.getLogger(__name__)


async def _quizling_error_handler(
    _request: Request, exc: QuizlingAPIError
) -> JSONResponse:
    logger.warning(
        "QuizlingAPIError: %s",
        exc.message,
        extra={"status_code": exc.status_code, "details": exc.details},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, **exc.details},
    )


async def _mongodb_connection_error_handler(
    _request: Request, exc: MongoDBConnectionError
) -> JSONResponse:
    logger.error("MongoDB connection error: %s", exc, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "Database service unavailable",
            "message": "Unable to connect to database. Please try again later.",
        },
    )


async def _pymongo_error_handler(
    _request: Request, exc: pymongo_errors.PyMongoError
) -> JSONResponse:
    logger.error("PyMongo error: %s", exc, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Database operation failed",
            "message": (
                str(exc)
                if logger.level == logging.DEBUG
                else "An error occurred processing your request"
            ),
        },
    )


async def _generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unexpected error: %s", exc, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please contact support.",
        },
    )


def register_error_handlers(app: FastAPI) -> None:
    """Map Quizling, MongoDB, and unexpected exceptions to JSON error responses."""
    app.add_exception_handler(QuizlingAPIError, _quizling_error_handler)
    app.add_exception_handler(MongoDBConnectionError, _mongodb_connection_error_handler)
    app.add_exception_handler(pymongo_errors.PyMongoError, _pymongo_error_handler)
    app.add_exception_handler(Exception, _generic_exception_handler)
