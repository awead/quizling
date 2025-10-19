"""quizling.storage

Loads questions into MongoDB. Includes methods for search and retrieval.
"""

from quizling.storage.db import MongoDBClient
from quizling.storage.loader import (
    load_question_from_file,
    load_questions_from_directory,
)

__all__ = ["MongoDBClient", "load_question_from_file", "load_questions_from_directory"]
