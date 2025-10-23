"""Tests for MongoDB storage functionality."""

import pytest
from unittest.mock import MagicMock, patch

from quizling.base.models import AnswerOption, DifficultyLevel, MultipleChoiceQuestion
from quizling.storage import MongoDBClient
from quizling.storage.db import MongoDBConnectionError


@pytest.fixture
def sample_question() -> MultipleChoiceQuestion:
    """Create a sample question for testing."""
    return MultipleChoiceQuestion(
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
    )


@pytest.fixture
def sample_questions() -> list[MultipleChoiceQuestion]:
    """Create multiple sample questions for testing."""
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
            question="What is quantum entanglement?",
            options=[
                AnswerOption(label="A", text="A physical phenomenon"),
                AnswerOption(label="B", text="A type of energy"),
                AnswerOption(label="C", text="A chemical reaction"),
                AnswerOption(label="D", text="A biological process"),
            ],
            correct_answer="A",
            explanation="Quantum entanglement is a physical phenomenon",
            difficulty=DifficultyLevel.HARD,
        ),
    ]


class TestMongoDBClient:
    """Tests for MongoDBClient class."""

    def test_init_with_defaults(self) -> None:
        """Test initialization with default parameters."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client

            client = MongoDBClient()

            # Should use default connection string
            assert "localhost:27017" in client.mongodb_uri
            assert client.database_name == "quizling"
            mock_client_class.assert_called_once()

    def test_init_with_custom_params(self) -> None:
        """Test initialization with custom parameters."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client

            custom_uri = "mongodb://custom:password@example.com:27017/testdb"
            custom_db = "testdb"

            client = MongoDBClient(mongodb_uri=custom_uri, database_name=custom_db)

            assert client.mongodb_uri == custom_uri
            assert client.database_name == custom_db

    def test_connection_error(self) -> None:
        """Test that connection errors are handled properly."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            from pymongo import errors

            mock_client_class.return_value.server_info.side_effect = (
                errors.ServerSelectionTimeoutError("Connection failed")
            )

            with pytest.raises(MongoDBConnectionError, match="Failed to connect"):
                MongoDBClient()

    def test_context_manager(self) -> None:
        """Test that client can be used as context manager."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client

            with MongoDBClient() as client:
                assert client is not None

            # close() should have been called
            mock_client.close.assert_called_once()

    def test_insert_question(self, sample_question: MultipleChoiceQuestion) -> None:
        """Test inserting a single question."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()
            mock_result = MagicMock()
            mock_result.inserted_id = "test_id_123"

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )
            mock_collection.insert_one.return_value = mock_result

            client = MongoDBClient()
            result = client.insert_question(sample_question)

            assert result == "test_id_123"
            mock_collection.insert_one.assert_called_once()

    def test_insert_questions(
        self, sample_questions: list[MultipleChoiceQuestion]
    ) -> None:
        """Test inserting multiple questions."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()
            mock_result = MagicMock()
            mock_result.inserted_ids = ["id1", "id2", "id3"]

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )
            mock_collection.insert_many.return_value = mock_result

            client = MongoDBClient()
            results = client.insert_questions(sample_questions)

            assert len(results) == 3
            mock_collection.insert_many.assert_called_once()

    def test_insert_questions_empty_list(self) -> None:
        """Test inserting empty list of questions."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client

            client = MongoDBClient()
            results = client.insert_questions([])

            assert results == []

    def test_get_question(self, sample_question: MultipleChoiceQuestion) -> None:
        """Test retrieving a single question."""
        with (
            patch("quizling.storage.db.MongoClient") as mock_client_class,
            patch("bson.ObjectId") as mock_objectid,
        ):
            mock_client = MagicMock()
            mock_collection = MagicMock()

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )

            # Mock ObjectId to return the input string
            mock_objectid.return_value = "test_id"

            # Mock the find_one response
            question_dict = sample_question.model_dump()
            question_dict["_id"] = "test_id"
            mock_collection.find_one.return_value = question_dict

            client = MongoDBClient()
            result = client.get_question("test_id")

            assert result is not None
            assert result.question == sample_question.question
            assert result.correct_answer == sample_question.correct_answer
            assert result.id == "test_id"

    def test_get_question_not_found(self) -> None:
        """Test retrieving a question that doesn't exist."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )
            mock_collection.find_one.return_value = None

            client = MongoDBClient()
            result = client.get_question("nonexistent_id")

            assert result is None

    def test_get_questions_by_difficulty(
        self, sample_questions: list[MultipleChoiceQuestion]
    ) -> None:
        """Test retrieving questions by difficulty level."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )

            # Mock find() to return easy questions
            easy_questions = [q for q in sample_questions if q.difficulty == "easy"]
            mock_docs = [
                {**q.model_dump(), "_id": f"id_{i}"}
                for i, q in enumerate(easy_questions)
            ]
            mock_collection.find.return_value = mock_docs

            client = MongoDBClient()
            results = client.get_questions_by_difficulty("easy")

            assert len(results) == len(easy_questions)
            mock_collection.find.assert_called_once_with({"difficulty": "easy"})

    def test_count_questions(self) -> None:
        """Test counting questions in database."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()
            mock_collection.count_documents.return_value = 42

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )

            client = MongoDBClient()
            count = client.count_questions()

            assert count == 42
            mock_collection.count_documents.assert_called_once_with({})

    def test_delete_question(self) -> None:
        """Test deleting a question."""
        with (
            patch("quizling.storage.db.MongoClient") as mock_client_class,
            patch("bson.ObjectId") as mock_objectid,
        ):
            mock_client = MagicMock()
            mock_collection = MagicMock()
            mock_result = MagicMock()
            mock_result.deleted_count = 1

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )
            mock_collection.delete_one.return_value = mock_result

            # Mock ObjectId to return the input string
            mock_objectid.return_value = "test_id"

            client = MongoDBClient()
            result = client.delete_question("test_id")

            assert result is True
            mock_collection.delete_one.assert_called_once()

    def test_delete_all_questions(self) -> None:
        """Test deleting all questions."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()
            mock_result = MagicMock()
            mock_result.deleted_count = 10

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )
            mock_collection.delete_many.return_value = mock_result

            client = MongoDBClient()
            count = client.delete_all_questions()

            assert count == 10
            mock_collection.delete_many.assert_called_once_with({})

    def test_search_questions(self) -> None:
        """Test searching questions by text."""
        with patch("quizling.storage.db.MongoClient") as mock_client_class:
            mock_client = MagicMock()
            mock_collection = MagicMock()

            mock_client_class.return_value = mock_client
            mock_client.__getitem__.return_value.__getitem__.return_value = (
                mock_collection
            )

            # Mock find() with regex search
            mock_collection.find.return_value = []

            client = MongoDBClient()
            client.search_questions("capital")

            mock_collection.find.assert_called_once()
            # Check that regex was used in the query
            call_args = mock_collection.find.call_args[0][0]
            assert "question" in call_args
            assert "$regex" in call_args["question"]
            assert call_args["question"]["$regex"] == "capital"
