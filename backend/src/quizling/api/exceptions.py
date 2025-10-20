from typing import Any

from fastapi import HTTPException, status


class QuizlingAPIException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: dict[str, Any] | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=self.status_code,
            detail={"message": self.message, **self.details},
        )


class DatabaseError(QuizlingAPIException):
    def __init__(self, message: str, operation: str | None = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"operation": operation} if operation else {},
        )


class ResourceNotFoundError(QuizlingAPIException):
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource_type": resource_type, "resource_id": resource_id},
        )


class InvalidObjectIdError(QuizlingAPIException):
    def __init__(self, object_id: str):
        super().__init__(
            message="Invalid ObjectId format",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"provided_id": object_id},
        )


class ValidationError(QuizlingAPIException):
    def __init__(self, message: str, field: str | None = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"field": field} if field else {},
        )
