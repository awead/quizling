# Component Inventory (Frontend)

**Generated:** 2026-09-22
**Scope:** `frontend/src/components/` and `frontend/src/pages/`

## Pages (route targets, lazy-loaded in `App.tsx`)

| Component | Route | Purpose |
|---|---|---|
| `HomePage` | `/` | Landing page |
| `QuestionsPage` | `/questions` | Browse/search/filter all questions, paginated |
| `QuestionDetailPage` | `/questions/:id` | Single question detail, answers hidden by default with a toggle |
| `QuizPage` | `/quiz` | Hosts `QuizInterface` for an interactive 15-question quiz |
| `NotFoundPage` | `*` | 404 fallback |

## Layout Components (`components/layout/`)

| Component | Purpose |
|---|---|
| `MainLayout` | Page shell: `Header` + `<Outlet/>` (routed page content) + `Footer` |
| `Header` | Top navigation |
| `Footer` | Page footer |

## Common / Design-System Components (`components/common/`)

| Component | Purpose |
|---|---|
| `Button` | Shared button (variants incl. `primary`) |
| `Card` | Shared content container used across quiz/question UI |
| `ErrorBoundary` | React error boundary wrapping the whole routed app |
| `ErrorMessage` | Standardized error display |
| `LoadingSpinner` | Loading indicator (used as `Suspense` fallback and inline loading states), supports `size` prop |
| `icons/CheckIcon`, `icons/XIcon` | Small SVG icon components, re-exported via `icons/index.ts` |

## Question Browsing Components (`components/questions/`)

| Component | Purpose |
|---|---|
| `QuestionList` | Renders a list of `QuestionCard`s |
| `QuestionCard` | Single question summary card |
| `QuestionFilters` | Difficulty filter controls |
| `SearchBar` | Debounced search input (pairs with `useDebounce`) |
| `Pagination` | Cursor-based pagination controls |

## Quiz Flow Components (`components/quiz/`)

Orchestrated by `QuizInterface`, which renders one of the following depending on `useQuiz` state:

| Component | State it renders for |
|---|---|
| `QuizStart` | Not started — shows a start button and question count |
| `QuizQuestion` | In progress — current question + `AnswerOption`s, wired to `selectAnswer` |
| `AnswerOption` | A single selectable answer within `QuizQuestion` |
| `QuizProgress` | In progress — progress bar (`currentQuestion` / `totalQuestions`) |
| `QuizNavigation` | In progress — previous/next/submit controls, tracks `answeredCount` |
| `QuizResults` | Complete — final score, per-question review of `userAnswers` vs correct answers, "retake" action |

`QuizInterface` also renders inline loading (animated SVG spinner + `Card`) and error states (icon + message +
"Try Again" button calling `resetQuiz`) directly, rather than delegating to `LoadingSpinner`/`ErrorMessage` for
those two specific states.

## Design System Notes

- Styling via Tailwind CSS v4 utility classes directly in JSX (no separate design-token file observed); dark mode
  handled via `dark:` variants throughout (e.g., `MainLayout`, `QuizInterface`).
- No component library dependency (e.g., MUI/Chakra) — all UI is hand-built.
- Every component listed above has a colocated `*.test.tsx` (or `.test.ts` for hooks/utils) except
  `QuizNavigation.tsx`, `QuizStart.tsx`, `QuizProgress.tsx`, `ErrorBoundary.tsx`, and the icon components, which
  have no dedicated test file.
