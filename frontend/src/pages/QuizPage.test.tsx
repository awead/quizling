/**
 * Tests for QuizPage
 */

import { render, screen } from '@/test/test-utils';
import { describe, it, expect } from 'vitest';
import QuizPage from './QuizPage';

describe('QuizPage', () => {
  it('should render page title and description', () => {
    render(<QuizPage />);

    expect(screen.getByText('Take Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test your knowledge')).toBeInTheDocument();
  });

  it('should render QuizInterface component', () => {
    render(<QuizPage />);

    // QuizInterface shows the start screen by default
    expect(screen.getByText('Ready to Test Your Knowledge?')).toBeInTheDocument();
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });
});
