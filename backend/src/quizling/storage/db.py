import os
from types import TracebackType
from typing import TYPE_CHECKING

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient, errors

from quizling.base.models import MultipleChoiceQuestion

if TYPE_CHECKING:
    from pymongo.collection import Collection
    from pymongo.database import Database


class MongoDBConnectionError(Exception):
    pass


class MongoDBClient:
    def __init__(
        self, mongodb_uri: str | None = None, database_name: str | None = None
    ) -> None:
        self.mongodb_uri = mongodb_uri or os.environ["MONGODB_URI"]
        self.database_name = database_name or os.environ["MONGO_DATABASE"]

        try:
            self.client: MongoClient = MongoClient(
                self.mongodb_uri, serverSelectionTimeoutMS=5000
            )
            # MongoClient connects lazily; force a round trip so bad config fails here.
            self.client.server_info()
        except errors.ServerSelectionTimeoutError as e:
            msg = f"Failed to connect to MongoDB at {self.mongodb_uri}: {e}"
            raise MongoDBConnectionError(msg) from e
        except errors.ConfigurationError as e:
            msg = f"Invalid MongoDB configuration: {e}"
            raise MongoDBConnectionError(msg) from e
        except errors.OperationFailure as e:
            msg = f"Authentication failed for MongoDB at {self.mongodb_uri}: {e}"
            raise MongoDBConnectionError(msg) from e

        self.db: Database = self.client[self.database_name]
        self.questions: Collection = self.db["questions"]

    def close(self) -> None:
        """Close the underlying MongoDB connection."""
        if hasattr(self, "client"):
            self.client.close()

    def __enter__(self) -> "MongoDBClient":
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        self.close()

    def insert_question(self, question: MultipleChoiceQuestion) -> str:
        """Insert one question and return its new ObjectId as a string."""
        question_dict = question.model_dump(exclude={"id"})
        result = self.questions.insert_one(question_dict)
        return str(result.inserted_id)

    def insert_questions(self, questions: list[MultipleChoiceQuestion]) -> list[str]:
        """Insert questions and return their new ObjectIds as strings.

        Every call inserts new documents; existing duplicates are not detected.
        """
        if not questions:
            return []

        question_dicts = [q.model_dump(exclude={"id"}) for q in questions]
        result = self.questions.insert_many(question_dicts)
        return [str(oid) for oid in result.inserted_ids]

    def get_question(self, question_id: str) -> MultipleChoiceQuestion | None:
        """Fetch a question by ObjectId, or None if no question has that id.

        Raises bson.errors.InvalidId if question_id is not a valid ObjectId.
        """
        doc = self.questions.find_one({"_id": ObjectId(question_id)})
        if doc is None:
            return None
        doc["id"] = str(doc.pop("_id"))
        return MultipleChoiceQuestion(**doc)

    def get_questions_by_difficulty(
        self, difficulty: str
    ) -> list[MultipleChoiceQuestion]:
        """Fetch every question at the given difficulty."""
        docs = self.questions.find({"difficulty": difficulty})
        questions = []
        for doc in docs:
            doc["id"] = str(doc.pop("_id"))
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def get_all_questions(
        self, limit: int | None = None, skip: int = 0
    ) -> list[MultipleChoiceQuestion]:
        """Fetch up to `limit` questions in storage order, after skipping `skip`."""
        cursor = self.questions.find().skip(skip)
        if limit is not None:
            cursor = cursor.limit(limit)

        questions = []
        for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def search_questions(self, search_text: str) -> list[MultipleChoiceQuestion]:
        """Fetch questions whose text matches search_text (case-insensitive regex)."""
        docs = self.questions.find(
            {"question": {"$regex": search_text, "$options": "i"}}
        )
        questions = []
        for doc in docs:
            doc["id"] = str(doc.pop("_id"))
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def count_questions(self) -> int:
        """Count all stored questions."""
        return self.questions.count_documents({})

    def delete_question(self, question_id: str) -> bool:
        """Delete a question by ObjectId; False if the id is invalid or not found."""
        try:
            object_id = ObjectId(question_id)
        except InvalidId:
            return False
        result = self.questions.delete_one({"_id": object_id})
        return result.deleted_count > 0

    def delete_all_questions(self) -> int:
        """Delete every question and return how many were removed."""
        result = self.questions.delete_many({})
        return result.deleted_count

    def create_indexes(self) -> None:
        """Create the difficulty index and the question-text search index."""
        self.questions.create_index("difficulty")
        self.questions.create_index([("question", "text")])
