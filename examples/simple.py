import json


from quizling.generator import QuizGenerator
from quizling.models import QuizConfig


async def main():
    config = QuizConfig(
        api_version="2024-12-01-preview",
        num_questions=2
    )
    generator = QuizGenerator(config)
    quiz_result = await generator.generate_from_file("syllabus.md")
    questions_data = [q.model_dump() for q in quiz_result.questions]
    print(json.dumps(questions_data, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

