/**
 * Tests for useQuiz Hook
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useQuiz } from './useQuiz';
import { fetchQuestions } from '@/api';
import { createQuestions, createPaginatedResponse } from '@/test/factories';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestions: vi.fn(),
}));

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('should select answer and track if correct', async () => {
    const mockQuestions = createQuestions(3);
    // Set known correct answer for first question
    mockQuestions[0].correct_answer = 'B';
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

    // Select correct answer
    act(() => {
      result.current.selectAnswer('B');
    });

    expect(result.current.userAnswers.size).toBe(1);
    expect(result.current.selectedAnswer).toBe('B');
    const answer = result.current.userAnswers.get(mockQuestions[0].id);
    expect(answer?.isCorrect).toBe(true);
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
    const mockQuestions = createQuestions(3);
    mockQuestions[0].correct_answer = 'A';
    mockQuestions[1].correct_answer = 'B';
    mockQuestions[2].correct_answer = 'C';
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

    // Answer first question correctly
    act(() => {
      result.current.selectAnswer('A');
      result.current.nextQuestion();
    });

    // Answer second question incorrectly
    act(() => {
      result.current.selectAnswer('D');
      result.current.nextQuestion();
    });

    // Answer third question correctly
    act(() => {
      result.current.selectAnswer('C');
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
      result.current.selectAnswer('A');
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
