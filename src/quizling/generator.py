from openai import AsyncAzureOpenAI
from pathlib import Path
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from quizling.file_reader import FileReaderFactory
from quizling.models import (
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)
from textwrap import dedent


class QuizGenerator:
    MIN_CONTENT_LENGTH = (
        100  # Minimum characters needed for meaningful question generation
    )

    def __init__(self, config: QuizConfig):
        self.config = config
        self._agent = self._create_agent()

    def _create_agent(self) -> Agent[None, list[MultipleChoiceQuestion]]:
        client = AsyncAzureOpenAI(
            api_key=self.config.azure_api_key,
            api_version=self.config.api_version,
            azure_endpoint=self.config.azure_endpoint,
        )

        model = OpenAIChatModel(
            self.config.azure_deployment_name,
            provider=OpenAIProvider(openai_client=client),
        )

        system_prompt = self._build_system_prompt()

        return Agent(
            model,
            system_prompt=system_prompt,
            output_type=list[MultipleChoiceQuestion],
        )

    def _build_system_prompt(self) -> str:
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

        return dedent(f"""
            You are an expert educator and question writer. Your task is to create
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

            Ensure questions are well-distributed across the content and avoid overlap.
        """)

    def _build_agent_prompt(self, content: str) -> str:
        return dedent(f"""
            Based on the following content, generate {self.config.num_questions}
            multiple choice questions at {self.config.difficulty.value} difficulty level.

            Content:
            {content}

            Generate the questions following the specified format and requirements.
        """)

    def _validate_content_length(self, content: str) -> None:
        stripped_content = content.strip()
        if len(stripped_content) < self.MIN_CONTENT_LENGTH:
            raise ValueError(
                f"Content is too short to generate questions. "
                f"Minimum {self.MIN_CONTENT_LENGTH} characters required, "
                f"got {len(stripped_content)}"
            )

    async def generate_from_file(self, file_path: str | Path) -> QuizResult:
        path = Path(file_path)

        content = FileReaderFactory.read_file(path)
        self._validate_content_length(content)

        questions = await self._generate_questions(content)

        return QuizResult(
            questions=questions,
            source_file=str(path.absolute()),
            config=self.config,
        )

    async def generate_from_text(self, text: str) -> QuizResult:
        self._validate_content_length(text)

        questions = await self._generate_questions(text)

        return QuizResult(
            questions=questions,
            source_file="<text input>",
            config=self.config,
        )

    async def _generate_questions(self, content: str) -> list[MultipleChoiceQuestion]:
        prompt = self._build_agent_prompt(content)

        try:
            result = await self._agent.run(prompt)
            return result.output
        except Exception as e:
            raise Exception(f"Error generating questions: {str(e)}") from e
