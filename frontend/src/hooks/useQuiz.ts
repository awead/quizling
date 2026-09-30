/**
 * useQuiz Hook
 *
 * A custom hook for managing quiz state, including fetching questions,
 * tracking answers, navigation, and scoring.
 *
 * @param questionCount - Number of questions to fetch for the quiz (default: 15)
 * @returns Object containing quiz state, methods, and computed values
 *
 * @example
 * ```typescript
 * function QuizInterface() {
 *   const {
 *     questions,
 *     currentQuestionIndex,
 *     userAnswers,
 *     isLoading,
 *     error,
 *     isQuizComplete,
 *     currentQuestion,
 *     score,
 *     startQuiz,
 *     selectAnswer,
 *     nextQuestion,
 *     previousQuestion,
 *     submitQuiz
 *   } = useQuiz(15);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (isQuizComplete) return <QuizResults score={score} />;
 *
 *   return <QuizQuestion question={currentQuestion} />;
 * }
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { fetchQuestions } from '@/api';
import { ApiError } from '@/api/errors';
import type { MultipleChoiceQuestion } from '@/types';
import { shuffle } from '@/utils/shuffle';

export interface UserAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

interface UseQuizReturn {
  // State
  questions: MultipleChoiceQuestion[];
  currentQuestionIndex: number;
  userAnswers: Map<string, UserAnswer>;
  isLoading: boolean;
  error: string | null;
  isQuizComplete: boolean;
  isQuizStarted: boolean;

  // Computed values
  currentQuestion: MultipleChoiceQuestion | null;
  selectedOptionIndex: number | null;
  score: number;
  totalQuestions: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Methods
  startQuiz: () => void;
  selectAnswer: (optionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

export function useQuiz(questionCount: number = 15): UseQuizReturn {
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);

  // Fetch questions when quiz starts
  const loadQuestions = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchQuestions({ limit: questionCount }, { signal });

      if (response.data.length === 0) {
        setError('No questions available. Please try again later.');
        return;
      }

      // Shuffled once per load so the correct option's letter varies between
      // quizzes; the order then stays fixed for the rest of this quiz.
      setQuestions(
        response.data.map((question) => ({ ...question, options: shuffle(question.options) }))
      );
      setError(null);
    } catch (err) {
      // Handle ApiError instances from the API client
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to load quiz questions';
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [questionCount]);

  // Start the quiz
  const startQuiz = useCallback(() => {
    const abortController = new AbortController();
    setIsQuizStarted(true);
    setIsQuizComplete(false);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    loadQuestions(abortController.signal);
  }, [loadQuestions]);

  // Select an answer for the current question
  const selectAnswer = useCallback((optionIndex: number) => {
    const question = questions[currentQuestionIndex];
    const option = question?.options[optionIndex];
    if (!option) return;

    const isCorrect = option.is_correct;

    setUserAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(question.id, {
        questionId: question.id,
        selectedOptionIndex: optionIndex,
        isCorrect,
      });
      return newAnswers;
    });
  }, [questions, currentQuestionIndex]);

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Submit the quiz and show results
  const submitQuiz = useCallback(() => {
    setIsQuizComplete(true);
  }, []);

  // Reset quiz to initial state
  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setIsQuizComplete(false);
    setIsQuizStarted(false);
    setError(null);
  }, []);

  // Computed values
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  const selectedOptionIndex = useMemo(() => {
    if (!currentQuestion) return null;
    return userAnswers.get(currentQuestion.id)?.selectedOptionIndex ?? null;
  }, [currentQuestion, userAnswers]);

  const score = useMemo(() => {
    let correctCount = 0;
    userAnswers.forEach((answer) => {
      if (answer.isCorrect) correctCount++;
    });
    return correctCount;
  }, [userAnswers]);

  const totalQuestions = questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;

  return {
    // State
    questions,
    currentQuestionIndex,
    userAnswers,
    isLoading,
    error,
    isQuizComplete,
    isQuizStarted,

    // Computed values
    currentQuestion,
    selectedOptionIndex,
    score,
    totalQuestions,
    isFirstQuestion,
    isLastQuestion,
    canGoNext,
    canGoPrevious,

    // Methods
    startQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  };
}
