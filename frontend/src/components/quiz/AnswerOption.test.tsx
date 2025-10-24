/**
 * Tests for AnswerOption Component
 */

import { render, screen } from '@/test/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AnswerOption from './AnswerOption';

describe('AnswerOption', () => {
  it('should render answer text with label', () => {
    render(
      <AnswerOption
        label="A"
        text="Paris"
        isSelected={false}
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should apply selected styling when isSelected is true', () => {
    render(
      <AnswerOption
        label="B"
        text="London"
        isSelected={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-100');
  });

  it('should not apply selected styling when isSelected is false', () => {
    render(
      <AnswerOption
        label="B"
        text="London"
        isSelected={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();

    render(
      <AnswerOption
        label="C"
        text="Berlin"
        isSelected={false}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show correct state with green styling in review mode', () => {
    render(
      <AnswerOption
        label="D"
        text="Madrid"
        isSelected={false}
        isCorrect={true}
        showResults={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-100');

    // Should show checkmark icon
    const svg = button.querySelector('svg');
    expect(svg).toHaveClass('text-green-600');
  });

  it('should show incorrect state with red styling in review mode', () => {
    render(
      <AnswerOption
        label="A"
        text="Wrong answer"
        isSelected={true}
        isIncorrect={true}
        showResults={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-100');

    // Should show X icon
    const svg = button.querySelector('svg');
    expect(svg).toHaveClass('text-red-600');
  });

  it('should be disabled in review mode', () => {
    render(
      <AnswerOption
        label="B"
        text="Some answer"
        isSelected={false}
        showResults={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not be disabled during quiz', () => {
    render(
      <AnswerOption
        label="B"
        text="Some answer"
        isSelected={false}
        showResults={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });
});
