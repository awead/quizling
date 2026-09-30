# Quizling (frontend)

React 19 + Vite + TypeScript single-page app for browsing questions and taking quizzes, backed by the Quizling API.

For project setup, configuration, and the `make` targets shared by both apps, see the
[main README](../README.md). The commands below run from `frontend/`.

## Make Commands

| Command | Runs |
|---|---|
| `make install` | `npm install` |
| `make dev` | `npm run dev` |
| `make test` | `npm run test:run` |
| `make test-cov` | `npm run test:coverage` |
| `make lint` | `npm run lint` |
| `make format` | `npm run lint -- --fix` |
| `make build` | `npm run build` |

## Development

```bash
make dev
```

The Vite dev server runs on http://localhost:3000 and proxies `/api/*` to the API at `http://localhost:8000`
(see `vite.config.ts`), so the backend must be running too (`make api` in `backend/`).

## Configuration

`VITE_API_BASE_URL`, `VITE_API_TIMEOUT`, and `VITE_QUESTIONS_PER_PAGE` are set in root `mise.toml` under `[env]`.
Vite inlines them at build time, so restart the dev server or rebuild after changing them.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests once with coverage |
| `npm run test:ui` | Open the Vitest UI |
