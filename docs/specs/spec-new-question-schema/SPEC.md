---
id: SPEC-new-question-schema
companions:
  - brownfield.md
  - ../../data-models.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Label-free answer options

## Why

Pain to solve. `MultipleChoiceQuestion` hard-codes a four-option A–D label system: each option carries a fixed letter and the answer is stored as a letter. Because the letter is part of the data, a question always shows its correct answer under the same letter, so learners can memorize positions instead of content, and the schema cannot grow past four labeled options.

## Capabilities

- **CAP-1**
  - **intent:** Each answer option states whether it is correct via an `is_correct` flag; no option carries a label and the question has no `correct_answer`.
  - **success:** Stored, generated, and API-served questions contain options of only `text` and `is_correct`, with no `label` and no `correct_answer`; validation rejects a question with zero or more than one correct option.
- **CAP-2**
  - **intent:** The number of options is governed by a validation bound, not by a fixed label set.
  - **success:** Validation accepts exactly 4 options and rejects 3 or 5; changing the bound requires no change beyond the bound itself (no label list, enum, or letter-typed field to update).
- **CAP-3**
  - **intent:** In quiz mode the frontend shuffles option order once per new quiz and assigns letters top to bottom, so the same question does not always show its answer under the same letter.
  - **success:** Across new quizzes containing one question, its correct option appears under different letters; within a quiz, re-rendering never changes the order; selecting the correct option is always graded correct and any other incorrect.
- **CAP-4**
  - **intent:** Generated questions use the new shape, with explanations that stand without reference to option letters or positions.
  - **success:** The CLI produces JSON with `is_correct` options and no labels, and the generation prompt forbids explanations that cite a letter or position (e.g. "B is correct").

## Constraints

- Minimum and maximum option count are both 4 for now.
- Labels exist only in the frontend's presentation; no backend model, stored document, generated JSON, or API response contains them.
- Correctness is identified by the option itself, never by position or letter, so any reordering preserves grading.
- Exactly one correct option for now, but the per-option flag must allow several later without restructuring the schema.
- Shuffling happens only in quiz mode, only when a new quiz starts; browse and detail pages show the stored order.
- Explanations must not depend on option labels or positions.
- The old shape is not supported: existing MongoDB documents and `backend/out/` JSON are discarded and regenerated.

## Non-goals

- Changing the option count from 4.
- New question types (multi-select, true/false, free text).
- Backend-side shuffling or server-assigned labels.
- Questions with more than one correct option (the schema allows it later; validation rejects it now).
- Migrating or reading old-shape data.

## Success signal

- One question served by the API, presented in two quiz runs, shows its correct answer under different letters, and both runs grade the answer correctly.
