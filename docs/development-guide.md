# Development Guide

**Generated:** 2026-09-22

## Prerequisites

- [`mise`](https://mise.jdx.dev/) for runtime tool management (`python`, `node`, `uv`)
- Docker + Docker Compose (for MongoDB, or for running the full stack)
- An Azure OpenAI resource (endpoint, API key, deployment name) — required only for the question-generation CLI

Install toolchain versions from the repo root:

```bash
mise install
```

## Make Targets

There is no root `Makefile`. `backend/Makefile` and `frontend/Makefile` share target names — `install`, `test`,
`test-cov`, `lint`, `format` — plus `api`/`console` (backend) and `dev`/`build` (frontend). Run them from the app
directory or with `make -C backend <target>` / `make -C frontend <target>` from the root.

## Backend Setup

```bash
cd backend
make install                  # uv sync — install dependencies (including dev group)
```

Environment variables are defined in the repository root `mise.toml` under `[env]`:

```env
AZURE_OPENAI_ENDPOINT=https://aif-a8d20d36.cognitiveservices.azure.com
AZURE_OPENAI_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT=gpt-5.5
MONGO_DATABASE=quizling
```

`AZURE_OPENAI_KEY`, `MONGODB_URI`, and `MONGO_ROOT_PASSWORD` are deliberately absent from `mise.toml`: they live in
`fnox.toml` (the key is brokered from Key Vault; the Mongo values default to the local Compose instance), so run
commands that need them with fnox's shell integration active or under `fnox exec -- <cmd>`.

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
# Generate questions from a document (one <uuid>.json per question in out/)
fnox exec -- uv run python -m quizling document.pdf -n 10 -d medium -o out

# Load the generated JSON files into MongoDB (--clear to replace existing questions)
fnox exec -- uv run python -m quizling.storage out --create-indexes
```

Both commands need the Azure variables set, even the loader: it imports `quizling.base.models`, which reads them
when the module is imported. See the root README's "Creating Questions" section for the full walkthrough.

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
make lint     # uv run ruff check . && uv run ruff format --check .
make format   # uv run ruff format .
```

Ruff is configured in `backend/pyproject.toml` with every rule enabled (`select = ["ALL"]`, Google docstring
convention). The only rules switched off are the ones that conflict with `ruff format` or with
`docs/coding-standards.md` (no docstrings required on modules, classes, or tests), plus test-, example-, and
CLI-specific exemptions such as `assert` in tests and `print` in the CLIs. Each exemption is commented in
`pyproject.toml`.

## Frontend Setup

```bash
cd frontend
npm install
```

Frontend settings (`VITE_API_BASE_URL`, `VITE_API_TIMEOUT`, `VITE_QUESTIONS_PER_PAGE`) are also set in
the root `mise.toml` `[env]` block. Vite inlines them at build time: `npm run dev`/`npm run build` read them from
the shell, and the Docker image receives them as build args from `docker-compose.yml`, so rebuild the
`frontend` image after changing them.

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

- `.github/workflows/test-backend.yml`: matrix over Python 3.11/3.12, `uv sync`, `make lint` (`ruff check` + `ruff format --check`), `uv run pytest`, with
  placeholder Azure/Mongo env vars (no real external services are hit in backend tests).
- `.github/workflows/test-frontend.yml`: matrix over Node 22/24, `npm ci`, `make lint` (`eslint`), `npm run build` (type-check),
  `npm run test:run`, `npm run test:coverage`, coverage uploaded as a build artifact.
