"""quizling.base

Includes primary models, classes, and functions for generating multiple choice questions from text-based
documents using OpenAI.
"""

from quizling.base.generator import QuizGenerator
from quizling.base.models import (
    AnswerOption,
    DifficultyLevel,
    MultipleChoiceQuestion,
    QuizConfig,
    QuizResult,
)

__all__ = [
    "QuizGenerator",
    "AnswerOption",
    "DifficultyLevel",
    "MultipleChoiceQuestion",
    "QuizConfig",
    "QuizResult",
]
