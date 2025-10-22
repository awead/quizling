/**
 * useQuestion Hook
 *
 * A custom hook for fetching a single question by ID from the API.
 * Handles loading states, error states, and provides a refetch function.
 *
 * @param id - MongoDB ObjectId string of the question (undefined if not available)
 * @returns Object containing question data, loading state, error state, and refetch function
 *
 * @example
 * ```typescript
 * function QuestionDetail({ id }: { id: string }) {
 *   const { question, isLoading, error, refetch } = useQuestion(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!question) return <div>Question not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{question.question}</h1>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchQuestionById } from '@/api';
import type { MultipleChoiceQuestion } from '@/types';

interface UseQuestionReturn {
  question: MultipleChoiceQuestion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuestion(id: string | undefined): UseQuestionReturn {
  const [question, setQuestion] = useState<MultipleChoiceQuestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  useEffect(() => {
    if (!id) {
      setQuestion(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchQuestion = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchQuestionById(id);
        if (isMounted) {
          setQuestion(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch question';
          setError(errorMessage);
          setQuestion(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchQuestion();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [id, refetchTrigger]);

  // Refetch function with stable reference
  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return {
    question,
    isLoading,
    error,
    refetch,
  };
}
