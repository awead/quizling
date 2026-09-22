# Coding Standards

These standards apply to both the Python backend (`backend/src/quizling/`) and the TypeScript/React frontend
(`frontend/src/`). They exist to keep the codebase easy to read, easy to change, and free of accidental duplication.
When a standard here conflicts with `ruff` or `eslint` config, the linter wins — file an update to this doc instead
of ignoring the linter.

## Guiding Principles

### DRY (Don't Repeat Yourself)

- Extract shared logic into a function, hook, or utility the first time it's needed in two places — not before.
- Duplicate DTOs/types between backend and frontend (e.g. `MultipleChoiceQuestion`) are the one accepted exception:
  there is no shared runtime, so mirror the shape deliberately rather than inventing codegen for it.
- Prefer composition (small functions calling small functions) over copy-pasted variations of the same logic.
- If you're about to copy a block and tweak one value, parameterize the original instead.

### SOLID

- **Single Responsibility** — a function, class, or component does one thing. If you need "and" to describe what
  it does, split it. In the backend, this means routes stay thin, business logic lives in `api/services.py`, and
  DTOs (`api/models.py`) don't carry logic.

  ```python
  # correct — the router only parses input and delegates
  @router.get("/questions/{question_id}")
  async def get_question(question_id: str, service: QuestionService = Depends()):
      return await service.get_question(question_id)

  # wrong — query logic and error mapping live in the route
  @router.get("/questions/{question_id}")
  async def get_question(question_id: str):
      doc = await db.questions.find_one({"_id": ObjectId(question_id)})
      if doc is None:
          raise HTTPException(status_code=404, detail="Question not found")
      return doc
  ```

- **Open/Closed** — extend behavior by adding new functions/classes/components, not by adding conditionals to
  existing ones for a new special case. A new question type or API filter should be a new branch of an existing
  narrow seam (a new service method, a new component), not a growing `if/elif` chain.

  ```python
  # correct — a new filter is a new, independent query builder
  def filter_by_difficulty(query: dict, difficulty: DifficultyLevel) -> dict:
      return {**query, "difficulty": difficulty.value}

  # wrong — one function grows a branch per new filter type
  def build_query(params: dict) -> dict:
      query = {}
      if "difficulty" in params:
          query["difficulty"] = params["difficulty"]
      if "topic" in params:
          query["topic"] = params["topic"]
      # next filter added here means editing this function again
      return query
  ```

- **Liskov Substitution** — a subclass or an implementation of a Protocol/interface must be usable anywhere the
  base type is expected, with no surprising behavior changes. A `FileReader` implementation for a new format must
  honor the same contract (return type, error behavior) as the existing ones in
  `backend/src/quizling/base/file_reader.py`.
- **Interface Segregation** — keep function signatures and component props narrow. Don't pass an entire object
  when the callee only needs two fields of it; don't add optional params "just in case."
- **Dependency Inversion** — depend on abstractions at boundaries (the Mongo client, the Azure OpenAI client, the
  API client on the frontend), not concrete implementations, so they can be swapped or mocked in tests.

  ```python
  # correct — the client is injected, so tests can substitute a fake
  class QuestionService:
      def __init__(self, db: MongoDBClient):
          self.db = db

  # wrong — the service constructs its own dependency, so it can't be tested in isolation
  class QuestionService:
      def __init__(self):
          self.db = MongoDBClient(os.environ["MONGODB_URI"])
  ```

### Best Practices

- Favor clarity over cleverness. Straightforward code that's obviously correct beats a compact one-liner that
  needs decoding.
- Fail fast at boundaries (user input, API responses, external services); trust internal code and type guarantees
  elsewhere — don't re-validate what the type system or a prior layer already guarantees.
- Keep functions small enough to read in one glance. If you need to scroll to see the whole thing, it's probably
  doing more than one job.
- Name things for what they are, not how they're implemented — a good name makes a comment unnecessary.
- No dead code, no commented-out code, no speculative abstractions for requirements that don't exist yet.

## Comments and Documentation

- **Do not write comments that explain what the code does.** If a comment is needed to explain *what*, rename
  variables/functions until it isn't.
- A comment is only justified when it explains a non-obvious *why*: a workaround for a specific bug, a hidden
  constraint from an external system (Azure OpenAI, MongoDB), or an invariant that isn't visible from the code
  itself.
- **Docstrings are for public methods/functions only** — anything importable and used outside its own module/class
  (API route handlers, service methods, exported utilities, public component props). Private/internal helpers
  (leading `_` in Python, non-exported functions/components in TypeScript) do not get docstrings.
- Docstrings describe behavior, inputs, outputs, and exceptions/edge cases — not implementation detail.

Python example:

```python
def get_question(question_id: str) -> MultipleChoiceQuestion:
    """Fetch a single question by id.

    Raises QuestionNotFoundError if no question with the given id exists.
    """
    ...

def _to_object_id(question_id: str) -> ObjectId:
    return ObjectId(question_id)
```

TypeScript example:

