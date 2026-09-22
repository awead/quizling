# AGENTS.md

Instructions for AI agents (and anyone else automating changes) in this repository.

- This is the only agent-instruction file here.
- It routes you to the docs that own each area; it does not restate them.

## Authority order when sources disagree

1. The repository itself — a path that fails `test -e`, or a command absent from a `Makefile`,
   `package.json`, or `.github/workflows/`, does not exist no matter what a doc says.
2. `docs/coding-standards.md` and this file.
3. Area docs (`docs/*.md`, `backend/README.md`, `frontend/README.md`), for area-specific detail.

- When a descriptive doc (architecture, API contracts, data models, ...) contradicts the repo,
  the repo wins: report the drift and fix the doc under "Docs move with the code" below.
- `docs/coding-standards.md` is the one exception to "repo wins" — it is prescriptive, not
  descriptive. If code violates it, fix the code, not the standard. See "Coding standards are
  mandatory" below.
- When two docs contradict each other and you cannot tell which is right, stop and ask.

## Read the docs first

Start at [docs/index.md](docs/index.md), then read the docs owning your area.

| Changing | Owning docs |
|---|---|
| `backend/` | [architecture.md](docs/architecture.md), [api-contracts.md](docs/api-contracts.md), [data-models.md](docs/data-models.md), [backend/README.md](backend/README.md) |
| `frontend/` | [architecture.md](docs/architecture.md), [component-inventory.md](docs/component-inventory.md), [data-models.md](docs/data-models.md), [frontend/README.md](frontend/README.md) |
| `docker-compose.yml`, deployment/env config | [deployment-guide.md](docs/deployment-guide.md), [development-guide.md](docs/development-guide.md) |
| `.github/workflows/` | none — but a CI change still triggers a docs update if it changes what "passing" means (see Quality gates) |

- Anything not listed, or spanning both apps: use [project-overview.md](docs/project-overview.md)
  and [source-tree-analysis.md](docs/source-tree-analysis.md), and flag the gap in your summary.
- Cross-cutting and repo-wide: [development-guide.md](docs/development-guide.md).

## Coding standards are mandatory

- [docs/coding-standards.md](docs/coding-standards.md) is binding, not advisory, and covers both
  stacks: Python (`backend/`) and TypeScript/React (`frontend/`).
- It documents DRY, SOLID, and comment/docstring conventions — read it before writing code, and
  check your diff against it before finishing, not just "does it compile."
- Unlike the rest of `docs/`, this file drives the code rather than following it: it is not a
  snapshot of current patterns, it's the target. If you find code that violates it, that's drift
  to fix (in the course of a related change, not a drive-by rewrite), not a reason to loosen the
  standard.
- Do not copy or restate these standards elsewhere (READMEs, other docs, code comments) — link to
  [docs/coding-standards.md](docs/coding-standards.md) instead, so there is exactly one copy to
  keep current.

## Quality gates

Run from the app directory before calling a change done. These are the commands CI actually
runs — check before assuming more is enforced than really is:

| Area | Lint / type-check | Tests | Enforced in CI? |
|---|---|---|---|
| `backend/` | `uv run ruff check .`, `uv run ruff format --check .` | `uv run pytest tests/ -v` | Only `uv run pytest` runs in [test-backend.yml](.github/workflows/test-backend.yml) — `ruff` is not currently a CI step, run it yourself |
| `frontend/` | `npm run build` (type-check via `tsc -b`), `npm run lint` | `npm run test:run`, `npm run test:coverage` | [test-frontend.yml](.github/workflows/test-frontend.yml) runs `build`, `test:run`, and `test:coverage` — `npm run lint` is **not** a CI step, run it yourself |

- No coverage floor is configured or enforced anywhere (no `--cov-fail-under`, no vitest coverage
  thresholds) — coverage is reported, not gated. Don't claim a coverage bar was met; there isn't
  one.
- CI backend matrix: Python 3.11/3.12, with placeholder Azure/Mongo env vars — no real external
  service is reachable in CI, so backend tests must not depend on one.
- CI frontend matrix: Node 22/24.

## Docs move with the code

Docs (other than `coding-standards.md`) describe the *current* repo. If your change alters what a
doc describes, update it **in the same change**, not as follow-up.

| Your change | Update |
|---|---|
| API route or response shape (`backend/src/quizling/api/`) | [api-contracts.md](docs/api-contracts.md) |
| `MultipleChoiceQuestion`/`QuizConfig`/etc. schema (`backend/src/quizling/base/models.py` and its `frontend/src/types/models.ts` mirror) | [data-models.md](docs/data-models.md) |
| New/changed frontend component, hook, or page | [component-inventory.md](docs/component-inventory.md) |
| Env var, Docker Compose service, deployment step | [deployment-guide.md](docs/deployment-guide.md), [development-guide.md](docs/development-guide.md) |
| New dependency, Python/Node version bump, new `make`/`npm` script | [development-guide.md](docs/development-guide.md) |
| Renamed, moved, or deleted a symbol, file, or module | every doc the search below turns up |

### Search before you call it done

A trigger table only catches changes you thought to look up. When you rename or remove any
identifier a doc might name — function, file, module, env var, npm/make script — search every
tracked doc for the old token:

```bash
git grep -n --untracked "OLD_NAME" -- '*.md' || echo "no doc references"
```

Every hit is something to update or delete. A change that leaves a doc describing code that no
longer exists is not finished.

## Do not hand-edit

These are generated but tracked — they belong in your diff, but only via the toolchain:

- `backend/uv.lock` — via `uv add` / `uv sync`
- `frontend/package-lock.json` — via `npm install` in `frontend/`

## Secrets

- Environment variable names/defaults are defined in root `mise.toml` (`[env]`), including
  `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_VERSION`,
  `AZURE_OPENAI_DEPLOYMENT`, `MONGODB_URI`, and `MONGO_DATABASE`.
- Never commit real credentials; no secrets belong in the frontend build since it ships to the
  browser.
