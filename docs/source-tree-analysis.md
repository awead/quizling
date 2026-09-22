# Source Tree Analysis

**Generated:** 2026-09-22

```
quizling/
├── mise.toml                   # Toolchain versions for local development (python/node/uv)
├── docker-compose.yml            # Orchestrates mongodb + backend + frontend services
├── .github/workflows/
│   ├── test-backend.yml          # CI: pytest across Python 3.11/3.12
│   └── test-frontend.yml         # CI: vitest + build + coverage across Node 22/24
│
├── backend/                      # Python package "quizling" (uv-managed)
│   ├── pyproject.toml            # Deps: pydantic-ai, fastapi, pymongo, pypdf, python-docx, ruff, pytest
│   ├── Dockerfile                # python:3.12-slim + uv, runs uvicorn
│   ├── Makefile                  # make test / test-cov / console / api
│   ├── src/quizling/
│   │   ├── __main__.py           # Entry point: CLI question generator (python -m quizling <file>)
│   │   ├── api/                  # FastAPI HTTP layer → Calls storage/ for persistence
│   │   │   ├── app.py            #   FastAPI() app, registers error handlers + router, health endpoints
│   │   │   ├── router.py         #   GET /questions, GET /questions/{id}; DI via get_db()/get_question_service()
│   │   │   ├── services.py       #   QuestionService, QuestionQueryParams, PaginationResult (business logic)
│   │   │   ├── models.py         #   PaginatedResponse, QuestionResponse, ErrorResponse (response DTOs)
│   │   │   ├── exceptions.py     #   QuizlingAPIException hierarchy (DatabaseError, ResourceNotFoundError, ...)
│   │   │   └── error_handlers.py #   Maps exceptions → JSONResponse
│   │   ├── base/                 # Question-generation domain (used by CLI, independent of API)
│   │   │   ├── models.py         #   MultipleChoiceQuestion, AnswerOption, QuizConfig, QuizResult, DifficultyLevel
│   │   │   ├── generator.py      #   QuizGenerator: PydanticAI Agent + AsyncAzureOpenAI
│   │   │   ├── file_reader.py    #   FileReaderFactory: .txt/.md/.pdf/.docx readers (strategy pattern)
│   │   │   └── quiz_writer.py    #   QuizWriter: writes each question to its own JSON file
│   │   ├── storage/               # Persistence layer → Consumed by api/ and the loader CLI
│   │   │   ├── __main__.py       #   CLI: python -m quizling.storage <dir> loads JSON files into MongoDB
│   │   │   ├── db.py             #   MongoDBClient: pymongo wrapper (CRUD, search, pagination helpers, indexes)
│   │   │   └── loader.py         #   load_question(s)_from_(file|directory): JSON → MultipleChoiceQuestion
│   │   └── utils/console.py      #   IPython console entry point (make console)
│   └── tests/quizling/           # Mirrors src/ structure: api/, base/, storage/, test_main.py
│
└── frontend/                     # React 19 + TypeScript + Vite SPA
    ├── package.json              # react-router-dom, axios, tailwindcss v4, vitest, msw, testing-library
    ├── vite.config.ts            # "@/" alias → src/, dev server proxies /api → http://localhost:8000
    ├── Dockerfile                # Multi-stage: node:20-alpine build → nginx:alpine serve
    ├── nginx.conf                # Reverse-proxies /api/ → backend:8000, SPA fallback to index.html
    └── src/
        ├── main.tsx / App.tsx    # Entry point; BrowserRouter + lazy-loaded routes + ErrorBoundary
        ├── api/                  # HTTP client layer → Calls backend/ API
        │   ├── client.ts         #   axios instance, request/response interceptors, ApiError wrapping
        │   ├── endpoints.ts      #   ENDPOINTS route constants
        │   ├── questions.ts      #   fetchQuestions, fetchQuestionById, healthCheck
        │   └── errors.ts
        ├── types/                # Mirrors backend Pydantic models (models.ts, api.ts)
        ├── hooks/                # useQuestions, useQuestion, useQuiz, useDebounce, useFocusOnMount
        ├── pages/                # HomePage, QuestionsPage, QuestionDetailPage, QuizPage, NotFoundPage
        ├── components/
        │   ├── common/           #   Button, Card, ErrorBoundary, ErrorMessage, LoadingSpinner, icons/
        │   ├── layout/           #   Header, Footer, MainLayout (renders <Outlet/>)
        │   ├── questions/        #   QuestionList, QuestionCard, QuestionFilters, SearchBar, Pagination
        │   └── quiz/             #   QuizInterface (orchestrator), QuizStart, QuizQuestion, QuizProgress,
        │                         #   QuizNavigation, QuizResults, AnswerOption
        ├── utils/                #   difficulty.ts, logger.ts
        └── test/                 #   setup.ts, test-utils.tsx, factories.ts (shared test fixtures)
```

## Critical Folders

| Path | Purpose |
|---|---|
| `backend/src/quizling/api/` | HTTP boundary of the app — routes, DI, error mapping |
| `backend/src/quizling/base/` | Core domain logic: reading documents and generating questions via Azure OpenAI |
| `backend/src/quizling/storage/` | MongoDB access, shared by the API and the JSON-loading CLI |
| `frontend/src/api/` | Frontend's single point of contact with the backend; centralizes error handling |
| `frontend/src/hooks/` | Where UI state, loading/error handling, and data-fetching orchestration live |
| `frontend/src/components/quiz/` | The most stateful UI flow (multi-step quiz with scoring) |

## Entry Points

- `backend/src/quizling/__main__.py` — `python -m quizling <file>` (question generation CLI)
- `backend/src/quizling/storage/__main__.py` — `python -m quizling.storage <dir>` (MongoDB loader CLI)
- `quizling.api.app:app` — ASGI app entry point for `uvicorn`
- `frontend/src/main.tsx` — React app bootstrap
- `frontend/index.html` / Vite — frontend dev/build entry

## Integration Points (frontend ↔ backend)

- Dev: Vite dev server proxies `/api/*` → `http://localhost:8000/*` (`frontend/vite.config.ts`).
- Prod (Docker Compose): nginx in the `frontend` container proxies `/api/` → `http://backend:8000/` (`frontend/nginx.conf`).
- Contract: `frontend/src/types/{models,api}.ts` are hand-maintained mirrors of
  `backend/src/quizling/{base,api}/models.py` (see file-header comments referencing the Python source).
