"""Tests for question loader functionality."""

import json
from pathlib import Path

import pytest

from quizling.models import AnswerOption, DifficultyLevel, MultipleChoiceQuestion
from quizling.storage.loader import (
    load_question_from_file,
    load_questions_from_directory,
)


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
def temp_json_file(tmp_path: Path, sample_question: MultipleChoiceQuestion) -> Path:
    """Create a temporary JSON file with a question."""
    json_file = tmp_path / "question.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(sample_question.model_dump(), f)
    return json_file


@pytest.fixture
def temp_directory_with_questions(tmp_path: Path) -> Path:
    """Create a temporary directory with multiple question JSON files."""
    questions = [
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
    ]

    for i, q in enumerate(questions):
        json_file = tmp_path / f"question_{i}.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(q.model_dump(), f)

    return tmp_path


class TestLoadQuestionFromFile:
    """Tests for load_question_from_file function."""

    def test_load_valid_question(
        self, temp_json_file: Path, sample_question: MultipleChoiceQuestion
    ) -> None:
        """Test loading a valid question from a JSON file."""
        loaded_question = load_question_from_file(temp_json_file)

        assert loaded_question is not None
        assert loaded_question.question == sample_question.question
        assert loaded_question.correct_answer == sample_question.correct_answer
        assert loaded_question.difficulty == sample_question.difficulty

    def test_load_nonexistent_file(self, tmp_path: Path) -> None:
        """Test loading from a file that doesn't exist."""
        nonexistent_file = tmp_path / "does_not_exist.json"
        result = load_question_from_file(nonexistent_file)

        assert result is None

    def test_load_invalid_json(self, tmp_path: Path) -> None:
        """Test loading from a file with invalid JSON."""
        invalid_file = tmp_path / "invalid.json"
        with open(invalid_file, "w", encoding="utf-8") as f:
            f.write("{ invalid json }")

        result = load_question_from_file(invalid_file)

        assert result is None

    def test_load_invalid_question_data(self, tmp_path: Path) -> None:
        """Test loading from a file with invalid question data."""
        invalid_file = tmp_path / "invalid_question.json"
        with open(invalid_file, "w", encoding="utf-8") as f:
            json.dump({"question": "test"}, f)  # Missing required fields

        result = load_question_from_file(invalid_file)

        assert result is None


class TestLoadQuestionsFromDirectory:
    """Tests for load_questions_from_directory function."""

    def test_load_multiple_questions(self, temp_directory_with_questions: Path) -> None:
        """Test loading multiple questions from a directory."""
        questions = load_questions_from_directory(temp_directory_with_questions)

        assert len(questions) == 2
        assert all(isinstance(q, MultipleChoiceQuestion) for q in questions)

    def test_load_with_pattern(self, tmp_path: Path) -> None:
        """Test loading questions with a specific pattern."""
        # Create files with different extensions
        question = MultipleChoiceQuestion(
            question="Test?",
            options=[
                AnswerOption(label="A", text="1"),
                AnswerOption(label="B", text="2"),
                AnswerOption(label="C", text="3"),
                AnswerOption(label="D", text="4"),
            ],
            correct_answer="A",
            explanation="Test",
            difficulty=DifficultyLevel.EASY,
        )

        json_file = tmp_path / "question.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(question.model_dump(), f)

        txt_file = tmp_path / "other.txt"
        txt_file.write_text("not a json file")

        # Should only load .json files
        questions = load_questions_from_directory(tmp_path, pattern="*.json")

        assert len(questions) == 1

    def test_load_from_empty_directory(self, tmp_path: Path) -> None:
        """Test loading from a directory with no JSON files."""
        questions = load_questions_from_directory(tmp_path)

        assert len(questions) == 0

    def test_load_with_invalid_files(self, tmp_path: Path) -> None:
        """Test loading when some files are invalid."""
        # Create one valid and one invalid file
        valid_question = MultipleChoiceQuestion(
            question="Valid?",
            options=[
                AnswerOption(label="A", text="1"),
                AnswerOption(label="B", text="2"),
                AnswerOption(label="C", text="3"),
                AnswerOption(label="D", text="4"),
            ],
            correct_answer="A",
            explanation="Valid",
            difficulty=DifficultyLevel.EASY,
        )

        valid_file = tmp_path / "valid.json"
        with open(valid_file, "w", encoding="utf-8") as f:
            json.dump(valid_question.model_dump(), f)

        invalid_file = tmp_path / "invalid.json"
        with open(invalid_file, "w", encoding="utf-8") as f:
            f.write("{ invalid }")

        questions = load_questions_from_directory(tmp_path)

        # Should load only the valid question
        assert len(questions) == 1
        assert questions[0].question == "Valid?"
