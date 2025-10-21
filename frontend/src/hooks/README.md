# Custom React Hooks

This directory contains custom React hooks for data fetching and utilities in the Quizling frontend.

## Available Hooks

### useDebounce

A generic debounce hook that delays updating a value until after a specified delay.

**Purpose:** Optimize performance by reducing the frequency of expensive operations like API calls triggered by user input.

**Signature:**
```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Example Usage:**
```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';

function SearchQuestions() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { questions } = useQuestions({ search: debouncedSearchTerm });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search questions..."
      />
      {/* Questions will only refetch 500ms after user stops typing */}
      <QuestionsList questions={questions} />
    </div>
  );
}
```

---

### useQuestion

A hook for fetching a single question by ID.

**Purpose:** Fetch and manage a single question's data, loading state, and errors.

**Signature:**
```typescript
function useQuestion(id: string | undefined): {
  question: MultipleChoiceQuestion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Example Usage:**
```typescript
import { useParams } from 'react-router-dom';
import { useQuestion } from '@/hooks';

function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { question, isLoading, error, refetch } = useQuestion(id);

  if (isLoading) {
    return <div>Loading question...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!question) {
    return <div>Question not found</div>;
  }

  return (
    <div>
      <h1>{question.question}</h1>
      <ul>
        {question.options.map((opt) => (
          <li key={opt.label}>{opt.label}. {opt.text}</li>
        ))}
      </ul>
      <p><strong>Difficulty:</strong> {question.difficulty}</p>
      {question.explanation && (
        <p><strong>Explanation:</strong> {question.explanation}</p>
      )}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

### useQuestions

A hook for fetching questions with optional filters and pagination.

**Purpose:** Fetch and manage a list of questions with filtering, searching, and pagination support.

**Signature:**
```typescript
interface UseQuestionsParams {
  difficulty?: DifficultyLevel | null;
  search?: string;
  cursor?: number;
  limit?: number;
}

function useQuestions(params?: UseQuestionsParams): {
  questions: MultipleChoiceQuestion[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    hasMore: boolean;
    total: number | null;
    nextCursor: string | null;
  };
  refetch: () => void;
}
```

**Example Usage:**

**Basic Usage:**
```typescript
import { useQuestions } from '@/hooks';

function QuestionsList() {
  const { questions, isLoading, error } = useQuestions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </div>
  );
}
```

**With Filters:**
```typescript
import { useState } from 'react';
import { useQuestions } from '@/hooks';
import type { DifficultyLevel } from '@/types';

function FilteredQuestionsList() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { questions, isLoading, error, refetch } = useQuestions({
    difficulty,
    search: searchTerm,
    limit: 20
  });

  return (
    <div>
      <select onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}>
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />

      <button onClick={refetch}>Refresh</button>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div>
          {questions.map((q) => (
            <QuestionCard key={q._id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**With Pagination:**
```typescript
import { useState } from 'react';
import { useQuestions } from '@/hooks';

function PaginatedQuestionsList() {
  const [cursor, setCursor] = useState<number>(0);
  const limit = 20;

  const { questions, isLoading, error, pagination } = useQuestions({
    cursor,
    limit
  });

  const handleNextPage = () => {
    if (pagination.nextCursor) {
      setCursor(parseInt(pagination.nextCursor, 10));
    }
  };

  const handlePrevPage = () => {
    setCursor(Math.max(0, cursor - limit));
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <div>
            {questions.map((q) => (
              <QuestionCard key={q._id} question={q} />
            ))}
          </div>

          <div>
            <button onClick={handlePrevPage} disabled={cursor === 0}>
              Previous
            </button>
            <span>
              {pagination.total ? `Total: ${pagination.total} questions` : ''}
            </span>
            <button onClick={handleNextPage} disabled={!pagination.hasMore}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

**Combined: Debounced Search with Filters:**
```typescript
import { useState } from 'react';
import { useQuestions, useDebounce } from '@/hooks';
import type { DifficultyLevel } from '@/types';

function AdvancedQuestionsList() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursor, setCursor] = useState<number>(0);

  // Debounce search to avoid API calls on every keystroke
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { questions, isLoading, error, pagination } = useQuestions({
    difficulty,
    search: debouncedSearch,
    cursor,
    limit: 20
  });

  // Reset cursor when filters change
  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as DifficultyLevel);
    setCursor(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCursor(0); // Reset to first page when search changes
  };

  return (
    <div>
      <div>
        <select onChange={(e) => handleDifficultyChange(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search questions..."
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <div>
            {questions.length === 0 ? (
              <p>No questions found</p>
            ) : (
              questions.map((q) => (
                <QuestionCard key={q._id} question={q} />
              ))
            )}
          </div>

          {questions.length > 0 && (
            <div>
              <button onClick={() => setCursor(Math.max(0, cursor - 20))} disabled={cursor === 0}>
                Previous
              </button>
              <span>{pagination.total ? `Total: ${pagination.total}` : ''}</span>
              <button
                onClick={() => setCursor(parseInt(pagination.nextCursor || '0', 10))}
                disabled={!pagination.hasMore}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## Implementation Details

### Memory Leak Prevention

All hooks implement cleanup functions to prevent memory leaks:
- `useDebounce`: Clears timeout on unmount
- `useQuestion`: Uses `isMounted` flag to prevent state updates after unmount
- `useQuestions`: Uses `isMounted` flag to prevent state updates after unmount

### Stable References

The `refetch` functions in `useQuestion` and `useQuestions` use `useCallback` to maintain stable references, preventing unnecessary re-renders in components that use these hooks.

### Error Handling

All data-fetching hooks:
- Catch and handle API errors gracefully
- Set error state with meaningful messages
- Reset error state on successful fetches
- Clear data on errors to avoid stale data

### TypeScript Support

All hooks are fully typed with TypeScript:
- Generic types for `useDebounce`
- Proper interfaces for parameters and return types
- Type imports from `@/types` and `@/api`
