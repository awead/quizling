from bson.errors import InvalidId

from quizling.api.exceptions import (
    DatabaseError,
    InvalidObjectIdError,
    ResourceNotFoundError,
)
from quizling.base.models import MultipleChoiceQuestion
from quizling.storage.db import MongoDBClient


class QuestionQueryParams:
    """Value object for question query parameters."""

    def __init__(
        self,
        difficulty: str | None = None,
        search: str | None = None,
        cursor: int = 0,
        limit: int = 20,
    ):
        self.difficulty = difficulty
        self.search = search
        self.cursor = cursor
        self.limit = limit

    @property
    def has_filters(self) -> bool:
        return self.difficulty is not None or self.search is not None


class PaginationResult:
    """Value object for pagination results."""

    def __init__(
        self,
        questions: list[MultipleChoiceQuestion],
        cursor: int,
        limit: int,
        total_results: int,
    ):
        self.has_more = len(questions) > limit
        self.questions = questions[:limit] if self.has_more else questions
        self.next_cursor = str(cursor + limit) if self.has_more else None
        self.total = total_results


class QuestionService:
    """Service for handling question operations."""

    def __init__(self, db: MongoDBClient):
        self._db = db

    def get_questions(self, params: QuestionQueryParams) -> PaginationResult:
        try:
            fetch_limit = params.limit + 1
            questions = self._fetch_filtered_questions(params, fetch_limit)
            total_results = self._calculate_total(params, questions)

            return PaginationResult(
                questions=questions,
                cursor=params.cursor,
                limit=params.limit,
                total_results=total_results,
            )
        except (DatabaseError, ResourceNotFoundError, InvalidObjectIdError):
            raise  # re-raises with our custom exceptions
        except Exception as e:
            raise DatabaseError(
                f"Failed to retrieve questions: {str(e)}", operation="get_questions"
            )

    def _fetch_filtered_questions(
        self, params: QuestionQueryParams, fetch_limit: int
    ) -> list[MultipleChoiceQuestion]:
        if params.difficulty and params.search:
            return self._search_with_difficulty(params, fetch_limit)
        elif params.difficulty:
            return self._paginate_filtered_results(
                self._db.get_questions_by_difficulty(params.difficulty),
                params.cursor,
                fetch_limit,
            )
        elif params.search:
            return self._paginate_filtered_results(
                self._db.search_questions(params.search),
                params.cursor,
                fetch_limit,
            )
        else:
            return self._db.get_all_questions(limit=fetch_limit, skip=params.cursor)

    def _search_with_difficulty(
        self, params: QuestionQueryParams, fetch_limit: int
    ) -> list[MultipleChoiceQuestion]:
        questions = self._db.search_questions(params.search)
        filtered = [q for q in questions if q.difficulty.value == params.difficulty]

        return self._paginate_filtered_results(filtered, params.cursor, fetch_limit)

    @staticmethod
    def _paginate_filtered_results(
        questions: list[MultipleChoiceQuestion], cursor: int, limit: int
    ) -> list[MultipleChoiceQuestion]:
        return questions[cursor : cursor + limit]

    def _calculate_total(
        self, params: QuestionQueryParams, questions: list[MultipleChoiceQuestion]
    ) -> int:
        if params.has_filters:
            return len(questions)
        else:
            return self._db.count_questions()

    def get_question_by_id(self, question_id: str) -> MultipleChoiceQuestion:
        try:
            question = self._db.get_question(question_id)
            if question is None:
                raise ResourceNotFoundError("Question", question_id)
            return question
        except InvalidId:
            raise InvalidObjectIdError(question_id)
        except (ResourceNotFoundError, InvalidObjectIdError):
            raise  # re-raises with our custom exceptions
        except Exception as e:
            raise DatabaseError(
                f"Failed to retrieve question: {str(e)}", operation="get_question"
            )
