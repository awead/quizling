import tempfile
import pytest


from pathlib import Path
from quizling.generator import QuizGenerator
from quizling.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_config() -> QuizConfig:
    """Create a mock configuration for testing."""
    return QuizConfig(
        num_questions=3,
        difficulty=DifficultyLevel.MEDIUM,
        include_explanations=True,
        azure_endpoint="https://test.openai.azure.com",
        azure_api_key="test-key",
        azure_deployment_name="gpt-4o-mini",
    )


@pytest.fixture
def sample_questions() -> list[MultipleChoiceQuestion]:
    """Create sample questions for testing."""
    return [
        MultipleChoiceQuestion(
            question="What is Python?",
            options=[
                AnswerOption(label="A", text="A programming language"),
                AnswerOption(label="B", text="A type of snake"),
                AnswerOption(label="C", text="A software framework"),
                AnswerOption(label="D", text="A database system"),
            ],
            correct_answer="A",
            explanation="Python is a high-level programming language",
            difficulty=DifficultyLevel.EASY,
        ),
        MultipleChoiceQuestion(
            question="Who created Python?",
            options=[
                AnswerOption(label="A", text="Dennis Ritchie"),
                AnswerOption(label="B", text="Guido van Rossum"),
                AnswerOption(label="C", text="James Gosling"),
                AnswerOption(label="D", text="Bjarne Stroustrup"),
            ],
            correct_answer="B",
            explanation="Guido van Rossum created Python in 1991",
            difficulty=DifficultyLevel.MEDIUM,
        ),
        MultipleChoiceQuestion(
            question="What is PEP 8?",
            options=[
                AnswerOption(label="A", text="A Python package manager"),
                AnswerOption(label="B", text="A Python style guide"),
                AnswerOption(label="C", text="A Python testing framework"),
                AnswerOption(label="D", text="A Python web framework"),
            ],
            correct_answer="B",
            explanation="PEP 8 is the style guide for Python code",
            difficulty=DifficultyLevel.HARD,
        ),
    ]


class TestQuizGenerator:
    """Tests for QuizGenerator class."""

    def test_initialization(self, mock_config: QuizConfig) -> None:
        """Test that QuizGenerator initializes correctly."""
        generator = QuizGenerator(mock_config)
        assert generator.config == mock_config
        assert generator._agent is not None

    def test_build_system_prompt_with_explanations(
        self, mock_config: QuizConfig
    ) -> None:
        """Test system prompt generation with explanations enabled."""
        generator = QuizGenerator(mock_config)
        prompt = generator._build_system_prompt()

        assert "3 multiple choice questions" in prompt
        assert "medium difficulty" in prompt
        assert "Include a detailed explanation" in prompt
        assert "Cover various important topics" in prompt

    def test_build_system_prompt_without_explanations(
        self, mock_config: QuizConfig
    ) -> None:
        """Test system prompt generation with explanations disabled."""
        mock_config.include_explanations = False
        generator = QuizGenerator(mock_config)
        prompt = generator._build_system_prompt()

        assert "Do not include explanations" in prompt

    def test_build_system_prompt_with_topic_focus(
        self, mock_config: QuizConfig
    ) -> None:
        """Test system prompt generation with topic focus."""
        mock_config.topic_focus = "machine learning"
        generator = QuizGenerator(mock_config)
        prompt = generator._build_system_prompt()

        assert "machine learning" in prompt
        assert "Focus specifically on topics related to" in prompt

    @pytest.mark.asyncio
    async def test_generate_from_text(
        self, mock_config: QuizConfig, sample_questions: list[MultipleChoiceQuestion]
    ) -> None:
        """Test generating questions from text."""
        generator = QuizGenerator(mock_config)

        mock_result = MagicMock()
        mock_result.output = sample_questions

        with patch.object(generator._agent, "run", new_callable=AsyncMock) as mock_run:
            mock_run.return_value = mock_result

            text = "This is a test content that is long enough to generate questions from. " * 5
            result = await generator.generate_from_text(text)

            assert isinstance(result, QuizResult)
            assert len(result.questions) == 3
            assert result.source_file == "<text input>"
            assert result.config == mock_config

    @pytest.mark.asyncio
    async def test_generate_from_text_too_short(self, mock_config: QuizConfig) -> None:
        """Test that short text raises ValueError."""
        generator = QuizGenerator(mock_config)

        with pytest.raises(ValueError, match="too short"):
            await generator.generate_from_text("Too short")

    @pytest.mark.asyncio
    async def test_generate_from_file(
        self, mock_config: QuizConfig, sample_questions: list[MultipleChoiceQuestion]
    ) -> None:
        """Test generating questions from a file."""
        generator = QuizGenerator(mock_config)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("This is test content that is long enough. " * 10)
            temp_path = Path(f.name)

        try:
            mock_result = MagicMock()
            mock_result.output = sample_questions

            with patch.object(
                generator._agent, "run", new_callable=AsyncMock
            ) as mock_run:
                mock_run.return_value = mock_result

                result = await generator.generate_from_file(temp_path)

                assert isinstance(result, QuizResult)
                assert len(result.questions) == 3
                assert result.source_file == str(temp_path.absolute())
                assert result.config == mock_config
        finally:
            temp_path.unlink()

    @pytest.mark.asyncio
    async def test_generate_from_file_not_found(self, mock_config: QuizConfig) -> None:
        """Test that non-existent file raises FileNotFoundError."""
        generator = QuizGenerator(mock_config)

        with pytest.raises(FileNotFoundError):
            await generator.generate_from_file("/nonexistent/file.txt")

    @pytest.mark.asyncio
    async def test_generate_from_file_unsupported_format(
        self, mock_config: QuizConfig
    ) -> None:
        """Test that unsupported file format raises ValueError."""
        generator = QuizGenerator(mock_config)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".xyz", delete=False) as f:
            f.write("Content")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="Unsupported file type"):
                await generator.generate_from_file(temp_path)
        finally:
            temp_path.unlink()

    @pytest.mark.asyncio
    async def test_generate_from_file_content_too_short(
        self, mock_config: QuizConfig
    ) -> None:
        """Test that file with too little content raises ValueError."""
        generator = QuizGenerator(mock_config)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("Short")
            temp_path = Path(f.name)

        try:
            with pytest.raises(ValueError, match="too short"):
                await generator.generate_from_file(temp_path)
        finally:
            temp_path.unlink()

    @pytest.mark.asyncio
    async def test_generate_questions_error_handling(
        self, mock_config: QuizConfig
    ) -> None:
        """Test error handling during question generation."""
        generator = QuizGenerator(mock_config)

        with patch.object(generator._agent, "run", new_callable=AsyncMock) as mock_run:
            mock_run.side_effect = Exception("API Error")

            with pytest.raises(Exception, match="Error generating questions"):
                await generator._generate_questions("Test content")

