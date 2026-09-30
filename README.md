# Quizling

Generate high-quality multiple choice questions from documents using PydanticAI with Azure OpenAI, then serve them up
via FastAPI with React.

## Features

- Generate multiple choice questions from various document formats (TXT, PDF, DOCX, Markdown)
- Configurable difficulty levels (Easy, Medium, Hard)
- Optional explanations for correct answers
- Topic-focused question generation
- Export to json
- Built on PydanticAI for robust AI interactions
- MongoDB for question storage
- FastAPI for question retrieval to power front-end solutions
- React single-page app for browsing and taking quizzes

## Repository Layout

| Path | What it is | Details |
|---|---|---|
| `backend/` | Python package `quizling`: question-generation CLI, MongoDB loader, FastAPI API, plus its own `Makefile` | [backend/README.md](backend/README.md) |
| `frontend/` | React 19 + Vite + TypeScript SPA that reads questions from the API, plus its own `Makefile` | [frontend/README.md](frontend/README.md) |
| `docs/` | Architecture, API contracts, data models, development and deployment guides | [docs/index.md](docs/index.md) |
| `docker-compose.yml` | MongoDB, API, and frontend as one stack | [docs/deployment-guide.md](docs/deployment-guide.md) |

## Prerequisites

- [`mise`](https://mise.jdx.dev/) for runtime tools (Python, Node, `uv`)
- [`fnox`](https://github.com/jdx/fnox) for secrets
- Docker + Docker Compose (for MongoDB, or for running the full stack)
- An Azure OpenAI resource — only needed to generate questions

## Setup

From the repository root:

```bash
mise install                # Python, Node, and uv at the versions pinned in mise.toml
make -C backend install     # uv sync
make -C frontend install    # npm install
```

## Configuration

Non-secret settings live in root `mise.toml` under `[env]` (Azure endpoint/version/deployment, Mongo database and
ports, and the `VITE_*` frontend settings). Secrets live in `fnox.toml`:

- `AZURE_OPENAI_KEY` is brokered from Azure Key Vault.
- `MONGODB_URI` and `MONGO_ROOT_PASSWORD` default to the local Docker Compose MongoDB.

Run commands that need those values with fnox's shell integration active, or prefix them with `fnox exec --`
(for example, `fnox exec -- make api` in `backend/`).

## Make Commands

Each app has its own Makefile with matching target names: [backend/Makefile](backend/Makefile) and
[frontend/Makefile](frontend/Makefile). Run them from the app's directory, or from the root with
`make -C backend <target>` / `make -C frontend <target>`.

| Target | `backend/` | `frontend/` |
|---|---|---|
| `install` | `uv sync` | `npm install` |
| `test` | `pytest` | `vitest run` |
| `test-cov` | `pytest` with coverage | `vitest run --coverage` |
| `lint` | `ruff check` + `ruff format --check` | `eslint` |
| `format` | `ruff format` | `eslint --fix` |
| `api` / `dev` | `api`: FastAPI with auto-reload on `:8000` | `dev`: Vite dev server on `:3000` |
| `console` | IPython console with `quizling` loaded | — |
| `build` | — | Type-check (`tsc -b`) and build to `dist/` |

Before calling a change done, run `lint` and `test` in each app you touched, plus `build` in `frontend/`.

## Creating Questions

Questions go from a source document to the app in two steps: the generator asks Azure OpenAI for questions and
writes each one to a JSON file, then the loader inserts those files into MongoDB. Both commands run from
`backend/` and read the Azure and Mongo settings from the environment, so run them with fnox active or under
`fnox exec --` (see [Configuration](#configuration)).

1. Start MongoDB:

   ```bash
   docker compose up -d mongodb
   ```

2. Generate questions from a `.txt`, `.md`, `.pdf`, or `.docx` file. Each question is written to
   `backend/out/<uuid>.json`:

   ```bash
   cd backend
   fnox exec -- uv run python -m quizling path/to/document.pdf -n 10 -d medium -t "machine learning"
   ```

3. Load every JSON file in `out/` into MongoDB:

   ```bash
   fnox exec -- uv run python -m quizling.storage out --create-indexes
   ```

   Add `--clear` to delete the existing questions first. The loader doesn't skip duplicates, so running it twice
   on the same files inserts them twice. Use `--clear`, or generate into a fresh directory with `-o`.

For every generator and loader option, see [backend/README.md](backend/README.md#command-line-interface).

## Quick Start

1. Start MongoDB: `docker compose up -d mongodb`
2. Generate questions and load them into MongoDB — see [Creating Questions](#creating-questions)
3. Run the API and the frontend in two terminals, then open http://localhost:3000:

   ```bash
   cd backend && fnox exec -- make api
   cd frontend && make dev
   ```

The Vite dev server proxies `/api/*` to the API on port 8000. To run everything in containers instead, use
`docker compose up -d --build` and open http://localhost:8080.

## Documentation

- [docs/index.md](docs/index.md) — start here
- [docs/development-guide.md](docs/development-guide.md) — local development in depth
- [docs/deployment-guide.md](docs/deployment-guide.md) — Docker Compose and deployment
- [docs/coding-standards.md](docs/coding-standards.md) — standards for both apps
- [AGENTS.md](AGENTS.md) — instructions for AI agents working in this repo

## License

MIT License
