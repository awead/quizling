import json
import uuid


from pathlib import Path
from quizling.models import QuizResult


class QuizWriterError(Exception):
    pass


class QuizWriter:
    def __init__(self, quiz_result: QuizResult) -> None:
        if quiz_result is None:
            raise ValueError("quiz_result cannot be None")

        self.quiz_result: QuizResult = quiz_result
        self.output_path: Path = Path(quiz_result.config.output_directory)

    def write(self) -> list[Path]:
        if not self.quiz_result.questions:
            return []

        try:
            self.output_path.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            raise QuizWriterError(
                f"Failed to create output directory '{self.output_path}': {e}"
            ) from e

        written_files: list[Path] = []

        for idx, question in enumerate(self.quiz_result.questions, start=1):
            try:
                file_path = self._write_question(question)
                written_files.append(file_path)
            except Exception as e:
                raise QuizWriterError(
                    f"Failed to write question {idx} to file: {e}"
                ) from e

        return written_files

    def _write_question(self, question) -> Path:
        filename = f"{uuid.uuid4()}.json"
        file_path = self.output_path / filename

        try:
            question_data = question.model_dump()

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(question_data, f, indent=2, ensure_ascii=False)

            return file_path

        except (IOError, OSError) as e:
            raise QuizWriterError(f"Failed to write to file '{file_path}': {e}") from e
        except Exception as e:
            raise QuizWriterError(
                f"Unexpected error writing question to '{file_path}': {e}"
            ) from e
