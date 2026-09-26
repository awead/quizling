# Architecture

**Generated:** 2026-09-22

## Executive Summary

Quizling is composed of two independently deployable apps that share a data contract through MongoDB and a
mirrored TypeScript/Pydantic type model:

1. **`backend/`** — a Python package (`quizling`) with three responsibilities: generate questions from documents
   via Azure OpenAI (CLI), load generated JSON into MongoDB (CLI), and serve questions via a FastAPI REST API.
2. **`frontend/`** — a React SPA that consumes the FastAPI REST API to let users browse, search, filter, and take
   quizzes.

Both are containerized and composed together with MongoDB via `docker-compose.yml`, with nginx in the frontend
container reverse-proxying `/api/*` to the backend container.

## Technology Stack

See [Project Overview](./project-overview.md#technology-stack-summary) for the full table.

## Architecture Pattern

**Backend:** layered architecture within a single FastAPI service:
- `api/` — HTTP boundary: `app.py` (FastAPI app + error handler registration), `router.py` (routes), `services.py`
  (`QuestionService`, `QuestionQueryParams`, `PaginationResult` — a small service/value-object layer), `models.py`
  (response DTOs), `exceptions.py` (`QuizlingAPIException` hierarchy), `error_handlers.py` (maps exceptions to
  `JSONResponse`s).
- `base/` — the question-generation domain: `models.py` (`MultipleChoiceQuestion`, `QuizConfig`, `QuizResult`,
  `DifficultyLevel`), `generator.py` (`QuizGenerator`, wraps a PydanticAI `Agent` configured with `AsyncAzureOpenAI`),
  `file_reader.py` (`FileReaderFactory` — strategy pattern for `.txt`/`.md`/`.pdf`/`.docx`), `quiz_writer.py`
  (`QuizWriter` — writes each question to its own JSON file).
- `storage/` — `db.py` (`MongoDBClient`, thin wrapper over `pymongo`), `loader.py` (reads JSON files into
  `MultipleChoiceQuestion` objects), `__main__.py` (CLI entry point that loads a directory of JSON files into MongoDB).

Dependency injection is done via FastAPI `Depends`: `get_db()` yields a `MongoDBClient` per-request (closed in a
`finally` block), and `get_question_service()` builds a `QuestionService` from it.

**Frontend:** component-based architecture with route-level code splitting:
- `pages/` — route targets (`HomePage`, `QuestionsPage`, `QuestionDetailPage`, `QuizPage`, `NotFoundPage`), lazy
  loaded in `App.tsx` via `React.lazy` + `Suspense`.
- `components/` — organized by domain: `common/` (Button, Card, ErrorBoundary, ErrorMessage, LoadingSpinner, icons),
  `layout/` (Header, Footer, MainLayout wrapping `<Outlet/>`), `questions/` (list, filters, search, pagination,
  card), `quiz/` (multi-step quiz flow: `QuizStart` → `QuizQuestion`/`QuizProgress`/`QuizNavigation` →
  `QuizResults`, orchestrated by `QuizInterface`).
- `hooks/` — encapsulate state + data fetching: `useQuestions` (list w/ filters, pagination, abort-on-unmount),
  `useQuestion` (single question), `useQuiz` (quiz session state machine: not-started → in-progress → complete,
  per-quiz option shuffling, answer tracking via a `Map<questionId, UserAnswer>`, scoring), `useDebounce`, `useFocusOnMount`.
- `api/` — `client.ts` (axios instance with request/response interceptors, env-driven `baseURL`/timeout, wraps
  errors in a custom `ApiError`), `endpoints.ts` (route constants), `questions.ts` (`fetchQuestions`,
  `fetchQuestionById`, `healthCheck`), `errors.ts`.
- `types/` — `models.ts` and `api.ts` deliberately mirror the backend Pydantic models (comments reference the
  backend source files), keeping the two sides of the contract in sync manually.

**State management:** no global state library — state lives in local component state and custom hooks
(`useQuestions`, `useQuiz`), which is sufficient given the app is read-only against the API (no writes from the
frontend).

## Data Architecture

See [Data Models](./data-models.md). MongoDB is the single source of truth; a `questions` collection stores
documents shaped like `MultipleChoiceQuestion` (minus `id`, which is the Mongo `_id`). There is no formal
migration system — indexes are created ad hoc via `MongoDBClient.create_indexes()` (`difficulty` field index and a
text index on `question`).

## API Design

See [API Contracts](./api-contracts.md). The API is read-only (`GET` only) — there are no write endpoints; data is
populated out-of-band by the CLI generation + loading pipeline.

## Component Overview

See [Component Inventory](./component-inventory.md) for the full frontend component catalog.

## Source Tree

See [Source Tree Analysis](./source-tree-analysis.md).

## Development Workflow

See [Development Guide](./development-guide.md).

## Deployment Architecture

See [Deployment Guide](./deployment-guide.md). Three Docker Compose services: `mongodb` (official `mongo:7.0`
image with named volumes), `backend` (Python 3.12-slim + `uv`, runs `uvicorn quizling.api.app:app`), `frontend`
(multi-stage build: `node:20-alpine` builds the Vite bundle, `nginx:alpine` serves it and reverse-proxies `/api/`
to the backend service).

## Testing Strategy

- **Backend:** pytest + pytest-asyncio, one test module per source module under `backend/tests/quizling/`
  (mirrors `backend/src/quizling/` structure: `api/`, `base/`, `storage/`), plus `test_main.py`. Coverage via
  `pytest-cov` (`make test-cov`, HTML report in `htmlcov/`). CI runs the matrix across Python 3.11 and 3.12.
- **Frontend:** Vitest + `@testing-library/react` + `msw` for API mocking, colocated `*.test.ts(x)` files next to
  source files, shared setup in `src/test/setup.ts` and `src/test/test-utils.tsx`, fixtures in `src/test/factories.ts`.
  CI runs `npm run build` (type-check), `npm run test:run`, and `npm run test:coverage` across Node 22 and 24.

## Security / Auth Notes

No authentication or authorization is implemented anywhere in the stack. The axios client (`frontend/src/api/client.ts`)
has a commented-out placeholder for future bearer-token injection, and the API has no auth middleware or guards.
Azure OpenAI and MongoDB credentials are supplied purely via environment variables (root `mise.toml` `[env]`,
Docker Compose `environment:`).
