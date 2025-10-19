import pytest
import tempfile

from io import StringIO
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

from quizling.__main__ import main, parse_args
from quizling.base.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)


class TestParseArgs:
    """Tests for command-line argument parsing."""

    def test_parse_args_minimal(self) -> None:
        """Test parsing with only required arguments."""
        with patch("sys.argv", ["quizling", "test.txt"]):
            args = parse_args()

            assert args.file == "test.txt"
            assert args.num_questions == 5
            assert args.difficulty == "medium"
            assert args.topic is None
            assert args.no_explanations is False
            assert args.output == "out"
            assert args.api_version == "2024-12-01-preview"

    def test_parse_args_all_options(self) -> None:
        """Test parsing with all options specified."""
        with patch(
            "sys.argv",
            [
                "quizling",
                "test.txt",
                "-n",
                "10",
                "-d",
                "hard",
                "-t",
                "Python",
                "--no-explanations",
                "-o",
                "custom_out",
                "-a",
                "2024-06-01",
            ],
        ):
            args = parse_args()

            assert args.file == "test.txt"
            assert args.num_questions == 10
            assert args.difficulty == "hard"
            assert args.topic == "Python"
            assert args.no_explanations is True
            assert args.output == "custom_out"
            assert args.api_version == "2024-06-01"

    def test_parse_args_long_options(self) -> None:
        """Test parsing with long option names."""
        with patch(
            "sys.argv",
            [
                "quizling",
                "test.txt",
                "--num-questions",
                "3",
                "--difficulty",
                "easy",
                "--topic",
                "Testing",
                "--output",
                "results",
                "--api-version",
                "2024-01-01",
            ],
        ):
            args = parse_args()

            assert args.file == "test.txt"
            assert args.num_questions == 3
            assert args.difficulty == "easy"
            assert args.topic == "Testing"
            assert args.output == "results"
            assert args.api_version == "2024-01-01"

    def test_parse_args_invalid_difficulty(self) -> None:
        """Test that invalid difficulty values are rejected."""
        with patch("sys.argv", ["quizling", "test.txt", "-d", "invalid"]):
            with pytest.raises(SystemExit):
                parse_args()


