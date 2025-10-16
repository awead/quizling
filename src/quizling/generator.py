"""Quiz generator using PydanticAI and Azure OpenAI."""

import json
from pathlib import Path
from typing import Any

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.azure import AzureProvider

from quizling.file_reader import FileReaderFactory
from quizling.models import (
    AnswerOption,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)


class QuizGenerator:
    """Generate multiple choice questions from documents using Azure OpenAI.

    This class uses PydanticAI to interact with Azure OpenAI's GPT-4o-mini
    deployment to generate well-structured multiple choice questions from
    various document formats.

    Example:
        ```python
        from quizling import QuizGenerator, QuizConfig, DifficultyLevel

        config = QuizConfig(
            num_questions=5,
            difficulty=DifficultyLevel.MEDIUM,
            azure_endpoint="https://your-resource.openai.azure.com",
            azure_api_key="your-api-key",
            azure_deployment_name="gpt-4o-mini",
        )

        generator = QuizGenerator(config)
        result = await generator.generate_from_file("document.pdf")

        for question in result.questions:
            print(question.question)
            for option in question.options:
                print(f"  {option.label}. {option.text}")
        ```
    """

    def __init__(self, config: QuizConfig):
        """Initialize the quiz generator.

        Args:
            config: Configuration object containing Azure OpenAI credentials
                   and quiz generation settings
        """
        self.config = config
        self._agent = self._create_agent()

    def _create_agent(self) -> Agent[None, list[MultipleChoiceQuestion]]:
        """Create a PydanticAI agent configured for Azure OpenAI.

        Returns:
            Configured PydanticAI Agent instance

        Raises:
            ValueError: If configuration is invalid
        """
        azure_provider = AzureProvider(
            azure_endpoint=self.config.azure_endpoint,
            api_key=self.config.azure_api_key,
            api_version=self.config.api_version,
        )

        model = OpenAIChatModel(
            model_name=self.config.azure_deployment_name,
            provider=azure_provider,
        )

        system_prompt = self._build_system_prompt()

        agent: Agent[None, list[MultipleChoiceQuestion]] = Agent(
            model=model,
            output_type=list[MultipleChoiceQuestion],
            system_prompt=system_prompt,
        )

        return agent

    def _build_system_prompt(self) -> str:
        """Build the system prompt for the AI agent.

        Returns:
            System prompt string with instructions for question generation
        """
        explanation_instruction = (
            "Include a detailed explanation for each correct answer."
            if self.config.include_explanations
            else "Do not include explanations."
        )

        topic_instruction = (
            f"Focus specifically on topics related to: {self.config.topic_focus}"
            if self.config.topic_focus
            else "Cover various important topics from the content."
        )

        return f"""You are an expert educator and question writer. Your task is to create
high-quality multiple choice questions based on provided content.

Requirements:
- Generate exactly {self.config.num_questions} multiple choice questions
- Each question must have exactly 4 answer options (A, B, C, D)
- Questions should be at {self.config.difficulty.value} difficulty level
- Ensure questions test understanding, not just memorization
- Make incorrect options plausible but clearly wrong
- {explanation_instruction}
- {topic_instruction}

Format each question as a JSON object with:
- question: Clear, specific question text
- options: Array of 4 objects with label (A/B/C/D) and text
- correct_answer: The label of the correct option (A/B/C/D)
- explanation: Why the correct answer is right (if requested)
- difficulty: The difficulty level of the question

Ensure questions are well-distributed across the content and avoid overlap."""

    async def generate_from_file(self, file_path: str | Path) -> QuizResult:
        """Generate multiple choice questions from a file.

        Args:
            file_path: Path to the file to generate questions from.
                      Supports .txt, .md, .pdf, and .docx formats.

        Returns:
            QuizResult containing the generated questions and metadata

        Raises:
            FileNotFoundError: If the file does not exist
            ValueError: If the file format is not supported or content is too short
            Exception: If there is an error during generation
        """
        path = Path(file_path)

        content = FileReaderFactory.read_file(path)

        if len(content.strip()) < 100:
            raise ValueError(
                f"File content is too short to generate questions. "
                f"Minimum 100 characters required, got {len(content)}"
            )

        questions = await self._generate_questions(content)

        return QuizResult(
            questions=questions,
            source_file=str(path.absolute()),
            config=self.config,
        )

    async def generate_from_text(self, text: str) -> QuizResult:
        """Generate multiple choice questions from text content.

        Args:
            text: Text content to generate questions from

        Returns:
            QuizResult containing the generated questions and metadata

        Raises:
            ValueError: If text is too short
            Exception: If there is an error during generation
        """
        if len(text.strip()) < 100:
            raise ValueError(
                f"Text content is too short to generate questions. "
                f"Minimum 100 characters required, got {len(text)}"
            )

        questions = await self._generate_questions(text)

        return QuizResult(
            questions=questions,
            source_file="<text input>",
            config=self.config,
        )

    async def _generate_questions(
        self, content: str
    ) -> list[MultipleChoiceQuestion]:
        """Generate questions using the PydanticAI agent.

        Args:
            content: Text content to generate questions from

        Returns:
            List of generated MultipleChoiceQuestion objects

        Raises:
            Exception: If there is an error during generation
        """
        prompt = f"""Based on the following content, generate {self.config.num_questions}
multiple choice questions at {self.config.difficulty.value} difficulty level.

Content:
{content}

Generate the questions following the specified format and requirements."""

        try:
            result = await self._agent.run(prompt)
            return result.data
        except Exception as e:
            raise Exception(f"Error generating questions: {str(e)}") from e

    def export_to_json(self, result: QuizResult, output_path: str | Path) -> None:
        """Export quiz result to a JSON file.

        Args:
            result: QuizResult to export
            output_path: Path where the JSON file should be written

        Raises:
            IOError: If there is an error writing the file
        """
        output_path = Path(output_path)

        data = {
            "source_file": result.source_file,
            "num_questions": result.num_questions,
            "difficulty": result.config.difficulty.value,
            "questions": [
                {
                    "question": q.question,
                    "options": [
                        {"label": opt.label, "text": opt.text} for opt in q.options
                    ],
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                    "difficulty": q.difficulty.value,
                }
                for q in result.questions
            ],
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def format_quiz_text(self, result: QuizResult) -> str:
        """Format quiz result as human-readable text.

        Args:
            result: QuizResult to format

        Returns:
            Formatted quiz as a string
        """
        lines = [
            f"Quiz from: {result.source_file}",
            f"Number of questions: {result.num_questions}",
            f"Difficulty: {result.config.difficulty.value}",
            "=" * 80,
            "",
        ]

        for i, question in enumerate(result.questions, 1):
            lines.append(f"Question {i}:")
            lines.append(question.question)
            lines.append("")

            for option in question.options:
                marker = "[X]" if option.label == question.correct_answer else "[ ]"
                lines.append(f"  {option.label}. {option.text} {marker}")

            lines.append("")

            if question.explanation:
                lines.append(f"Explanation: {question.explanation}")
                lines.append("")

            lines.append("-" * 80)
            lines.append("")

        return "\n".join(lines)
