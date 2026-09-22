# Deployment Guide

**Generated:** 2026-09-22

## Infrastructure Requirements

- Docker + Docker Compose
- An Azure OpenAI resource (only needed to run the generation CLI; the API/frontend runtime does not call Azure
  OpenAI directly)

## Services (`docker-compose.yml`)

| Service | Image / Build | Port mapping | Purpose |
|---|---|---|---|
| `mongodb` | `mongo:7.0` | `${MONGO_PORT:-27017}:27017` | Question storage; named volumes `mongodb_data`, `mongodb_config` |
| `backend` | build from `./backend/Dockerfile` | `${BACKEND_PORT:-8000}:8000` | FastAPI app via `uvicorn`, depends on `mongodb` |
| `frontend` | build from `./frontend/Dockerfile` | `${FRONTEND_PORT:-8080}:80` | nginx serving the built SPA + proxying `/api/`, depends on `backend` |

All three are attached to the `quizling-network` bridge network, so `backend` and `frontend` can address `mongodb`
and `backend` by service name.

## Environment Configuration

Set via the root `mise.toml` `[env]` block (or your orchestrator's secret/config mechanism):

| Variable | Default | Used by |
|---|---|---|
| `MONGO_ROOT_USERNAME` | `admin` | mongodb, backend (connection string) |
| `MONGO_ROOT_PASSWORD` | `password` | mongodb, backend (connection string) |
| `MONGO_DATABASE` | `quizling` | mongodb, backend |
| `MONGO_PORT` | `27017` | mongodb (host port) |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-5-mini` | backend |
| `AZURE_OPENAI_ENDPOINT` | *(required, no default)* | backend |
| `AZURE_OPENAI_KEY` | *(required, no default)* | backend |
| `AZURE_OPENAI_VERSION` | `2024-02-15-preview` | backend |
| `BACKEND_PORT` | `8000` | backend (host port) |
| `VITE_API_BASE_URL` | `/api` | frontend (build/runtime) |
| `FRONTEND_PORT` | `8080` | frontend (host port) |

Note: the backend's Azure OpenAI variables are only exercised by the CLI generation path
(`quizling.base.models.QuizConfig`); the FastAPI service itself only needs MongoDB connectivity to serve
`/questions`.

## Deployment Process

```bash
# From the repo root
mise x -- docker-compose up -d --build
```

This builds and starts all three services. The frontend becomes available on `http://localhost:${FRONTEND_PORT:-8080}`,
with API calls transparently proxied through nginx to the backend.

Quiz content must be populated separately (there's no seed step in Compose): run the generation + loader CLI
commands from the [Development Guide](./development-guide.md) against a backend that can reach the same MongoDB
instance (e.g., by pointing `MONGODB_URI` at the mapped host port).

## Frontend Container Details (`frontend/Dockerfile`, `frontend/nginx.conf`)

- Multi-stage build: `node:20-alpine` runs `npm ci && npm run build`; the static `dist/` output is copied into an
  `nginx:alpine` final stage.
- nginx config: gzip compression, `/api/` reverse-proxied to `http://backend:8000/` (path prefix stripped by the
  proxy target), long-lived caching for `/assets/`, SPA fallback (`try_files ... /index.html`) for client-side
  routing, and baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, a permissive-by-default CSP).

## Backend Container Details (`backend/Dockerfile`)

- `python:3.12-slim` base, dependencies installed via `uv sync --frozen --no-dev` (production deps only).
- Runs as a non-root `quizling` user.
- `PYTHONPATH=/app/src` so the `quizling` package resolves without an editable install.
- Entrypoint: `uvicorn quizling.api.app:app --host 0.0.0.0 --port 8000` (no `--reload` in production).

## CI/CD

There is no CD pipeline in this repository — GitHub Actions only runs tests on push/PR to `main`
(`.github/workflows/test-backend.yml`, `.github/workflows/test-frontend.yml`). Deployment is manual via
`docker-compose`.
