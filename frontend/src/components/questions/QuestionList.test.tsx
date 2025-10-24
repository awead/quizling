/**
 * Tests for QuestionList Component
 */

import { render, screen } from '@/test/test-utils'
import QuestionList from './QuestionList'
import { createQuestions } from '@/test/factories'
import { describe, it, expect } from 'vitest'

describe('QuestionList', () => {
  it('should render list of questions', () => {
    const questions = createQuestions(3)

    render(<QuestionList questions={questions} isLoading={false} />)

    // Should render 3 question cards (each has a link)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
  })

  it('should show loading spinner when loading', () => {
    render(<QuestionList questions={[]} isLoading={true} />)

    // LoadingSpinner should be in the document
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('should show empty state when no questions', () => {
    render(<QuestionList questions={[]} isLoading={false} />)

    expect(
      screen.getByText(/No questions found. Try adjusting your search or filters./)
    ).toBeInTheDocument()
  })
})
