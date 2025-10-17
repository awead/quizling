import pytest


from pydantic import ValidationError
from quizling.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)


class TestAnswerOption:
    """Tests for AnswerOption model."""

    def test_valid_answer_option(self) -> None:
        """Test creating a valid answer option."""
        option = AnswerOption(label="A", text="Answer text")
        assert option.label == "A"
        assert option.text == "Answer text"

    def test_invalid_label(self) -> None:
        """Test that invalid labels are rejected."""
        with pytest.raises(ValidationError):
            AnswerOption(label="E", text="Answer text")

    def test_empty_text(self) -> None:
        """Test that empty text is rejected."""
        with pytest.raises(ValidationError):
            AnswerOption(label="A", text="")


class TestMultipleChoiceQuestion:
    """Tests for MultipleChoiceQuestion model."""

    def test_valid_question(self) -> None:
        """Test creating a valid multiple choice question."""
        options = [
            AnswerOption(label="A", text="Option A"),
            AnswerOption(label="B", text="Option B"),
            AnswerOption(label="C", text="Option C"),
            AnswerOption(label="D", text="Option D"),
        ]

        question = MultipleChoiceQuestion(
            question="What is 2+2?",
            options=options,
            correct_answer="A",
            explanation="2+2 equals 4",
            difficulty=DifficultyLevel.EASY,
        )

        assert question.question == "What is 2+2?"
        assert len(question.options) == 4
        assert question.correct_answer == "A"
        assert question.explanation == "2+2 equals 4"
        assert question.difficulty == DifficultyLevel.EASY

    def test_options_are_sorted_by_label(self) -> None:
        """Test that options are automatically sorted by label."""
        options = [
            AnswerOption(label="D", text="Option D"),
            AnswerOption(label="B", text="Option B"),
            AnswerOption(label="A", text="Option A"),
            AnswerOption(label="C", text="Option C"),
        ]

        question = MultipleChoiceQuestion(
            question="Test?",
            options=options,
            correct_answer="A",
        )

        labels = [opt.label for opt in question.options]
        assert labels == ["A", "B", "C", "D"]

    def test_invalid_number_of_options(self) -> None:
        """Test that wrong number of options is rejected."""
        with pytest.raises(ValidationError):
            MultipleChoiceQuestion(
                question="Test?",
                options=[
                    AnswerOption(label="A", text="Option A"),
                    AnswerOption(label="B", text="Option B"),
                ],
                correct_answer="A",
            )

    def test_duplicate_labels(self) -> None:
        """Test that duplicate option labels are rejected."""
        with pytest.raises(ValidationError):
            MultipleChoiceQuestion(
                question="Test?",
                options=[
                    AnswerOption(label="A", text="Option A"),
                    AnswerOption(label="A", text="Duplicate A"),
                    AnswerOption(label="C", text="Option C"),
                    AnswerOption(label="D", text="Option D"),
                ],
                correct_answer="A",
            )

    def test_invalid_correct_answer(self) -> None:
        """Test that invalid correct_answer is rejected."""
        with pytest.raises(ValidationError):
            MultipleChoiceQuestion(
                question="Test?",
                options=[
                    AnswerOption(label="A", text="Option A"),
                    AnswerOption(label="B", text="Option B"),
                    AnswerOption(label="C", text="Option C"),
                    AnswerOption(label="D", text="Option D"),
                ],
                correct_answer="E",
            )


class TestQuizConfig:
    """Tests for QuizConfig model."""

    def test_valid_config(self) -> None:
        """Test creating a valid configuration."""
        config = QuizConfig(
            num_questions=5,
            difficulty=DifficultyLevel.MEDIUM,
            include_explanations=True,
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
            azure_deployment_name="gpt-4o-mini",
        )

        assert config.num_questions == 5
        assert config.difficulty == DifficultyLevel.MEDIUM
        assert config.include_explanations is True
        assert config.azure_endpoint == "https://example.openai.azure.com"

    def test_default_values(self) -> None:
        """Test that default values are set correctly."""
        config = QuizConfig(
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
        )

        assert config.num_questions == 5
        assert config.difficulty == DifficultyLevel.MEDIUM
        assert config.include_explanations is True
        assert config.azure_deployment_name == "gpt-5-mini"

    def test_num_questions_validation(self) -> None:
        """Test that num_questions is validated."""
        with pytest.raises(ValidationError):
            QuizConfig(
                num_questions=0,
                azure_endpoint="https://example.openai.azure.com",
                azure_api_key="test-key",
            )

        with pytest.raises(ValidationError):
            QuizConfig(
                num_questions=51,
                azure_endpoint="https://example.openai.azure.com",
                azure_api_key="test-key",
            )


class TestQuizResult:
    """Tests for QuizResult model."""

    def test_valid_quiz_result(self) -> None:
        """Test creating a valid quiz result."""
        config = QuizConfig(
            azure_endpoint="https://example.openai.azure.com",
            azure_api_key="test-key",
        )

        questions = [
            MultipleChoiceQuestion(
                question="Test?",
                options=[
                    AnswerOption(label="A", text="Option A"),
                    AnswerOption(label="B", text="Option B"),
                    AnswerOption(label="C", text="Option C"),
                    AnswerOption(label="D", text="Option D"),
                ],
                correct_answer="A",
            )
        ]

        result = QuizResult(
            questions=questions,
            source_file="/path/to/file.txt",
            config=config,
        )

        assert result.num_questions == 1
        assert result.source_file == "/path/to/file.txt"
        assert result.config == config
