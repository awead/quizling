/**
 * useQuestions Hook
 *
 * A custom hook for fetching questions with optional filters and pagination.
 * Handles loading states, error states, pagination, and provides a refetch function.
 *
 * @param params - Optional query parameters for filtering and pagination
 * @param params.difficulty - Filter by difficulty level
 * @param params.search - Search term to filter questions
 * @param params.cursor - Pagination cursor (question index to start from)
 * @param params.limit - Maximum number of questions to return
 * @returns Object containing questions array, loading state, error state, pagination info, and refetch function
 *
 * @example
 * ```typescript
 * function QuestionsList() {
 *   const [search, setSearch] = useState('');
 *   const { questions, isLoading, error, pagination, refetch } = useQuestions({
 *     difficulty: 'medium',
 *     search,
 *     limit: 20
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {questions.map((q) => (
 *         <QuestionCard key={q._id} question={q} />
 *       ))}
 *       {pagination.hasMore && <button>Load More</button>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchQuestions } from '@/api';
import type { MultipleChoiceQuestion, DifficultyLevel } from '@/types';

export interface UseQuestionsParams {
  difficulty?: DifficultyLevel | null;
  search?: string;
  cursor?: number;
  limit?: number;
}

interface UseQuestionsReturn {
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

export function useQuestions(params?: UseQuestionsParams): UseQuestionsReturn {
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    hasMore: boolean;
    total: number | null;
    nextCursor: string | null;
  }>({
    hasMore: false,
    total: null,
    nextCursor: null,
  });
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  // Fetch questions from API
  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Filter out null difficulty value
        const queryParams: {
          difficulty?: DifficultyLevel;
          search?: string;
          cursor?: number;
          limit?: number;
        } = {};

        if (params?.difficulty) {
          queryParams.difficulty = params.difficulty;
        }
        if (params?.search) {
          queryParams.search = params.search;
        }
        if (params?.cursor !== undefined) {
          queryParams.cursor = params.cursor;
        }
        if (params?.limit !== undefined) {
          queryParams.limit = params.limit;
        }

        const response = await fetchQuestions(queryParams);

        if (isMounted) {
          setQuestions(response.data);
          setPagination({
            hasMore: response.has_more,
            total: response.total,
            nextCursor: response.next_cursor,
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
          setError(errorMessage);
          setQuestions([]);
          setPagination({
            hasMore: false,
            total: null,
            nextCursor: null,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [params?.difficulty, params?.search, params?.cursor, params?.limit, refetchTrigger]);

  // Refetch function with stable reference
  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return {
    questions,
    isLoading,
    error,
    pagination,
    refetch,
  };
}
