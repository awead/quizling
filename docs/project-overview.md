# Project Overview

**Generated:** 2026-09-22
**Repository Type:** Monolith (two cooperating apps: `backend/` and `frontend/`, deployed together via Docker Compose)

## Purpose

Quizling generates high-quality multiple-choice questions from documents (TXT, PDF, DOCX, Markdown) using
[PydanticAI](https://ai.pydantic.dev/) with Azure OpenAI, stores them in MongoDB, and serves them through a
FastAPI backend consumed by a React single-page frontend for browsing questions and taking quizzes.

## Executive Summary

- **Generation pipeline (CLI):** `uv run python -m quizling <file>` reads a document, calls an Azure OpenAI model
  through a PydanticAI `Agent` to produce structured `MultipleChoiceQuestion` objects, and writes them to JSON
  files on disk.
- **Loading pipeline (CLI):** `uv run python -m quizling.storage <dir>` reads those JSON files and inserts them
  into a MongoDB `questions` collection.
- **API (backend):** A FastAPI app (`quizling.api.app`) exposes read-only, paginated/filterable/searchable REST
  endpoints over the MongoDB-stored questions.
- **UI (frontend):** A React 19 + TypeScript SPA (Vite, React Router, Tailwind CSS) that lists/searches/filters
  questions, shows question detail, and offers an interactive quiz-taking flow with scoring.

## Technology Stack Summary

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Backend language/runtime | Python | >=3.12 | Managed with `uv` |
| Backend framework | FastAPI | >=0.119 | Serves `/questions` API |
| AI orchestration | PydanticAI | >=1.1.0 | `Agent` bound to Azure OpenAI via `OpenAIProvider` |
| LLM provider | Azure OpenAI | (`openai` SDK, `AsyncAzureOpenAI`) | Deployment name configurable, e.g. `gpt-5.5` |
| Database | MongoDB | 7.0 (Docker image) | Accessed via `pymongo` |
| Backend testing | pytest, pytest-asyncio, pytest-cov | | `make test`, `make test-cov` |
| Backend lint/format | ruff | >=0.14 | |
| Frontend language | TypeScript | ~5.9 | |
| Frontend framework | React | ^19.1 | with `react-router-dom` ^7.9 |
| Frontend build tool | Vite | ^7.1 | dev server proxies `/api` to backend on port 8000 |
| Frontend styling | Tailwind CSS | ^4.1 | via `@tailwindcss/postcss` |
| Frontend HTTP client | axios | ^1.12 | centralized client with interceptors |
| Frontend testing | Vitest, Testing Library, MSW | | `npm run test:run`, coverage via `@vitest/coverage-v8` |
| Frontend lint | ESLint (flat config) + typescript-eslint | | |
| Containerization | Docker, Docker Compose | | 3 services: `mongodb`, `backend`, `frontend` (nginx) |
| CI | GitHub Actions | | `test-backend.yml` (Python 3.11/3.12 matrix), `test-frontend.yml` (Node 22/24 matrix) |

## Architecture Type Classification

Layered / service-oriented full-stack application:
- **Generation layer** (`backend/src/quizling/base/`): document reading, AI question generation, JSON writing.
- **Persistence layer** (`backend/src/quizling/storage/`): MongoDB client and JSON→DB loader.
- **API layer** (`backend/src/quizling/api/`): FastAPI routes, service objects, DTOs, custom exceptions/error handlers.
- **Presentation layer** (`frontend/src/`): React pages/components/hooks consuming the API via a typed client.

The generation and persistence pipelines are decoupled from the API: quizzes are produced and loaded into MongoDB
as an offline/CLI step, and the API only ever reads from MongoDB.

## Repository Structure

```
quizling/
├── backend/     # Python package `quizling`: CLI generator, MongoDB loader, FastAPI app
├── frontend/    # React + Vite + TypeScript SPA
├── docker-compose.yml   # mongodb + backend + frontend services
└── .github/workflows/   # CI: test-backend.yml, test-frontend.yml
```

## Links to Detailed Documentation

- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)

## Getting Started

See [Development Guide](./development-guide.md) for local setup, and [Deployment Guide](./deployment-guide.md)
for running the full stack via Docker Compose.
