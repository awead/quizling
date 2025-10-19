import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse
from pymongo import errors as pymongo_errors

from quizling.api.exceptions import QuizlingAPIException
from quizling.storage.db import MongoDBConnectionError

logger = logging.getLogger(__name__)


async def quizling_exception_handler(
    request: Request, exc: QuizlingAPIException
) -> JSONResponse:
    logger.warning(
        f"QuizlingAPIException: {exc.message}",
        extra={"status_code": exc.status_code, "details": exc.details},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, **exc.details},
    )


async def mongodb_connection_error_handler(
    request: Request, exc: MongoDBConnectionError
) -> JSONResponse:
    logger.error(f"MongoDB connection error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "Database service unavailable",
            "message": "Unable to connect to database. Please try again later.",
        },
    )


async def pymongo_error_handler(
    request: Request, exc: pymongo_errors.PyMongoError
) -> JSONResponse:
    logger.error(f"PyMongo error: {str(exc)}", exc_info=True)
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


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please contact support.",
        },
    )


def register_error_handlers(app) -> None:
    app.add_exception_handler(QuizlingAPIException, quizling_exception_handler)
    app.add_exception_handler(MongoDBConnectionError, mongodb_connection_error_handler)
    app.add_exception_handler(pymongo_errors.PyMongoError, pymongo_error_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
