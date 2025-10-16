"""Basic usage example for Quizling quiz generator."""

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from quizling import DifficultyLevel, QuizConfig, QuizGenerator


async def main() -> None:
    """Demonstrate basic usage of QuizGenerator."""
    load_dotenv()

    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

    if not azure_endpoint or not azure_api_key:
        raise ValueError(
            "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY "
            "environment variables"
        )

    config = QuizConfig(
        num_questions=5,
        difficulty=DifficultyLevel.MEDIUM,
        include_explanations=True,
        azure_endpoint=azure_endpoint,
        azure_api_key=azure_api_key,
        azure_deployment_name=azure_deployment,
    )

    generator = QuizGenerator(config)

    file_path = "sample_document.txt"

    if not Path(file_path).exists():
        print(f"Creating sample document at {file_path}")
        sample_content = """
        Python is a high-level, interpreted programming language known for its
        clear syntax and readability. Created by Guido van Rossum and first
        released in 1991, Python emphasizes code readability with its notable
        use of significant whitespace.

        Python supports multiple programming paradigms, including procedural,
        object-oriented, and functional programming. It features a dynamic type
        system and automatic memory management. Python has a comprehensive
        standard library, often described as having a "batteries included"
        philosophy.

        The language is widely used in web development, data science, artificial
        intelligence, scientific computing, and automation. Popular frameworks
        include Django and Flask for web development, NumPy and Pandas for data
        analysis, and TensorFlow and PyTorch for machine learning.

        Python uses an interpreter which allows for quick development and testing
        of code. The Python Package Index (PyPI) hosts over 400,000 third-party
        packages that extend Python's functionality for various use cases.
        """
        with open(file_path, "w") as f:
            f.write(sample_content)

    print(f"Generating quiz from {file_path}...")
    result = await generator.generate_from_file(file_path)

    print(f"\nSuccessfully generated {result.num_questions} questions!")
    print("\n" + "=" * 80)

    for i, question in enumerate(result.questions, 1):
        print(f"\nQuestion {i}: {question.question}")
        print(f"Difficulty: {question.difficulty.value}")
        print("\nOptions:")
        for option in question.options:
            marker = "✓" if option.label == question.correct_answer else " "
            print(f"  [{marker}] {option.label}. {option.text}")

        if question.explanation:
            print(f"\nExplanation: {question.explanation}")

        print("\n" + "-" * 80)

    output_json = "quiz_output.json"
    generator.export_to_json(result, output_json)
    print(f"\nQuiz exported to {output_json}")

    output_txt = "quiz_output.txt"
    with open(output_txt, "w") as f:
        f.write(generator.format_quiz_text(result))
    print(f"Quiz formatted text saved to {output_txt}")


if __name__ == "__main__":
    asyncio.run(main())
