import json
import logging
from pathlib import Path

from quizling.base.models import MultipleChoiceQuestion

logger = logging.getLogger(__name__)


def load_question_from_file(file_path: Path) -> MultipleChoiceQuestion | None:
    """Parse one question JSON file, or return None if it is missing or invalid."""
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
        return MultipleChoiceQuestion(**data)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning("Error parsing %s: %s", file_path.name, e)
        return None
    except FileNotFoundError:
        logger.warning("File not found: %s", file_path)
        return None


def load_questions_from_directory(
    directory: Path, pattern: str = "*.json"
) -> list[MultipleChoiceQuestion]:
    """Parse every file in directory matching pattern, skipping ones that fail."""
    questions = []
    json_files = list(directory.glob(pattern))

    if not json_files:
        logger.warning("No JSON files found in %s", directory)
        return questions

    logger.info("Found %d JSON files in %s", len(json_files), directory)

    for file_path in json_files:
        question = load_question_from_file(file_path)
        if question:
            questions.append(question)
            logger.info("  ✓ Loaded: %s", file_path.name)
        else:
            logger.info("  ✗ Failed: %s", file_path.name)

    return questions
