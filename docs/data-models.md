# Data Models

**Generated:** 2026-09-22
**Source of truth:** `backend/src/quizling/base/models.py` (Pydantic), persisted as-is into MongoDB.
**Frontend mirror:** `frontend/src/types/models.ts`, `frontend/src/types/api.ts` (hand-maintained, not generated).

## Database

- **Engine:** MongoDB 7.0
- **Database name:** value of `MONGO_DATABASE` env var (default `quizling`)
- **Collection:** `questions` (`MongoDBClient.questions`, `storage/db.py`)
- **Migrations:** none — no migration framework is used. Schema evolution is handled implicitly by Pydantic
  validation on read/write; there is no versioning of stored documents.
- **Indexes:** not created automatically. `MongoDBClient.create_indexes()` creates:
  - a single-field index on `difficulty`
  - a text index on `question`
  These are only applied when explicitly invoked (e.g., `python -m quizling.storage <dir> --create-indexes`).

## Core Entities

### `DifficultyLevel` (enum, `str`)

`easy` | `medium` | `hard`

### `AnswerOption`

| Field | Type | Constraints |
|---|---|---|
| `label` | `"A" \| "B" \| "C" \| "D"` | required |
| `text` | `str` | required, `min_length=1` |

### `MultipleChoiceQuestion`

The core persisted entity — one MongoDB document per question.

| Field | Type | Constraints / Notes |
|---|---|---|
| `id` | `str \| None` | Not stored as `_id` directly by name — `MongoDBClient` pops Mongo's `_id` and re-maps it to `id` on read; excluded on insert (`model_dump(exclude={"id"})`) so Mongo generates its own `_id`. |
| `question` | `str` | required, `min_length=1` |
| `options` | `list[AnswerOption]` | exactly 4 items (`min_length=4`, `max_length=4`); validator enforces the label set is exactly `{A, B, C, D}` and sorts options by label |
| `correct_answer` | `"A" \| "B" \| "C" \| "D"` | validated against the same label set |
| `explanation` | `str \| None` | optional |
| `difficulty` | `DifficultyLevel` | default `medium` |

### `QuizConfig` (generation-time configuration, not persisted)

| Field | Type | Default |
|---|---|---|
| `num_questions` | `int` (`1..50`) | `5` |
| `difficulty` | `DifficultyLevel` | `medium` |
| `include_explanations` | `bool` | `True` |
| `topic_focus` | `str \| None` | `None` |
| `output_directory` | `str` | `"out"` |
| `azure_endpoint` | `str` | from `AZURE_OPENAI_ENDPOINT` env var (required at import time) |
| `azure_api_key` | `str` | from `AZURE_OPENAI_KEY` env var (required at import time) |
| `azure_deployment_name` | `str` | from `AZURE_OPENAI_DEPLOYMENT` env var (required at import time) |
| `api_version` | `str` | from `AZURE_OPENAI_VERSION` env var (required at import time) |

### `QuizResult` (generation output, written to JSON — not a DB entity)

| Field | Type |
|---|---|
| `questions` | `list[MultipleChoiceQuestion]` |
| `source_file` | `str` |
| `config` | `QuizConfig` |
| `num_questions` (property) | `int` — `len(questions)` |

## Relationships

There is no relational structure — `questions` is a single flat collection with no foreign keys or embedded
references to other collections. `QuizResult`/`QuizConfig` are transient, in-process objects used during the
generation CLI run and are not stored in MongoDB (only the individual `MultipleChoiceQuestion`s are, via the
loader CLI, and only after being written to intermediate JSON files by `QuizWriter`).

## Data Flow

1. `QuizGenerator.generate_from_file()` (base/generator.py) reads a document, calls an Azure OpenAI model via a
   PydanticAI `Agent`, and returns a `QuizResult` containing `MultipleChoiceQuestion` objects.
2. `QuizWriter.write()` (base/quiz_writer.py) serializes each `MultipleChoiceQuestion` to its own
   `{uuid}.json` file in `QuizConfig.output_directory`.
3. `load_questions_from_directory()` (storage/loader.py) reads those JSON files back into
   `MultipleChoiceQuestion` objects.
4. `MongoDBClient.insert_questions()` (storage/db.py) inserts them into the `questions` collection (`id` excluded
   so MongoDB assigns `_id`).
5. The API (`QuestionService` / `MongoDBClient`) reads from `questions`, remapping `_id` → `id` on every read path
   (`get_question`, `get_questions_by_difficulty`, `get_all_questions`, `search_questions`).

## Migration Strategy

None exists. If the schema needs to change in a backward-incompatible way, existing documents in the `questions`
collection would need a one-off manual script (there is no Alembic/Flyway/`migrations/` equivalent in this repo).
