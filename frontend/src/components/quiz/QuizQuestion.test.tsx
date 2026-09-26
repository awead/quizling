/**
 * Tests for QuizQuestion Component
 */

import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import QuizQuestion from './QuizQuestion';
import { createQuestion } from '@/test/factories';

describe('QuizQuestion', () => {
  const mockQuestion = createQuestion({
    question: 'What is the capital of France?',
    options: [
      { text: 'Madrid', is_correct: false },
      { text: 'Paris', is_correct: true },
      { text: 'Berlin', is_correct: false },
      { text: 'London', is_correct: false },
    ],
    difficulty: 'medium',
  });

  it('should render question text', () => {
    const mockHandler = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });

  it('should render all answer options', () => {
    const mockHandler = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('should letter options top to bottom in the given order', () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'AMadrid',
      'BParis',
      'CBerlin',
      'DLondon',
    ]);
  });

  it('should mark the is_correct option and a wrong selection in review mode', () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={0}
        onAnswerSelect={vi.fn()}
        showResults={true}
      />
    );

    expect(screen.getByText('Paris').closest('button')).toHaveClass('bg-green-100');
    expect(screen.getByText('Madrid').closest('button')).toHaveClass('bg-red-100');
    expect(screen.getByText('Berlin').closest('button')).not.toHaveClass('bg-red-100');
  });

  it('should display question number and total', () => {
    const mockHandler = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={5}
        totalQuestions={15}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    expect(screen.getByText('Question 5 of 15')).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    const mockHandler = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('should call onAnswerSelect when an answer is clicked', () => {
    const mockHandler = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    const parisButton = screen.getByText('Paris').closest('button');
    parisButton?.click();

    expect(mockHandler).toHaveBeenCalledWith(1);
  });

  it('should show explanation in review mode', () => {
    const mockHandler = vi.fn();
    const questionWithExplanation = createQuestion({
      ...mockQuestion,
      explanation: 'Paris is the capital of France.',
    });

    render(
      <QuizQuestion
        question={questionWithExplanation}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={1}
        onAnswerSelect={mockHandler}
        showResults={true}
      />
    );

    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Paris is the capital of France.')).toBeInTheDocument();
  });

  it('should not show explanation when not in review mode', () => {
    const mockHandler = vi.fn();
    const questionWithExplanation = createQuestion({
      ...mockQuestion,
      explanation: 'Paris is the capital of France.',
    });

    render(
      <QuizQuestion
        question={questionWithExplanation}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
        showResults={false}
      />
    );

    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
  });

  it('should apply correct difficulty color for easy questions', () => {
    const mockHandler = vi.fn();
    const easyQuestion = createQuestion({ ...mockQuestion, difficulty: 'easy' });

    render(
      <QuizQuestion
        question={easyQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    const badge = screen.getByText('easy');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should apply correct difficulty color for hard questions', () => {
    const mockHandler = vi.fn();
    const hardQuestion = createQuestion({ ...mockQuestion, difficulty: 'hard' });

    render(
      <QuizQuestion
        question={hardQuestion}
        questionNumber={1}
        totalQuestions={10}
        selectedOptionIndex={null}
        onAnswerSelect={mockHandler}
      />
    );

    const badge = screen.getByText('hard');
    expect(badge).toHaveClass('bg-red-100');
  });
});