```typescript
/** Fetches a page of questions matching the given filters. */
export async function fetchQuestions(filters: QuestionFilters): Promise<QuestionPage> {
  ...
}

function buildQueryString(filters: QuestionFilters): string {
  ...
}
```

## Python (Backend)

- Follow `ruff` formatting and linting as configured in `backend/pyproject.toml`; run `uv run ruff check .` and
  `uv run ruff format .` before committing.
- Routes (`api/router.py`) only parse input and call a service; they don't contain business logic.
- Business logic lives in `api/services.py`; custom failure modes are typed exceptions in `api/exceptions.py`,
  mapped to responses in `api/error_handlers.py` — don't return ad-hoc error dicts from a route.
- Raise specific exceptions instead of returning `None`/sentinel values to signal failure.
- Keep the generation (`base/`), storage (`storage/`), and API (`api/`) layers decoupled — don't import across
  layers except through their defined entry points.

### Type Annotations

- All function signatures are fully annotated — parameters and return types, public and private alike.
- Use built-in generics (`list[str]`, `dict[str, int]`), not `typing.List`/`typing.Dict`.
- Use `X | Y` union syntax, not `Optional[X]`/`Union[X, Y]`.

```python
# correct
def read(self, file_path: Path) -> str: ...

# wrong — missing parameter/return types, old-style typing
from typing import Optional
def read(self, file_path) -> Optional[str]: ...
```

### Pydantic Models

- Any data crossing a module or service boundary (API request/response, config, LLM output) is a Pydantic
  `BaseModel` — see `backend/src/quizling/base/models.py` (`MultipleChoiceQuestion`, `QuizConfig`) for the pattern.
- Use `model_validate()`/`model_dump()`, not the deprecated `parse_obj()`/`dict()`.
- Field defaults use `default=`/`default_factory=`; never a mutable literal as a bare default.

### PydanticAI Agents

- Every `Agent` declares `output_type` explicitly (see `QuizGenerator._create_agent` in
  `backend/src/quizling/base/generator.py`) — never leave it to infer from usage.
- Build the model/client once (in `__init__` or a factory method) and reuse the `Agent` instance across calls;
  don't reconstruct the client or model on every `run()`.
- Keep prompt construction in dedicated methods (`_build_system_prompt`, `_build_agent_prompt`), not inlined at
  the `Agent(...)` call site — if a service grows a second agent, give each its own prompt-building method rather
  than branching one shared method on a flag.

### Testing

- Prefer fakes/stubs that implement the same interface over patching internals with `unittest.mock` — a fake
  `MongoDBClient` or a `pydantic_ai.models.test.TestModel` in place of the real Azure OpenAI model keeps tests
  fast and independent of the mocked implementation's internals.
- Test files mirror the source layout (`backend/tests/quizling/api/test_router.py` tests
  `backend/src/quizling/api/router.py`) — keep this when adding new modules.
- Name tests for the behavior they check, e.g. `test_generate_from_file_raises_when_content_too_short`.

## TypeScript / React (Frontend)

- Follow the project's ESLint config (`frontend/eslint.config.js`) and `tsc` strictness; run `npm run lint` and
  `npm run build` before committing.
- Prefer explicit types on function/component boundaries; let TypeScript infer locals.
- Components render; data fetching and stateful logic belong in hooks (`src/hooks/`). A component pulling its own
  data via a hook, rather than fetching inline, keeps it testable and reusable.
- Keep props narrow — pass only the fields a component uses, not a whole entity object when two fields suffice.
- API access goes through the centralized client (`src/api/`); don't call `axios`/`fetch` directly from
  components or hooks.
- Co-locate tests with the code they cover, following existing patterns in `src/test/`.

### TypeScript Patterns

- **`import type`** for type-only imports, as already done throughout `src/components/` (e.g.
  `frontend/src/components/common/Button.tsx`):

  ```typescript
  // correct
  import type { ButtonHTMLAttributes, ReactNode } from 'react'

  // wrong — imports a value binding when only the type is used
  import { ButtonHTMLAttributes, ReactNode } from 'react'
  ```

- **Props interfaces** are named `<Component>Props` and declared immediately above the component, matching the
  existing `ButtonProps`/`CardProps` pattern.
- **No `any`** — use `unknown` and narrow explicitly, or define/extend an interface.
- **`as const`** for a literal array that a union type should be derived from, so the union can't drift from its
  source of truth — prefer this over hand-writing the same values as both an array (for iteration) and a union
  type (for `DifficultyLevel` in `frontend/src/types/models.ts`):

  ```typescript
  // correct — one source of truth for both the runtime array and the type
  export const QUESTION_STATUSES = ['draft', 'published', 'archived'] as const
  export type QuestionStatus = (typeof QUESTION_STATUSES)[number]
  ```

## When in Doubt

Match the surrounding code's existing patterns first. If the surrounding code violates a standard here, fix it in
the course of your change rather than compounding it — but don't do drive-by rewrites unrelated to the task at
hand.
