import os
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AnswerOption(BaseModel):
    text: str = Field(description="The answer option text", min_length=1)

    is_correct: bool = Field(description="Whether this option is a correct answer")


class MultipleChoiceQuestion(BaseModel):
    id: str | None = Field(
        default=None, description="Optional unique identifier for the question"
    )

    question: str = Field(description="The question text", min_length=1)

    options: list[AnswerOption] = Field(
        description="Four answer options, exactly one of which is correct",
        min_length=4,
        max_length=4,
    )

    explanation: str | None = Field(
        default=None, description="Optional explanation of the correct answer"
    )

    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM, description="Question difficulty level"
    )

    @field_validator("options")
    @classmethod
    def validate_single_correct_option(
        cls, options: list[AnswerOption]
    ) -> list[AnswerOption]:
        correct_count = sum(option.is_correct for option in options)

        if correct_count != 1:
            raise ValueError(
                f"Options must have exactly one correct option. Got: {correct_count}"
            )

        return options


class QuizConfig(BaseModel):
    num_questions: int = Field(
        default=5, ge=1, le=50, description="Number of questions to generate"
    )

    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM,
        description="Default difficulty level for questions",
    )

    include_explanations: bool = Field(
        default=True, description="Whether to include explanations for answers"
    )

    topic_focus: str | None = Field(
        default=None,
        description="Optional specific topic to focus on within the content",
    )

    output_directory: str = Field(
        default="out",
        description="Directory where quiz JSON files will be written",
    )

    azure_endpoint: str = Field(
        default=os.environ["AZURE_OPENAI_ENDPOINT"],
        description="Azure OpenAI endpoint URL",
    )

    azure_api_key: str = Field(
        default=os.environ["AZURE_OPENAI_KEY"], description="Azure OpenAI API key"
    )

    azure_deployment_name: str = Field(
        default=os.environ["AZURE_OPENAI_DEPLOYMENT"],
        description="Azure OpenAI deployment name",
    )

    api_version: str = Field(
        default=os.environ["AZURE_OPENAI_VERSION"],
        description="Azure OpenAI API version",
    )


class QuizResult(BaseModel):
    questions: list[MultipleChoiceQuestion] = Field(
        description="List of generated questions"
    )

    source_file: str = Field(description="Path to the source file used for generation")

    config: QuizConfig = Field(description="Configuration used for generation")

    @property
    def num_questions(self) -> int:
        return len(self.questions)
