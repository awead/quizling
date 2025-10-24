/**
 * Tests for QuizResults Component
 */

import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import QuizResults from './QuizResults';
import { createQuestions } from '@/test/factories';
import type { UserAnswer } from '@/hooks';

describe('QuizResults', () => {
  const mockQuestions = createQuestions(10);

  it('should display score and percentage', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // Add 7 correct answers
    for (let i = 0; i < 7; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }
    // Add 3 incorrect answers
    for (let i = 7; i < 10; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'B',
        isCorrect: false,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={7}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('7 out of 10 correct')).toBeInTheDocument();
  });

  it('should show outstanding performance message for 90%+', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // 9 out of 10 correct = 90%
    for (let i = 0; i < 9; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={9}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('Outstanding!')).toBeInTheDocument();
    expect(screen.getByText('You have excellent knowledge!')).toBeInTheDocument();
  });

  it('should show great job message for 70-89%', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // 7 out of 10 correct = 70%
    for (let i = 0; i < 7; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={7}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('Great Job!')).toBeInTheDocument();
  });

  it('should show good effort message for 50-69%', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // 5 out of 10 correct = 50%
    for (let i = 0; i < 5; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={5}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('Good Effort')).toBeInTheDocument();
  });

  it('should show keep learning message for below 50%', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // 3 out of 10 correct = 30%
    for (let i = 0; i < 3; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={3}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('Keep Learning')).toBeInTheDocument();
  });

  it('should call onRetake when retake button is clicked', () => {
    const userAnswers = new Map<string, UserAnswer>();
    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={5}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    const buttons = screen.getAllByText('Take Another Quiz');
    buttons[0].click();

    expect(mockRetake).toHaveBeenCalledTimes(1);
  });

  it('should display review section with all questions', () => {
    const userAnswers = new Map<string, UserAnswer>();
    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={5}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    expect(screen.getByText('Review Your Answers')).toBeInTheDocument();

    // Should show all 10 questions
    mockQuestions.forEach((question) => {
      expect(screen.getByText(question.question)).toBeInTheDocument();
    });
  });

  it('should show message for unanswered questions', () => {
    const userAnswers = new Map<string, UserAnswer>();
    // Only answer first 5 questions
    for (let i = 0; i < 5; i++) {
      userAnswers.set(mockQuestions[i].id, {
        questionId: mockQuestions[i].id,
        selectedAnswer: 'A',
        isCorrect: true,
      });
    }

    const mockRetake = vi.fn();

    render(
      <QuizResults
        score={5}
        totalQuestions={10}
        questions={mockQuestions}
        userAnswers={userAnswers}
        onRetake={mockRetake}
      />
    );

    // Should show unanswered message for questions without answers
    const unansweredMessages = screen.getAllByText('You did not answer this question.');
    expect(unansweredMessages.length).toBeGreaterThan(0);
  });
});
