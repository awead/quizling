/**
 * Tests for useQuiz Hook
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useQuiz } from './useQuiz';
import { fetchQuestions } from '@/api';
import { createQuestions, createPaginatedResponse } from '@/test/factories';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// With Math.random pinned, shuffle() is deterministic: 0.99 keeps the stored
// order, 0 rotates the first option to the end (London, Paris, … → Paris, …, London).
const KEEP_ORDER = 0.99;
const ROTATE = 0;

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestions: vi.fn(),
}));

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(KEEP_ORDER);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function startQuiz(result: { current: ReturnType<typeof useQuiz> }) {
    act(() => {
      result.current.startQuiz();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  }

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useQuiz(15));

    expect(result.current.questions).toEqual([]);
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.userAnswers.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isQuizComplete).toBe(false);
    expect(result.current.isQuizStarted).toBe(false);
    expect(result.current.score).toBe(0);
  });

  it('should fetch questions when quiz starts', async () => {
    const mockQuestions = createQuestions(15);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 15,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuiz(15));

    act(() => {
      result.current.startQuiz();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isQuizStarted).toBe(true);

    // Wait for questions to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.totalQuestions).toBe(15);
    expect(fetchQuestions).toHaveBeenCalledWith(
      { limit: 15 },
      { signal: expect.any(AbortSignal) }
    );
  });

  it('should handle API errors when fetching questions', async () => {
    const errorMessage = 'Failed to load quiz questions';
    vi.mocked(fetchQuestions).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useQuiz(15));

    act(() => {
      result.current.startQuiz();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.questions).toEqual([]);
  });

  it('should grade a selection by the option is_correct flag', async () => {
    const mockQuestions = createQuestions(3);
    vi.mocked(fetchQuestions).mockResolvedValue(
      createPaginatedResponse({ data: mockQuestions, total: 3 })
    );

    const { result } = renderHook(() => useQuiz(3));
    await startQuiz(result);

    const parisIndex = result.current.currentQuestion!.options.findIndex(
      (option) => option.text === 'Paris'
    );
    act(() => {
      result.current.selectAnswer(parisIndex);
    });

    expect(result.current.userAnswers.size).toBe(1);
    expect(result.current.selectedOptionIndex).toBe(parisIndex);
    expect(result.current.userAnswers.get(mockQuestions[0].id)?.isCorrect).toBe(true);

    const londonIndex = result.current.currentQuestion!.options.findIndex(
      (option) => option.text === 'London'
    );
    act(() => {
      result.current.selectAnswer(londonIndex);
    });

    expect(result.current.userAnswers.get(mockQuestions[0].id)?.isCorrect).toBe(false);
  });

  it('should shuffle options when a new quiz starts', async () => {
    const [question] = createQuestions(1);
    vi.mocked(fetchQuestions).mockResolvedValue(
      createPaginatedResponse({ data: [question], total: 1 })
    );
    const { result } = renderHook(() => useQuiz(1));

    await startQuiz(result);
    const firstRunCorrectIndex = result.current.currentQuestion!.options.findIndex(
      (option) => option.is_correct
    );

    vi.mocked(Math.random).mockReturnValue(ROTATE);
    await startQuiz(result);
    const secondRunCorrectIndex = result.current.currentQuestion!.options.findIndex(
      (option) => option.is_correct
    );

    expect(firstRunCorrectIndex).toBe(1);
    expect(secondRunCorrectIndex).toBe(0);

    act(() => {
      result.current.selectAnswer(secondRunCorrectIndex);
    });
    expect(result.current.score).toBe(1);
  });

  it('should keep option order stable within a quiz', async () => {
    vi.mocked(Math.random).mockReturnValue(ROTATE);
    vi.mocked(fetchQuestions).mockResolvedValue(
      createPaginatedResponse({ data: createQuestions(2), total: 2 })
    );
    const { result, rerender } = renderHook(() => useQuiz(2));
    await startQuiz(result);
    const optionsBefore = result.current.currentQuestion!.options;

    vi.mocked(Math.random).mockReturnValue(KEEP_ORDER);
    rerender();
    act(() => {
      result.current.selectAnswer(2);
      result.current.nextQuestion();
    });
    act(() => {
      result.current.previousQuestion();
    });

    expect(result.current.currentQuestion!.options).toEqual(optionsBefore);
    expect(result.current.selectedOptionIndex).toBe(2);
  });

  it('should navigate through questions', async () => {
    const mockQuestions = createQuestions(3);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially at first question
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.isFirstQuestion).toBe(true);
    expect(result.current.canGoPrevious).toBe(false);

    // Navigate to next question
    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(1);
    expect(result.current.canGoPrevious).toBe(true);
    expect(result.current.canGoNext).toBe(true);

    // Navigate to last question
    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(2);
    expect(result.current.isLastQuestion).toBe(true);
    expect(result.current.canGoNext).toBe(false);

    // Navigate back
    act(() => {
      result.current.previousQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(1);
  });

  it('should calculate score correctly', async () => {
    // Factory questions keep Paris (the correct option) at index 1 under KEEP_ORDER.
    vi.mocked(fetchQuestions).mockResolvedValue(
      createPaginatedResponse({ data: createQuestions(3), total: 3 })
    );

    const { result } = renderHook(() => useQuiz(3));
    await startQuiz(result);

    act(() => {
      result.current.selectAnswer(1);
      result.current.nextQuestion();
    });

    act(() => {
      result.current.selectAnswer(3);
      result.current.nextQuestion();
    });

    act(() => {
      result.current.selectAnswer(1);
    });

    expect(result.current.score).toBe(2);
  });

  it('should submit quiz and show results', async () => {
    const mockQuestions = createQuestions(3);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isQuizComplete).toBe(false);

    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.isQuizComplete).toBe(true);
  });

  it('should reset quiz to initial state', async () => {
    const mockQuestions = createQuestions(3);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuiz(3));

    act(() => {
      result.current.startQuiz();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Answer some questions
    act(() => {
      result.current.selectAnswer(0);
      result.current.nextQuestion();
      result.current.submitQuiz();
    });

    expect(result.current.isQuizComplete).toBe(true);

    // Reset quiz
    act(() => {
      result.current.resetQuiz();
    });

    expect(result.current.isQuizStarted).toBe(false);
    expect(result.current.isQuizComplete).toBe(false);
    expect(result.current.questions).toEqual([]);
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.userAnswers.size).toBe(0);
  });
});
