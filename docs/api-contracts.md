# API Contracts

**Generated:** 2026-09-22
**Base implementation:** `backend/src/quizling/api/` (FastAPI). All endpoints are read-only (`GET`).
**Docs at runtime:** Swagger UI `/docs`, ReDoc `/redoc`, OpenAPI schema `/openapi.json`.

## Authentication

None. All endpoints are unauthenticated.

## Health Endpoints (`app.py`)

### `GET /`

Root health check.

**Response 200:**
```json
{ "status": "healthy", "service": "Quizling API" }
```

### `GET /health`

**Response 200:**
```json
{ "status": "healthy" }
```

## Questions Endpoints (`router.py`, prefix `/questions`)

### `GET /questions`

Retrieve questions with optional filtering and cursor-based pagination.

**Query Parameters:**

| Param | Type | Constraints | Description |
|---|---|---|---|
| `difficulty` | string | optional | `easy` \| `medium` \| `hard` |
| `search` | string | optional | Substring/text search against question text |
| `cursor` | int | optional, `>= 0`, default `0` | Skip offset |
| `limit` | int | optional, `1..100`, default `20` | Page size |

**Response 200** (`PaginatedResponse`):
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "question": "What is 2+2?",
      "options": [
        {"label": "A", "text": "3"},
        {"label": "B", "text": "4"},
        {"label": "C", "text": "5"},
        {"label": "D", "text": "6"}
      ],
      "correct_answer": "B",
      "explanation": "2+2=4",
      "difficulty": "easy"
    }
  ],
  "next_cursor": "20",
  "has_more": true,
  "total": 100
}
```

**Response 500** (`ErrorResponse`): `{"detail": "..."}`

**Filtering behavior** (`QuestionService`, `api/services.py`):
- `difficulty` and `search` together: searches text first, then filters results in-memory by difficulty.
- `difficulty` only: queries MongoDB by difficulty field.
- `search` only: MongoDB case-insensitive regex match (`$regex`, `$options: "i"`) on `question`.
- Neither: paginated `find()` over all questions, and `total` reflects `count_documents({})`; when filters are
  active, `total` is the length of the filtered in-memory result set instead.
- Pagination detection: the service internally fetches `limit + 1` rows; if more than `limit` come back,
  `has_more=true` and `next_cursor` = `cursor + limit`.

### `GET /questions/{question_id}`

Retrieve a single question by its MongoDB ObjectId.

**Path Parameters:** `question_id` — MongoDB ObjectId string.

**Response 200** (`QuestionResponse`):
```json
{ "data": { "id": "...", "question": "...", "options": [...], "correct_answer": "B", "explanation": "...", "difficulty": "easy" } }
```

**Response 404** (`ErrorResponse`): question not found (raised as `ResourceNotFoundError`).
**Response 400** (implicit, via `InvalidObjectIdError`): malformed ObjectId string.
**Response 500** (`ErrorResponse`): unexpected database error.

## Error Model

All custom exceptions extend `QuizlingAPIException` (`api/exceptions.py`) and are converted to
`{"detail": message, ...details}` JSON responses by handlers in `api/error_handlers.py`:

| Exception | HTTP Status | Notes |
|---|---|---|
| `DatabaseError` | 500 | Wraps unexpected DB/query failures; includes `operation` detail |
| `ResourceNotFoundError` | 404 | Includes `resource_type`, `resource_id` |
| `InvalidObjectIdError` | 400 | Includes `provided_id` |
| `ValidationError` | 422 | Defined but not currently raised by any route |
| `MongoDBConnectionError` (not a `QuizlingAPIException`) | 503 | Raised when `MongoDBClient` can't connect; handled separately |
| Generic `pymongo.errors.PyMongoError` | 500 | Caught by a dedicated handler |
| Any other unhandled `Exception` | 500 | Generic fallback handler, logged via `logger.exception` |

## Frontend Client Contract

`frontend/src/api/` consumes this API with a matching typed contract:
- `frontend/src/types/api.ts` mirrors `PaginatedResponse`, `QuestionResponse`, `ErrorResponse`, plus a
  frontend-only `QuestionQueryParams` / `QuestionFilters` used for building requests and UI filter state.
- `frontend/src/types/models.ts` mirrors `MultipleChoiceQuestion` / `AnswerOption` / `DifficultyLevel`.
- `frontend/src/api/questions.ts` wraps the two endpoints: `fetchQuestions(params, {signal})`,
  `fetchQuestionById(id, {signal})`, plus `healthCheck()` against `/health`.
- Errors from axios are normalized into a single `ApiError` type (`frontend/src/api/errors.ts`) in the client's
  response interceptor, regardless of whether the failure was an HTTP error response, a network error, or a
  request-configuration error.