class TestMain:
    """Tests for the main function."""

    @pytest.fixture
    def sample_quiz_result(self) -> QuizResult:
        """Create a sample QuizResult for testing."""
        config = QuizConfig(
            num_questions=2,
            difficulty=DifficultyLevel.MEDIUM,
            include_explanations=True,
            output_directory="test_out",
            azure_endpoint="https://test.openai.azure.com",
            azure_api_key="test-key",
            azure_deployment_name="gpt-4o-mini",
            api_version="2024-12-01-preview",
        )

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
                difficulty=DifficultyLevel.EASY,
            ),
        ]

        return QuizResult(questions=questions, source_file="test.txt", config=config)

    @pytest.mark.asyncio
    async def test_main_success(self, sample_quiz_result: QuizResult) -> None:
        """Test successful execution of main function."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_file = Path(tmp_dir) / "test.txt"
            test_file.write_text("Test content")
            output_dir = Path(tmp_dir) / "out"

            # Update the quiz result's config to use the correct output directory
            sample_quiz_result.config.output_directory = str(output_dir)

            with patch("sys.argv", ["quizling", str(test_file), "-o", str(output_dir)]):
                mock_generator = MagicMock()
                mock_generator.generate_from_file = AsyncMock(
                    return_value=sample_quiz_result
                )

                with patch(
                    "quizling.__main__.QuizGenerator", return_value=mock_generator
                ):
                    # Capture stdout
                    captured_output = StringIO()
                    with patch("sys.stdout", captured_output):
                        await main()

                    output = captured_output.getvalue()
                    assert "Processing:" in output
                    assert "Generating" in output
                    assert "Writing questions to:" in output
                    assert "Successfully wrote 2 questions" in output

                    # Verify files were written
                    assert output_dir.exists()
                    json_files = list(output_dir.glob("*.json"))
                    assert len(json_files) == 2

    @pytest.mark.asyncio
    async def test_main_file_not_found(self) -> None:
        """Test main function with non-existent file."""
        with patch("sys.argv", ["quizling", "nonexistent.txt"]):
            with pytest.raises(SystemExit) as exc_info:
                captured_error = StringIO()
                with patch("sys.stderr", captured_error):
                    await main()

            assert exc_info.value.code == 1

    @pytest.mark.asyncio
    async def test_main_generator_error(self, sample_quiz_result: QuizResult) -> None:
        """Test main function when generator raises an error."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_file = Path(tmp_dir) / "test.txt"
            test_file.write_text("Test content")

            with patch("sys.argv", ["quizling", str(test_file)]):
                mock_generator = MagicMock()
                mock_generator.generate_from_file = AsyncMock(
                    side_effect=Exception("Generation failed")
                )

                with patch(
                    "quizling.__main__.QuizGenerator", return_value=mock_generator
                ):
                    with pytest.raises(SystemExit) as exc_info:
                        captured_error = StringIO()
                        with patch("sys.stderr", captured_error):
                            await main()

                    assert exc_info.value.code == 1

    @pytest.mark.asyncio
    async def test_main_with_custom_options(
        self, sample_quiz_result: QuizResult
    ) -> None:
        """Test main function with custom CLI options."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_file = Path(tmp_dir) / "test.txt"
            test_file.write_text("Test content")
            output_dir = Path(tmp_dir) / "custom_out"

            # Update the quiz result's config to use the correct output directory
            sample_quiz_result.config.output_directory = str(output_dir)

            with patch(
                "sys.argv",
                [
                    "quizling",
                    str(test_file),
                    "-n",
                    "3",
                    "-d",
                    "hard",
                    "-t",
                    "Python",
                    "--no-explanations",
                    "-o",
                    str(output_dir),
                    "-a",
                    "2024-06-01",
                ],
            ):
                mock_generator = MagicMock()
                mock_generator.generate_from_file = AsyncMock(
                    return_value=sample_quiz_result
                )

                with patch(
                    "quizling.__main__.QuizGenerator", return_value=mock_generator
                ) as mock_gen_class:
                    captured_output = StringIO()
                    with patch("sys.stdout", captured_output):
                        await main()

                    # Verify QuizConfig was created with correct parameters
                    call_args = mock_gen_class.call_args[0][0]
                    assert call_args.num_questions == 3
                    assert call_args.difficulty == DifficultyLevel.HARD
                    assert call_args.topic_focus == "Python"
                    assert call_args.include_explanations is False
                    assert call_args.output_directory == str(output_dir)
                    assert call_args.api_version == "2024-06-01"

                    output = captured_output.getvalue()
                    assert "Generating 3 hard questions" in output

    @pytest.mark.asyncio
    async def test_main_prints_file_paths(self, sample_quiz_result: QuizResult) -> None:
        """Test that main function prints the paths of written files."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_file = Path(tmp_dir) / "test.txt"
            test_file.write_text("Test content")
            output_dir = Path(tmp_dir) / "out"

            # Update the quiz result's config to use the correct output directory
            sample_quiz_result.config.output_directory = str(output_dir)

            with patch("sys.argv", ["quizling", str(test_file), "-o", str(output_dir)]):
                mock_generator = MagicMock()
                mock_generator.generate_from_file = AsyncMock(
                    return_value=sample_quiz_result
                )

                with patch(
                    "quizling.__main__.QuizGenerator", return_value=mock_generator
                ):
                    captured_output = StringIO()
                    with patch("sys.stdout", captured_output):
                        await main()

                    output = captured_output.getvalue()
                    # Should print each written file
                    assert output.count("  - ") == 2
                    assert ".json" in output

    @pytest.mark.asyncio
    async def test_main_difficulty_mapping(
        self, sample_quiz_result: QuizResult
    ) -> None:
        """Test that difficulty string is correctly mapped to DifficultyLevel enum."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_file = Path(tmp_dir) / "test.txt"
            test_file.write_text("Test content")
            output_dir = Path(tmp_dir) / "out"

            # Update the quiz result's config to use the correct output directory
            sample_quiz_result.config.output_directory = str(output_dir)

            # Test each difficulty level
            for difficulty_str, difficulty_enum in [
                ("easy", DifficultyLevel.EASY),
                ("medium", DifficultyLevel.MEDIUM),
                ("hard", DifficultyLevel.HARD),
            ]:
                with patch(
                    "sys.argv",
                    [
                        "quizling",
                        str(test_file),
                        "-d",
                        difficulty_str,
                        "-o",
                        str(output_dir),
                    ],
                ):
                    mock_generator = MagicMock()
                    mock_generator.generate_from_file = AsyncMock(
                        return_value=sample_quiz_result
                    )

                    with patch(
                        "quizling.__main__.QuizGenerator", return_value=mock_generator
                    ) as mock_gen_class:
                        captured_output = StringIO()
                        with patch("sys.stdout", captured_output):
                            await main()

                        # Verify correct difficulty was used
                        call_args = mock_gen_class.call_args[0][0]
                        assert call_args.difficulty == difficulty_enum
