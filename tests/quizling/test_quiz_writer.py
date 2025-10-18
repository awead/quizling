import json
import pytest
import tempfile

from pathlib import Path
from quizling.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)
from quizling.quiz_writer import QuizWriter, QuizWriterError


class TestQuizWriter:
    """Integration tests for QuizWriter with actual QuizResult objects."""

    @pytest.fixture
    def quiz_config(self) -> QuizConfig:
        return QuizConfig(
            num_questions=3,
            difficulty=DifficultyLevel.MEDIUM,
            include_explanations=True,
            azure_endpoint="https://test.openai.azure.com",
            azure_api_key="test-key",
            azure_deployment_name="gpt-4o-mini",
            api_version="2024-02-01",
        )

    @pytest.fixture
    def sample_questions(self) -> list[MultipleChoiceQuestion]:
        return [
            MultipleChoiceQuestion(
                question="What is the capital of France?",
                options=[
                    AnswerOption(label="A", text="London"),
                    AnswerOption(label="B", text="Paris"),
                    AnswerOption(label="C", text="Berlin"),
                    AnswerOption(label="D", text="Madrid"),
                ],
                correct_answer="B",
                explanation="Paris is the capital and largest city of France.",
                difficulty=DifficultyLevel.EASY,
            ),
            MultipleChoiceQuestion(
                question="What is 2 + 2?",
                options=[
                    AnswerOption(label="A", text="3"),
                    AnswerOption(label="B", text="4"),
                    AnswerOption(label="C", text="5"),
                    AnswerOption(label="D", text="6"),
                ],
                correct_answer="B",
                explanation="Basic addition: 2 + 2 = 4",
                difficulty=DifficultyLevel.EASY,
            ),
            MultipleChoiceQuestion(
                question="What is the speed of light?",
                options=[
                    AnswerOption(label="A", text="299,792,458 m/s"),
                    AnswerOption(label="B", text="300,000,000 m/s"),
                    AnswerOption(label="C", text="299,792 km/s"),
                    AnswerOption(label="D", text="186,282 mi/s"),
                ],
                correct_answer="A",
                explanation="The speed of light in vacuum is exactly 299,792,458 meters per second.",
                difficulty=DifficultyLevel.HARD,
            ),
        ]

    @pytest.fixture
    def quiz_result(
        self, sample_questions: list[MultipleChoiceQuestion], quiz_config: QuizConfig
    ) -> QuizResult:
        return QuizResult(
            questions=sample_questions,
            source_file="test_source.txt",
            config=quiz_config,
        )

    @pytest.fixture
    def temp_dir(self) -> Path:
        with tempfile.TemporaryDirectory() as tmp_dir:
            yield Path(tmp_dir)

    def test_write_creates_correct_number_of_files(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        assert len(written_files) == len(quiz_result.questions)
        assert len(list(temp_dir.glob("*.json"))) == len(quiz_result.questions)

    def test_write_creates_valid_json_files(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        for file_path in written_files:
            assert file_path.exists()
            assert file_path.suffix == ".json"

            with open(file_path, encoding="utf-8") as f:
                data = json.load(f)
                assert isinstance(data, dict)
                assert "question" in data
                assert "options" in data
                assert "correct_answer" in data

    def test_write_preserves_question_data(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        written_questions = []
        for file_path in written_files:
            with open(file_path, encoding="utf-8") as f:
                data = json.load(f)
                written_questions.append(data)

        assert len(written_questions) == len(quiz_result.questions)

        original_question_texts = {q.question for q in quiz_result.questions}
        written_question_texts = {q["question"] for q in written_questions}
        assert original_question_texts == written_question_texts

    def test_write_uses_uuid_filenames(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        for file_path in written_files:
            name_without_ext = file_path.stem
            parts = name_without_ext.split("-")
            assert len(parts) == 5
            assert len(parts[0]) == 8
            assert len(parts[1]) == 4
            assert len(parts[2]) == 4
            assert len(parts[3]) == 4
            assert len(parts[4]) == 12

    def test_write_creates_output_directory(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        non_existent_dir = temp_dir / "new_directory" / "nested"
        assert not non_existent_dir.exists()

        quiz_result.config.output_directory = str(non_existent_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        assert non_existent_dir.exists()
        assert non_existent_dir.is_dir()
        assert len(written_files) == len(quiz_result.questions)

    def test_write_empty_quiz_result(
        self, temp_dir: Path, quiz_config: QuizConfig
    ) -> None:
        empty_quiz = QuizResult(
            questions=[], source_file="test_empty.txt", config=quiz_config
        )
        empty_quiz.config.output_directory = str(temp_dir)
        writer = QuizWriter(empty_quiz)
        written_files = writer.write()

        assert written_files == []
        assert len(list(temp_dir.glob("*.json"))) == 0

    def test_write_with_string_path(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        assert len(written_files) == len(quiz_result.questions)
        assert all(isinstance(f, Path) for f in written_files)

    def test_write_preserves_utf8_characters(
        self, temp_dir: Path, quiz_config: QuizConfig
    ) -> None:
        question_with_utf8 = MultipleChoiceQuestion(
            question="¿Cuál es la capital de España?",
            options=[
                AnswerOption(label="A", text="Barcelona"),
                AnswerOption(label="B", text="Madrid"),
                AnswerOption(label="C", text="Valencia"),
                AnswerOption(label="D", text="Sevilla"),
            ],
            correct_answer="B",
            explanation="Madrid es la capital de España 🇪🇸",
            difficulty=DifficultyLevel.EASY,
        )

        quiz = QuizResult(
            questions=[question_with_utf8],
            source_file="test_utf8.txt",
            config=quiz_config,
        )
        quiz.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz)
        written_files = writer.write()

        with open(written_files[0], encoding="utf-8") as f:
            data = json.load(f)
            assert data["question"] == "¿Cuál es la capital de España?"
            assert "🇪🇸" in data["explanation"]

    def test_write_returns_path_objects(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        assert all(isinstance(f, Path) for f in written_files)

    def test_init_with_none_quiz_result(self, temp_dir: Path) -> None:
        with pytest.raises(ValueError, match="quiz_result cannot be None"):
            QuizWriter(None)  # type: ignore

    def test_write_handles_directory_creation_failure(
        self, quiz_result: QuizResult
    ) -> None:
        invalid_path = Path("/dev/null/cannot_create_here")

        quiz_result.config.output_directory = str(invalid_path)
        writer = QuizWriter(quiz_result)
        with pytest.raises(QuizWriterError, match="Failed to create output directory"):
            writer.write()

    def test_multiple_writes_create_different_files(
        self, quiz_result: QuizResult, temp_dir: Path
    ) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)

        first_write = writer.write()
        second_write = writer.write()

        all_files = first_write + second_write
        unique_files = set(f.name for f in all_files)
        assert len(unique_files) == len(all_files)

    def test_json_formatting(self, quiz_result: QuizResult, temp_dir: Path) -> None:
        quiz_result.config.output_directory = str(temp_dir)
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        with open(written_files[0], encoding="utf-8") as f:
            content = f.read()

            assert "  " in content
            assert "\n" in content
