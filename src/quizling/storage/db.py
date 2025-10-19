import os

from pymongo import MongoClient, errors
from pymongo.collection import Collection
from pymongo.database import Database

from quizling.models import MultipleChoiceQuestion


class MongoDBConnectionError(Exception):
    pass


class MongoDBClient:
    def __init__(
        self, mongodb_uri: str | None = None, database_name: str | None = None
    ):
        self.mongodb_uri = mongodb_uri or os.environ["MONGODB_URI"]
        self.database_name = database_name or os.environ["MONGO_DATABASE"]

        try:
            self.client: MongoClient = MongoClient(
                self.mongodb_uri, serverSelectionTimeoutMS=5000
            )
            # Test connection
            self.client.server_info()
        except errors.ServerSelectionTimeoutError as e:
            raise MongoDBConnectionError(
                f"Failed to connect to MongoDB at {self.mongodb_uri}: {e}"
            ) from e
        except errors.ConfigurationError as e:
            raise MongoDBConnectionError(f"Invalid MongoDB configuration: {e}") from e
        except errors.OperationFailure as e:
            raise MongoDBConnectionError(
                f"Authentication failed for MongoDB at {self.mongodb_uri}: {e}"
            ) from e

        self.db: Database = self.client[self.database_name]
        self.questions: Collection = self.db["questions"]

    def close(self) -> None:
        if hasattr(self, "client"):
            self.client.close()

    def __enter__(self) -> "MongoDBClient":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    def insert_question(self, question: MultipleChoiceQuestion) -> str:
        question_dict = question.model_dump()
        result = self.questions.insert_one(question_dict)
        return str(result.inserted_id)

    def insert_questions(self, questions: list[MultipleChoiceQuestion]) -> list[str]:
        if not questions:
            return []

        question_dicts = [q.model_dump() for q in questions]
        result = self.questions.insert_many(question_dicts)
        return [str(oid) for oid in result.inserted_ids]

    def get_question(self, question_id: str) -> MultipleChoiceQuestion | None:
        from bson import ObjectId

        try:
            doc = self.questions.find_one({"_id": ObjectId(question_id)})
            if doc:
                # Remove MongoDB's _id field before creating model
                doc.pop("_id", None)
                return MultipleChoiceQuestion(**doc)
            return None
        except Exception:
            return None

    def get_questions_by_difficulty(
        self, difficulty: str
    ) -> list[MultipleChoiceQuestion]:
        docs = self.questions.find({"difficulty": difficulty})
        questions = []
        for doc in docs:
            doc.pop("_id", None)
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def get_all_questions(
        self, limit: int | None = None, skip: int = 0
    ) -> list[MultipleChoiceQuestion]:
        cursor = self.questions.find().skip(skip)
        if limit is not None:
            cursor = cursor.limit(limit)

        questions = []
        for doc in cursor:
            doc.pop("_id", None)
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def search_questions(self, search_text: str) -> list[MultipleChoiceQuestion]:
        docs = self.questions.find(
            {"question": {"$regex": search_text, "$options": "i"}}
        )
        questions = []
        for doc in docs:
            doc.pop("_id", None)
            questions.append(MultipleChoiceQuestion(**doc))
        return questions

    def count_questions(self) -> int:
        return self.questions.count_documents({})

    def delete_question(self, question_id: str) -> bool:
        from bson import ObjectId

        try:
            result = self.questions.delete_one({"_id": ObjectId(question_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def delete_all_questions(self) -> int:
        result = self.questions.delete_many({})
        return result.deleted_count

    def create_indexes(self) -> None:
        self.questions.create_index("difficulty")
        self.questions.create_index([("question", "text")])
