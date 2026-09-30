import json
import uuid
from pathlib import Path

from quizling.base.models import MultipleChoiceQuestion, QuizResult


class QuizWriterError(Exception):
    pass


class QuizWriter:
    def __init__(self, quiz_result: QuizResult) -> None:
        if quiz_result is None:
            msg = "quiz_result cannot be None"
            raise ValueError(msg)

        self.quiz_result: QuizResult = quiz_result
        self.output_path: Path = Path(quiz_result.config.output_directory)

    def write(self) -> list[Path]:
        """Write each question to its own <uuid>.json file in the output directory.

        Returns the written paths. Raises QuizWriterError if the directory can't be
        created or a question can't be written.
        """
        if not self.quiz_result.questions:
            return []

        try:
            self.output_path.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            msg = f"Failed to create output directory '{self.output_path}': {e}"
            raise QuizWriterError(msg) from e

        written_files: list[Path] = []

        for idx, question in enumerate(self.quiz_result.questions, start=1):
            try:
                file_path = self._write_question(question)
            except Exception as e:
                msg = f"Failed to write question {idx} to file: {e}"
                raise QuizWriterError(msg) from e
            written_files.append(file_path)

        return written_files

    def _write_question(self, question: MultipleChoiceQuestion) -> Path:
        filename = f"{uuid.uuid4()}.json"
        file_path = self.output_path / filename

        try:
            question_data = question.model_dump()

            with file_path.open("w", encoding="utf-8") as f:
                json.dump(question_data, f, indent=2, ensure_ascii=False)

        except OSError as e:
            msg = f"Failed to write to file '{file_path}': {e}"
            raise QuizWriterError(msg) from e
        except Exception as e:
            msg = f"Unexpected error writing question to '{file_path}': {e}"
            raise QuizWriterError(msg) from e

        return file_path
