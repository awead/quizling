"""Script to load quiz questions from JSON files into MongoDB."""

import argparse
import sys
from pathlib import Path

from quizling.storage import MongoDBClient
from quizling.storage.db import MongoDBConnectionError
from quizling.storage.loader import load_questions_from_directory


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Load quiz questions from JSON files into MongoDB"
    )

    parser.add_argument(
        "directory",
        type=str,
        nargs="?",
        default="out",
        help="Directory containing JSON question files (default: out)",
    )

    parser.add_argument(
        "--pattern",
        type=str,
        default="*.json",
        help="Glob pattern for JSON files (default: *.json)",
    )

    parser.add_argument(
        "--mongodb-uri",
        type=str,
        help="MongoDB connection URI (default: from MONGODB_URI env var)",
    )

    parser.add_argument(
        "--database",
        type=str,
        help="Database name (default: from MONGO_DATABASE env var or 'quizling')",
    )

    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear all existing questions before loading",
    )

    parser.add_argument(
        "--create-indexes",
        action="store_true",
        help="Create database indexes for better performance",
    )

    args = parser.parse_args()

    directory = Path(args.directory)
    if not directory.exists():
        print(f"Error: Directory not found: {directory}", file=sys.stderr)
        sys.exit(1)

    if not directory.is_dir():
        print(f"Error: Not a directory: {directory}", file=sys.stderr)
        sys.exit(1)

    print(f"\nLoading questions from: {directory.absolute()}")
    questions = load_questions_from_directory(directory, args.pattern)

    if not questions:
        print("\nNo questions loaded. Exiting.")
        sys.exit(1)

    print(f"\nSuccessfully loaded {len(questions)} questions from JSON files")

    print("\nConnecting to MongoDB...")
    try:
        with MongoDBClient(
            mongodb_uri=args.mongodb_uri, database_name=args.database
        ) as db_client:
            print(f"  ✓ Connected to database: {db_client.database_name}")

            if args.clear:
                count = db_client.delete_all_questions()
                print(f"\n  Cleared {count} existing questions")

            print(f"\nInserting {len(questions)} questions into MongoDB...")
            inserted_ids = db_client.insert_questions(questions)
            print(f"  ✓ Successfully inserted {len(inserted_ids)} questions")

            if args.create_indexes:
                print("\nCreating database indexes...")
                db_client.create_indexes()
                print("  ✓ Indexes created")

            total_count = db_client.count_questions()
            print("\nSummary:")
            print(f"  Total questions in database: {total_count}")

            for difficulty in ["easy", "medium", "hard"]:
                count = len(db_client.get_questions_by_difficulty(difficulty))
                print(f"  {difficulty.capitalize()}: {count}")

    except MongoDBConnectionError as e:
        print(f"\nError: {e}", file=sys.stderr)
        print("\nMake sure MongoDB is running (try: docker-compose up -d)")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}", file=sys.stderr)
        sys.exit(1)

    print("\n✓ Questions loaded successfully!")


if __name__ == "__main__":
    main()
