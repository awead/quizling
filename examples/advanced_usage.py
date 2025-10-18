import asyncio


from pathlib import Path
from quizling import DifficultyLevel, QuizConfig, QuizGenerator


async def generate_focused_quiz() -> None:
    config = QuizConfig(
        api_version="2024-12-01-preview",
        num_questions=3,
        difficulty=DifficultyLevel.HARD,
        include_explanations=True,
        topic_focus="machine learning frameworks",
    )

    generator = QuizGenerator(config)

    text_content = """
    Machine learning is a subset of artificial intelligence that focuses on
    building systems that learn from data. Popular frameworks include TensorFlow,
    developed by Google, and PyTorch, developed by Facebook's AI Research lab.

    TensorFlow offers a comprehensive ecosystem for production deployment,
    including TensorFlow Serving for model serving and TensorFlow Lite for
    mobile and embedded devices. PyTorch is known for its dynamic computation
    graph and is widely used in research due to its flexibility and ease of use.

    Scikit-learn is another popular library, focused on classical machine learning
    algorithms like decision trees, random forests, and support vector machines.
    It provides a consistent API and is excellent for beginners.
    """

    print("Generating focused quiz on machine learning frameworks...")
    result = await generator.generate_from_text(text_content)

    print(f"\nGenerated {result.num_questions} questions")
    print(f"Topic Focus: {result.config.topic_focus}")
    print(f"Difficulty: {result.config.difficulty.value}\n")

    for i, question in enumerate(result.questions, 1):
        print(f"Question {i}: {question.question}")
        print(f"Correct Answer: {question.correct_answer}")
        print()


async def generate_multiple_difficulty_levels() -> None:
    content = """
    Climate change refers to long-term shifts in global temperatures and weather
    patterns. While climate change is a natural phenomenon, scientific evidence
    shows that human activities have been the dominant cause of warming since
    the mid-20th century, primarily through the burning of fossil fuels.

    The greenhouse effect is a natural process where certain gases in Earth's
    atmosphere trap heat. Carbon dioxide, methane, and nitrous oxide are the
    primary greenhouse gases. When we burn fossil fuels, we release more of
    these gases, intensifying the greenhouse effect and causing global warming.
    """

    for difficulty in [
        DifficultyLevel.EASY,
        DifficultyLevel.MEDIUM,
        DifficultyLevel.HARD,
    ]:
        config = QuizConfig(
            api_version="2024-12-01-preview",
            num_questions=2,
            difficulty=difficulty,
            include_explanations=False,
        )

        generator = QuizGenerator(config)
        result = await generator.generate_from_text(content)

        print(f"\n{difficulty.value.upper()} DIFFICULTY QUESTIONS:")
        print("=" * 60)
        for question in result.questions:
            print(f"- {question.question}")
        print()


async def batch_process_files() -> None:
    files_to_process = [
        "document1.txt",
        "document2.pdf",
        "document3.md",
    ]

    config = QuizConfig(
        api_version="2024-12-01-preview",
        num_questions=3,
        difficulty=DifficultyLevel.MEDIUM,
        include_explanations=True,
    )

    generator = QuizGenerator(config)

    results = []
    for file_path in files_to_process:
        if not Path(file_path).exists():
            print(f"Skipping {file_path} (file not found)")
            continue

        print(f"Processing {file_path}...")
        try:
            result = await generator.generate_from_file(file_path)
            results.append(result)
            print(f"  Generated {result.num_questions} questions")
        except Exception as e:
            print(f"  Error: {e}")

    print(f"\nSuccessfully processed {len(results)} files")


async def main() -> None:
    """Run all advanced examples."""
    print("EXAMPLE 1: Focused Quiz Generation")
    print("=" * 80)
    await generate_focused_quiz()

    print("\n\nEXAMPLE 2: Multiple Difficulty Levels")
    print("=" * 80)
    await generate_multiple_difficulty_levels()

    print("\n\nEXAMPLE 3: Batch Processing")
    print("=" * 80)
    print("(Skipping batch processing - add your own files to test)")


if __name__ == "__main__":
    asyncio.run(main())
