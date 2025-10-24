/**
 * Tests for QuestionCard Component
 */

import { render, screen } from '@/test/test-utils'
import QuestionCard from './QuestionCard'
import { createQuestion } from '@/test/factories'
import { describe, it, expect } from 'vitest'

describe('QuestionCard', () => {
  it('should render question text', () => {
    const question = createQuestion({
      question: 'What is the capital of France?',
    })

    render(<QuestionCard question={question} />)

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })

  it('should display difficulty badge', () => {
    const question = createQuestion({ difficulty: 'hard' })

    render(<QuestionCard question={question} />)

    const badge = screen.getByText('hard')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('uppercase')
  })

  it('should link to question detail page', () => {
    const question = createQuestion({ id: '507f1f77bcf86cd799439011' })

    render(<QuestionCard question={question} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/questions/507f1f77bcf86cd799439011')
  })

  it('should truncate long question text', () => {
    const longQuestion = 'A'.repeat(150)
    const question = createQuestion({ question: longQuestion })

    render(<QuestionCard question={question} />)

    const displayedText = screen.getByText(/A+\.\.\./)
    expect(displayedText.textContent?.length).toBeLessThan(longQuestion.length)
  })
})
