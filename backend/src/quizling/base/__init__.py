"""Models and classes for generating multiple choice questions from documents."""

from quizling.base.generator import QuizGenerator
from quizling.base.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)

__all__ = [
    "AnswerOption",
    "DifficultyLevel",
    "MultipleChoiceQuestion",
    "QuizConfig",
    "QuizGenerator",
    "QuizResult",
]
