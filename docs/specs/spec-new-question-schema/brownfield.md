# Brownfield: current label coupling

Where the A–D label system lives today. Every item must stop depending on stored labels.

| Area | Location | Coupling |
|---|---|---|
| Backend model | `backend/src/quizling/base/models.py` | `AnswerOption.label: Literal[A–D]`; `VALID_LABELS`; `correct_answer`; validators enforce the label set and sort options by label |
| Generation prompt | `backend/src/quizling/base/generator.py` (system prompt) | asks the LLM for labeled options and a `correct_answer` label |
| Loader | `backend/src/quizling/storage/loader.py` | validates CLI JSON files through `MultipleChoiceQuestion` — old-shape files fail once the schema changes |
| API | `backend/src/quizling/api/models.py`, `services.py` | return `MultipleChoiceQuestion` as-is; response shape changes with the model |
| Frontend types | `frontend/src/types/models.ts` | hand-maintained mirror of the model (label, correct_answer) |
| Quiz flow | `frontend/src/hooks/useQuiz.ts`, `components/quiz/QuizQuestion.tsx`, `components/quiz/AnswerOption.tsx` | selection and grading typed as `'A'\|'B'\|'C'\|'D'` and compared to `correct_answer` |
| Browse/detail | `frontend/src/components/questions/QuestionCard.tsx`, `pages/QuestionDetailPage.tsx` | render `option.label`; highlight via `correct_answer` |
| Test fixtures | `backend/tests/quizling/**`, `frontend/src/test/factories.ts`, `*.test.ts(x)` | build labeled options |
| Docs | `docs/data-models.md`, `docs/api-contracts.md`, `backend/README.md` | document labels and `correct_answer` |
| Existing data | MongoDB `questions` collection; `backend/out/*.json` | stored in the old shape |
