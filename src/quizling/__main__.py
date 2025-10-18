"""Command-line interface for Quizling."""

import argparse
import asyncio
import sys


from pathlib import Path
from quizling import DifficultyLevel, QuizConfig, QuizGenerator
from quizling.quiz_writer import QuizWriter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate multiple choice questions from documents using Azure OpenAI"
    )

    parser.add_argument("file", type=str, help="Path to the document file to process")

    parser.add_argument(
        "-n",
        "--num-questions",
        type=int,
        default=5,
        help="Number of questions to generate (default: 5)",
    )

    parser.add_argument(
        "-d",
        "--difficulty",
        type=str,
        choices=["easy", "medium", "hard"],
        default="medium",
        help="Difficulty level (default: medium)",
    )

    parser.add_argument(
        "-t",
        "--topic",
        type=str,
        help="Specific topic to focus on",
    )

    parser.add_argument(
        "--no-explanations",
        action="store_true",
        help="Do not include explanations for answers",
    )

    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default="out",
        help="Directory to output questions (default: out)",
    )

    parser.add_argument(
        "-a",
        "--api-version",
        type=str,
        default="2024-12-01-preview",
        help="OpenAI api version (default: 2024-12-01-preview)",
    )

    return parser.parse_args()


async def main() -> None:
    args = parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    difficulty_map = {
        "easy": DifficultyLevel.EASY,
        "medium": DifficultyLevel.MEDIUM,
        "hard": DifficultyLevel.HARD,
    }

    config = QuizConfig(
        api_version=args.api_version,
        num_questions=args.num_questions,
        difficulty=difficulty_map[args.difficulty],
        include_explanations=not args.no_explanations,
        topic_focus=args.topic,
        output_directory=args.output,
    )

    print(f"Processing: {file_path}")
    print(f"Generating {args.num_questions} {args.difficulty} questions...")

    try:
        generator = QuizGenerator(config)
        quiz_result = await generator.generate_from_file(file_path)

        print(f"Writing questions to: {config.output_directory}")
        writer = QuizWriter(quiz_result)
        written_files = writer.write()

        print(f"Successfully wrote {len(written_files)} questions")
        for file_path in written_files:
            print(f"  - {file_path}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
