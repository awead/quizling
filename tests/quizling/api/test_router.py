"""Tests for API router endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from quizling.api.app import app
from quizling.base.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
)


@pytest.fixture
def sample_questions() -> list[MultipleChoiceQuestion]:
    """Create sample questions for testing."""
    return [
        MultipleChoiceQuestion(
            question="What is 2+2?",
            options=[
                AnswerOption(label="A", text="3"),
                AnswerOption(label="B", text="4"),
                AnswerOption(label="C", text="5"),
                AnswerOption(label="D", text="6"),
            ],
            correct_answer="B",
            explanation="2+2=4",
            difficulty=DifficultyLevel.EASY,
        ),
        MultipleChoiceQuestion(
            question="What is the capital of France?",
            options=[
                AnswerOption(label="A", text="London"),
                AnswerOption(label="B", text="Paris"),
                AnswerOption(label="C", text="Berlin"),
                AnswerOption(label="D", text="Madrid"),
            ],
            correct_answer="B",
            explanation="Paris is the capital of France",
            difficulty=DifficultyLevel.MEDIUM,
        ),
        MultipleChoiceQuestion(
            question="What is the speed of light?",
            options=[
                AnswerOption(label="A", text="299,792,458 m/s"),
                AnswerOption(label="B", text="300,000,000 m/s"),
                AnswerOption(label="C", text="150,000,000 m/s"),
                AnswerOption(label="D", text="500,000,000 m/s"),
            ],
            correct_answer="A",
            explanation="The speed of light in vacuum is exactly 299,792,458 m/s",
            difficulty=DifficultyLevel.HARD,
        ),
    ]


@pytest.fixture
def client() -> TestClient:
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_db():
    """Mock MongoDB client."""
    with patch("quizling.api.router.MongoDBClient") as mock:
        db_instance = MagicMock()
        mock.return_value = db_instance
        yield db_instance


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_root_endpoint(self, client: TestClient) -> None:
        """Test root endpoint returns health status."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Quizling API"

    def test_health_endpoint(self, client: TestClient) -> None:
        """Test health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestGetQuestions:
    """Tests for GET /questions endpoint."""

    def test_get_all_questions(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test getting all questions without filters."""
        mock_db.get_all_questions.return_value = sample_questions
        mock_db.count_questions.return_value = 3

        response = client.get("/questions")
        assert response.status_code == 200

        data = response.json()
        assert len(data["data"]) == 3
        assert data["has_more"] is False
        assert data["next_cursor"] is None
        assert data["total"] == 3

    def test_get_questions_with_pagination(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test pagination with limit and cursor."""
        # Return 3 questions to test has_more
        mock_db.get_all_questions.return_value = sample_questions
        mock_db.count_questions.return_value = 10

        response = client.get("/questions?limit=2&cursor=0")
        assert response.status_code == 200

        data = response.json()
        assert len(data["data"]) == 2
        assert data["has_more"] is True
        assert data["next_cursor"] == "2"
        assert data["total"] == 10

    def test_get_questions_by_difficulty(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test filtering questions by difficulty."""
        easy_questions = [sample_questions[0]]
        mock_db.get_questions_by_difficulty.return_value = easy_questions

        response = client.get("/questions?difficulty=easy")
        assert response.status_code == 200

        data = response.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["difficulty"] == "easy"

    def test_search_questions(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test searching questions."""
        search_results = [sample_questions[1]]
        mock_db.search_questions.return_value = search_results

        response = client.get("/questions?search=France")
        assert response.status_code == 200

        data = response.json()
        assert len(data["data"]) == 1
        assert "France" in data["data"][0]["question"]

    def test_search_with_difficulty_filter(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test searching with difficulty filter."""
        # Search returns all matching questions
        mock_db.search_questions.return_value = sample_questions

        response = client.get("/questions?search=what&difficulty=easy")
        assert response.status_code == 200

        data = response.json()
        # Should only return easy questions
        assert all(q["difficulty"] == "easy" for q in data["data"])

    def test_pagination_limits(self, client: TestClient, mock_db: MagicMock) -> None:
        """Test pagination limit constraints."""
        # Test limit too high
        response = client.get("/questions?limit=101")
        assert response.status_code == 422  # Validation error

        # Test limit too low
        response = client.get("/questions?limit=0")
        assert response.status_code == 422

        # Test negative cursor
        response = client.get("/questions?cursor=-1")
        assert response.status_code == 422

    def test_database_error(self, client: TestClient, mock_db: MagicMock) -> None:
        """Test handling of database errors."""
        mock_db.get_all_questions.side_effect = Exception("Database connection failed")

        response = client.get("/questions")
        assert response.status_code == 500
        json_response = response.json()
        assert "Failed to retrieve questions" in json_response["detail"]
        assert json_response.get("operation") == "get_questions"


class TestGetQuestionById:
    """Tests for GET /questions/{id} endpoint."""

    def test_get_question_success(
        self,
        client: TestClient,
        mock_db: MagicMock,
        sample_questions: list[MultipleChoiceQuestion],
    ) -> None:
        """Test getting a question by ID."""
        mock_db.get_question.return_value = sample_questions[0]

        response = client.get("/questions/507f1f77bcf86cd799439011")
        assert response.status_code == 200

        data = response.json()
        assert data["data"]["question"] == "What is 2+2?"

    def test_get_question_not_found(
        self, client: TestClient, mock_db: MagicMock
    ) -> None:
        """Test getting a non-existent question."""
        mock_db.get_question.return_value = None

        response = client.get("/questions/507f1f77bcf86cd799439011")
        assert response.status_code == 404
        assert response.json()["detail"] == "Question not found"

    def test_get_question_invalid_id(
        self, client: TestClient, mock_db: MagicMock
    ) -> None:
        """Test getting a question with invalid ID."""
        mock_db.get_question.side_effect = Exception("Invalid ObjectId")

        response = client.get("/questions/invalid-id")
        assert response.status_code == 500
        json_response = response.json()
        assert "Failed to retrieve question" in json_response["detail"]
        assert json_response.get("operation") == "get_question"


class TestOpenAPISchema:
    """Tests for OpenAPI documentation."""

    def test_openapi_schema_generated(self, client: TestClient) -> None:
        """Test that OpenAPI schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        schema = response.json()
        assert schema["info"]["title"] == "Quizling API"
        assert schema["info"]["version"] == "0.1.0"

    def test_docs_endpoint(self, client: TestClient) -> None:
        """Test that Swagger UI is available."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_endpoint(self, client: TestClient) -> None:
        """Test that ReDoc is available."""
        response = client.get("/redoc")
        assert response.status_code == 200
