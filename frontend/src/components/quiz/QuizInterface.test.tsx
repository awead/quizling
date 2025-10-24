/**
 * Tests for QuizInterface Component
 */

import { render, screen, waitFor } from '@/test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuizInterface from './QuizInterface';
import { fetchQuestions } from '@/api';
import { createQuestions, createPaginatedResponse } from '@/test/factories';

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestions: vi.fn(),
}));

describe('QuizInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show start screen initially', () => {
    render(<QuizInterface questionCount={10} />);

    expect(screen.getByText('Ready to Test Your Knowledge?')).toBeInTheDocument();
    expect(screen.getByText(/This quiz contains 10 questions/)).toBeInTheDocument();
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });

  it('should show loading state when fetching questions', async () => {
    const mockQuestions = createQuestions(5);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 5,
    });

    // Delay the response to see loading state
    vi.mocked(fetchQuestions).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 100);
        })
    );

    render(<QuizInterface questionCount={5} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText(/Loading quiz questions/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText(/Loading quiz questions/)).not.toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    vi.mocked(fetchQuestions).mockRejectedValue(new Error('Network error'));

    render(<QuizInterface questionCount={5} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display quiz questions after starting', async () => {
    const mockQuestions = createQuestions(3);
    mockQuestions[0].question = 'First question?';
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={3} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText('First question?')).toBeInTheDocument();
    });

    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
  });

  it('should allow answer selection', async () => {
    const mockQuestions = createQuestions(3);
    mockQuestions[0].options = [
      { label: 'A', text: 'Answer A' },
      { label: 'B', text: 'Answer B' },
      { label: 'C', text: 'Answer C' },
      { label: 'D', text: 'Answer D' },
    ];
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={3} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText('Answer A')).toBeInTheDocument();
    });

    const answerButton = screen.getByText('Answer B').closest('button');
    answerButton?.click();

    // Should show answer count updated (wait for state update)
    await waitFor(() => {
      const answerCountText = document.body.textContent || '';
      expect(answerCountText).toMatch(/1\s+of\s+3\s+answered/);
    });
  });

  it('should navigate between questions', async () => {
    const mockQuestions = createQuestions(3);
    mockQuestions[0].question = 'Question 1?';
    mockQuestions[1].question = 'Question 2?';
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={3} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Click next
    const nextButton = screen.getByText('Next');
    nextButton.click();

    await waitFor(() => {
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();

    // Click previous
    const prevButton = screen.getByText('Previous');
    prevButton.click();

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });
  });

  it('should show submit button on last question', async () => {
    const mockQuestions = createQuestions(2);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 2,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={2} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    // Go to last question
    const nextButton = screen.getByText('Next');
    nextButton.click();

    // Should show Submit instead of Next (wait for navigation)
    await waitFor(() => {
      expect(screen.getByText('Submit Quiz')).toBeInTheDocument();
    });
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('should show results after submitting quiz', async () => {
    const mockQuestions = createQuestions(2);
    mockQuestions[0].correct_answer = 'A';
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 2,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={2} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    // Answer first question
    const answerButtons = screen.getAllByRole('button');
    const firstAnswer = answerButtons.find((btn) => btn.textContent?.includes('A'));
    firstAnswer?.click();

    // Go to last question
    const nextButton = screen.getByText('Next');
    nextButton.click();

    // Wait for navigation to last question and submit button to appear
    await waitFor(() => {
      expect(screen.getByText('Submit Quiz')).toBeInTheDocument();
    });

    // Submit quiz
    const submitButton = screen.getByText('Submit Quiz');
    submitButton.click();

    // Should show results
    await waitFor(() => {
      expect(screen.getByText('Review Your Answers')).toBeInTheDocument();
    });
  });

  it('should show progress bar', async () => {
    const mockQuestions = createQuestions(3);
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    });
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse);

    render(<QuizInterface questionCount={3} />);

    const startButton = screen.getByText('Start Quiz');
    startButton.click();

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    // Progress bar should be visible (it's a div with bg-primary-600 class)
    const progressBar = document.querySelector('.bg-primary-600');
    expect(progressBar).toBeInTheDocument();
  });
});
