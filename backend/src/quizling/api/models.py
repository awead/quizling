from pydantic import BaseModel, Field

from quizling.base.models import MultipleChoiceQuestion


class PaginatedResponse(BaseModel):
    data: list[MultipleChoiceQuestion] = Field(description="List of questions")
    next_cursor: str | None = Field(
        default=None, description="Cursor for the next page of results"
    )
    has_more: bool = Field(
        default=False, description="Whether there are more results available"
    )
    total: int | None = Field(default=None, description="Total number of questions")


class QuestionResponse(BaseModel):
    data: MultipleChoiceQuestion = Field(description="The question")


class ErrorResponse(BaseModel):
    detail: str = Field(description="Error message")
