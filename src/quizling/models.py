"""Pydantic models for quiz generation."""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class DifficultyLevel(str, Enum):
    """Difficulty levels for quiz questions."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AnswerOption(BaseModel):
    """A single answer option for a multiple choice question."""

    label: Literal["A", "B", "C", "D"] = Field(
        description="The option label (A, B, C, or D)"
    )
    text: str = Field(description="The answer option text", min_length=1)


class MultipleChoiceQuestion(BaseModel):
    """A multiple choice question with four options."""

    question: str = Field(description="The question text", min_length=1)
    options: list[AnswerOption] = Field(
        description="Four answer options labeled A through D", min_length=4, max_length=4
    )
    correct_answer: Literal["A", "B", "C", "D"] = Field(
        description="The label of the correct answer"
    )
    explanation: str | None = Field(
        default=None, description="Optional explanation of the correct answer"
    )
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM, description="Question difficulty level"
    )

    @field_validator("options")
    @classmethod
    def validate_options_labels(cls, options: list[AnswerOption]) -> list[AnswerOption]:
        """Validate that options have correct labels A, B, C, D."""
        expected_labels = {"A", "B", "C", "D"}
        actual_labels = {option.label for option in options}

        if actual_labels != expected_labels:
            raise ValueError(
                f"Options must have labels A, B, C, D. Got: {actual_labels}"
            )

        sorted_options = sorted(options, key=lambda x: x.label)
        return sorted_options

    @field_validator("correct_answer")
    @classmethod
    def validate_correct_answer(cls, correct_answer: str) -> str:
        """Validate that correct_answer is one of A, B, C, D."""
        if correct_answer not in {"A", "B", "C", "D"}:
            raise ValueError(f"Correct answer must be A, B, C, or D. Got: {correct_answer}")
        return correct_answer


class QuizConfig(BaseModel):
    """Configuration for quiz generation."""

    num_questions: int = Field(
        default=5, ge=1, le=50, description="Number of questions to generate"
    )
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM, description="Default difficulty level for questions"
    )
    include_explanations: bool = Field(
        default=True, description="Whether to include explanations for answers"
    )
    topic_focus: str | None = Field(
        default=None,
        description="Optional specific topic to focus on within the content",
    )
    azure_endpoint: str = Field(description="Azure OpenAI endpoint URL")
    azure_api_key: str = Field(description="Azure OpenAI API key")
    azure_deployment_name: str = Field(
        default="gpt-4o-mini", description="Azure OpenAI deployment name"
    )
    api_version: str = Field(
        default="2024-02-15-preview", description="Azure OpenAI API version"
    )


class QuizResult(BaseModel):
    """Result of quiz generation containing all questions."""

    questions: list[MultipleChoiceQuestion] = Field(
        description="List of generated questions"
    )
    source_file: str = Field(description="Path to the source file used for generation")
    config: QuizConfig = Field(description="Configuration used for generation")

    @property
    def num_questions(self) -> int:
        """Get the number of questions in the quiz."""
        return len(self.questions)
