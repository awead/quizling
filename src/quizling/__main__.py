"""Command-line interface for Quizling."""

import argparse
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from quizling import DifficultyLevel, QuizConfig, QuizGenerator


def parse_args() -> argparse.Namespace:
    """Parse command line arguments.

    Returns:
        Parsed command line arguments
    """
    parser = argparse.ArgumentParser(
        description="Generate multiple choice questions from documents using Azure OpenAI"
    )

    parser.add_argument(
        "file", type=str, help="Path to the document file to process"
    )

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
    """Main CLI entry point."""
    load_dotenv()

    args = parse_args()

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

    if not azure_endpoint or not azure_api_key:
        print("Error: Azure OpenAI credentials not found.", file=sys.stderr)
        print(
            "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY "
            "environment variables.",
            file=sys.stderr,
        )
        print(
            "You can create a .env file based on .env.example",
            file=sys.stderr,
        )
        sys.exit(1)

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
        azure_endpoint=azure_endpoint,
        azure_api_key=azure_api_key,
        azure_deployment_name=azure_deployment,
    )

    print(f"Processing: {file_path}")
    print(f"Generating {args.num_questions} {args.difficulty} questions...")

    try:
        generator = QuizGenerator(config)
        result = await generator.generate_from_file(file_path)

        print(f"\nSuccessfully generated {result.num_questions} questions!")

        output_base = args.output or "quiz_output"
        if output_base.endswith(".json"):
            output_base = output_base[:-5]
        elif output_base.endswith(".txt"):
            output_base = output_base[:-4]

        if args.format in ["json", "both"]:
            json_path = f"{output_base}.json"
            generator.export_to_json(result, json_path)
            print(f"Exported to JSON: {json_path}")

        if args.format in ["text", "both"]:
            txt_path = f"{output_base}.txt"
            with open(txt_path, "w") as f:
                f.write(generator.format_quiz_text(result))
            print(f"Exported to text: {txt_path}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
