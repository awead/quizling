"""Command-line interface for Quizling.

Status: WIP
TODO: Needs an output strategy with storage and re-use in mind.
"""

import argparse
import asyncio
import sys


from pathlib import Path
from quizling import DifficultyLevel, QuizConfig, QuizGenerator


def parse_args() -> argparse.Namespace:
    """Parse command line arguments.

    Returns:
        Parsed command line arguments
    """
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
        help="Output file path (default: quiz_output.json)",
    )

    parser.add_argument(
        "--format",
        type=str,
        choices=["json", "text", "both"],
        default="both",
        help="Output format (default: both)",
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
        num_questions=args.num_questions,
        difficulty=difficulty_map[args.difficulty],
        include_explanations=not args.no_explanations,
        topic_focus=args.topic,
    )

    print(f"Processing: {file_path}")
    print(f"Generating {args.num_questions} {args.difficulty} questions...")

    try:
        generator = QuizGenerator(config)
        await generator.generate_from_file(file_path)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
