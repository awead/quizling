# Project Documentation Index

**Generated:** 2026-09-22

## Project Overview

- **Type:** Monolith (two cooperating apps: `backend/` + `frontend/`, deployed together)
- **Primary Languages:** Python (backend), TypeScript/React (frontend)
- **Architecture:** Layered FastAPI backend (generation → storage → API) + component-based React SPA frontend

## Quick Reference

- **Tech Stack:** FastAPI, PydanticAI + Azure OpenAI, MongoDB, pymongo (backend) · React 19, Vite, TypeScript, React Router, Tailwind CSS, axios (frontend)
- **Entry Points:** `quizling.api.app:app` (API), `python -m quizling <file>` (question generation CLI), `python -m quizling.storage <dir>` (MongoDB loader CLI), `frontend/src/main.tsx` (SPA)
- **Architecture Pattern:** Layered backend (api/base/storage) + component/hook-based frontend, no shared runtime — integrated only via the REST API and MongoDB

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [Coding Standards](./coding-standards.md)

## Existing Documentation

- [Root README](../README.md) - Project pitch and feature list
- [Backend README](../backend/README.md) - Backend installation, CLI usage, full API reference with examples, dev/test commands
- [Frontend README](../frontend/README.md) - Minimal placeholder
- [Backend TODO](../backend/TODO.md) - Known refactoring backlog (service layer, exception handling, DI, performance) — several items already implemented (checked items)
- [.github/workflows/test-backend.yml](../.github/workflows/test-backend.yml) - Backend CI
- [.github/workflows/test-frontend.yml](../.github/workflows/test-frontend.yml) - Frontend CI

## Getting Started

1. Read [Project Overview](./project-overview.md) for the big picture.
2. Follow [Development Guide](./development-guide.md) to run the backend API, frontend dev server, and MongoDB locally.
3. Use [API Contracts](./api-contracts.md) and [Data Models](./data-models.md) as the ground truth for the
   `/questions` REST API and the `MultipleChoiceQuestion` schema.
4. Use [Deployment Guide](./deployment-guide.md) when working with the Docker Compose stack.

## Notes for Future Documentation Passes

- This was a **Deep Scan**: all files in critical directories (`backend/src/quizling/**`, `frontend/src/**`,
  config/Docker/CI files) were read; this is not an exhaustive line-by-line audit of every helper/util/test file.
- `backend/TODO.md` contains a refactoring backlog — cross-check it against `architecture.md` before treating any
  described pattern (e.g., "no service layer") as still current; several items are already implemented.
