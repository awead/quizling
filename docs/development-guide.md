# Development Guide

**Generated:** 2026-09-22

## Prerequisites

- Python >= 3.12
- [`uv`](https://docs.astral.sh/uv/) for backend package management
- Node.js (CI tests against 22 and 24)
- Docker + Docker Compose (for MongoDB, or for running the full stack)
- An Azure OpenAI resource (endpoint, API key, deployment name) — required only for the question-generation CLI

## Backend Setup

```bash
cd backend
uv sync                       # install dependencies (including dev group)
cp .env.example .env          # then fill in AZURE_OPENAI_* and MongoDB values
```

`.env` variables (see `backend/.env.example`):

```env
AZURE_OPENAI_ENDPOINT=your-endpoint-here
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
MONGO_DATABASE=quizling
MONGODB_URI=mongodb://admin:password@localhost:27017/quizling
```

Note: `QuizConfig` (`backend/src/quizling/base/models.py`) reads `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`,
`AZURE_OPENAI_DEPLOYMENT`, and `AZURE_OPENAI_VERSION` directly from `os.environ` at class-definition time — these
must be set before importing `quizling.base`. `MongoDBClient` (`storage/db.py`) requires `MONGODB_URI` and
`MONGO_DATABASE` similarly.

### Running MongoDB locally

```bash
docker-compose up -d mongodb
```

### Generating and loading quiz questions (CLI)

```bash
# Generate questions from a document
uv run python -m quizling document.pdf -n 10 -d medium -o out

# Load the generated JSON files into MongoDB
uv run python -m quizling.storage out --create-indexes
```

### Running the API

```bash
make api
# equivalent to: uv run uvicorn quizling.api.app:app --reload
```

API available at `http://localhost:8000` (Swagger UI at `/docs`, ReDoc at `/redoc`).

### Backend Tests

```bash
make test        # uv run pytest tests/ -v
make test-cov     # + coverage (terminal + htmlcov/ + coverage.xml)
```

### Backend Lint/Format

```bash
uv run ruff check .
uv run ruff format .
```

## Frontend Setup

```bash
cd frontend
npm install
```

Environment files already present in the repo: `.env.development` / `.env.production` set
`VITE_API_BASE_URL=/api`, `VITE_API_TIMEOUT=10000`, `VITE_QUESTIONS_PER_PAGE=20`.

### Running the dev server

```bash
npm run dev
```

Vite dev server runs on port 3000 and proxies `/api/*` to `http://localhost:8000` (see `vite.config.ts`) — so the
backend API must be running separately for the frontend to fetch real data.

### Frontend Tests

```bash
npm run test          # vitest (watch mode)
npm run test:run       # vitest run (CI mode)
npm run test:coverage  # vitest run --coverage
npm run test:ui        # vitest UI
```

### Frontend Build / Lint

```bash
npm run build   # tsc -b && vite build (type-checks then builds)
npm run lint     # eslint .
```

## Common Development Tasks

- **Add a new API endpoint:** add a route in `backend/src/quizling/api/router.py`, define/extend DTOs in
  `api/models.py`, put business logic in `api/services.py`, map any new failure modes in `api/exceptions.py` +
  `api/error_handlers.py`.
- **Add a new frontend page:** create it under `frontend/src/pages/`, lazy-import and add a `<Route>` in `App.tsx`.
- **Change the question schema:** update `backend/src/quizling/base/models.py` (`MultipleChoiceQuestion`) and then
  manually mirror the change in `frontend/src/types/models.ts` (there is no code generation between the two).
- **Regenerate quiz content:** run the CLI generation + loader commands above against a new source document.

## CI

- `.github/workflows/test-backend.yml`: matrix over Python 3.11/3.12, `uv sync` + `uv run pytest`, with
  placeholder Azure/Mongo env vars (no real external services are hit in backend tests).
- `.github/workflows/test-frontend.yml`: matrix over Node 22/24, `npm ci`, `npm run build` (type-check),
  `npm run test:run`, `npm run test:coverage`, coverage uploaded as a build artifact.
