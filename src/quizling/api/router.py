from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from quizling.api.models import ErrorResponse, PaginatedResponse, QuestionResponse
from quizling.storage.db import MongoDBClient

router = APIRouter(prefix="/questions", tags=["questions"])


def get_db() -> MongoDBClient:
    db = MongoDBClient()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "",
    response_model=PaginatedResponse,
    responses={500: {"model": ErrorResponse}},
    summary="Get all questions",
    description="Retrieve questions with optional filtering by difficulty or search text. Supports cursor-based pagination.",
)
async def get_questions(
    db: Annotated[MongoDBClient, Depends(get_db)],
    difficulty: Annotated[
        str | None, Query(description="Filter by difficulty level (easy, medium, hard)")
    ] = None,
    search: Annotated[str | None, Query(description="Search in question text")] = None,
    cursor: Annotated[
        int | None, Query(description="Pagination cursor (skip offset)", ge=0)
    ] = None,
    limit: Annotated[
        int, Query(description="Number of results per page", ge=1, le=100)
    ] = 20,
) -> PaginatedResponse:
    """
    Get all questions with optional filtering and pagination.

    - **difficulty**: Filter by difficulty level
    - **search**: Search for text in questions
    - **cursor**: Pagination cursor (number of items to skip)
    - **limit**: Maximum number of results (1-100, default 20)
    """
    try:
        skip = cursor or 0

        if difficulty and search:
            questions = db.search_questions(search)
            questions = [q for q in questions if q.difficulty.value == difficulty]
        elif difficulty:
            questions = db.get_questions_by_difficulty(difficulty)
        elif search:
            questions = db.search_questions(search)
        else:
            questions = db.get_all_questions(limit=limit + 1, skip=skip)

        if difficulty or search:
            total_results = len(questions)
            questions = questions[skip : skip + limit + 1]
        else:
            total_results = db.count_questions()

        has_more = len(questions) > limit
        if has_more:
            questions = questions[:limit]

        next_cursor = None
        if has_more:
            next_cursor = str(skip + limit)

        return PaginatedResponse(
            data=questions,
            next_cursor=next_cursor,
            has_more=has_more,
            total=total_results,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get(
    "/{question_id}",
    response_model=QuestionResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get a specific question",
    description="Retrieve a single question by its ID.",
)
async def get_question(
    question_id: str,
    db: Annotated[MongoDBClient, Depends(get_db)],
) -> QuestionResponse:
    """
    Get a specific question by ID.

    - **question_id**: MongoDB ObjectId of the question
    """
    try:
        question = db.get_question(question_id)
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found")
        return QuestionResponse(data=question)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
