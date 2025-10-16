"""Quizling: Generate multiple choice questions from documents using Azure OpenAI."""

from quizling.generator import QuizGenerator
from quizling.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)

__version__ = "0.1.0"

__all__ = [
    "QuizGenerator",
    "AnswerOption",
    "DifficultyLevel",
    "MultipleChoiceQuestion",
    "QuizConfig",
    "QuizResult",
]
