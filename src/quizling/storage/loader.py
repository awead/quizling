import json
import sys
from pathlib import Path

from quizling.base.models import MultipleChoiceQuestion


def load_question_from_file(file_path: Path) -> MultipleChoiceQuestion | None:
    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            return MultipleChoiceQuestion(**data)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error parsing {file_path.name}: {e}", file=sys.stderr)
        return None
    except FileNotFoundError:
        print(f"File not found: {file_path}", file=sys.stderr)
        return None


def load_questions_from_directory(
    directory: Path, pattern: str = "*.json"
) -> list[MultipleChoiceQuestion]:
    questions = []
    json_files = list(directory.glob(pattern))

    if not json_files:
        print(f"No JSON files found in {directory}", file=sys.stderr)
        return questions

    print(f"Found {len(json_files)} JSON files in {directory}")

    for file_path in json_files:
        question = load_question_from_file(file_path)
        if question:
            questions.append(question)
            print(f"  ✓ Loaded: {file_path.name}")
        else:
            print(f"  ✗ Failed: {file_path.name}")

    return questions
