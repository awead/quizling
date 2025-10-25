/**
 * Tests for QuestionDetailPage
 */

import { render, screen, waitFor, userEvent } from '@/test/test-utils'
import QuestionDetailPage from './QuestionDetailPage'
import { fetchQuestionById } from '@/api'
import { createQuestion, createQuestionResponse } from '@/test/factories'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestionById: vi.fn(),
}))

describe('QuestionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    const mockQuestion = createQuestion()
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should display question details when loaded', async () => {
    const mockQuestion = createQuestion({
      question: 'What is the capital of France?',
      difficulty: 'medium',
      explanation: 'Paris is the capital of France.',
    })
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    })

    expect(screen.getByText('medium')).toBeInTheDocument()
    // Explanation should be hidden by default now
    expect(screen.queryByText('Paris is the capital of France.')).not.toBeInTheDocument()
    // Show Answer button should be present
    expect(screen.getByText('Show Answer')).toBeInTheDocument()
  })

  it('should show back button', async () => {
    const mockQuestion = createQuestion()
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      const backButtons = screen.getAllByText('Back to Questions')
      expect(backButtons[0]).toBeInTheDocument()
    })
  })

  it('should handle error state', async () => {
    const errorMessage = 'Failed to fetch question'
    vi.mocked(fetchQuestionById).mockRejectedValue(new Error(errorMessage))

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Should show back button even in error state
    expect(screen.getByText('Back to Questions')).toBeInTheDocument()
  })

  it('should hide answers by default', async () => {
    const mockQuestion = createQuestion({
      question: 'What is the capital of France?',
      correct_answer: 'A',
      explanation: 'Paris is the capital of France.',
    })
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    })

    // Answers should be hidden by default
    expect(screen.queryByText('Correct Answer')).not.toBeInTheDocument()
    expect(screen.queryByText('Paris is the capital of France.')).not.toBeInTheDocument()
    expect(screen.getByText('Show Answer')).toBeInTheDocument()
  })

  it('should show answers when Show Answer button is clicked', async () => {
    const mockQuestion = createQuestion({
      question: 'What is the capital of France?',
      correct_answer: 'A',
      explanation: 'Paris is the capital of France.',
    })
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    })

    // Click Show Answer button
    const showAnswerButton = screen.getByText('Show Answer')
    await userEvent.click(showAnswerButton)

    // Answers should now be visible
    expect(screen.getByText('Correct Answer')).toBeInTheDocument()
    expect(screen.getByText('Paris is the capital of France.')).toBeInTheDocument()
    expect(screen.getByText('Hide Answer')).toBeInTheDocument()
  })

  it('should hide answers when Hide Answer button is clicked after showing them', async () => {
    const mockQuestion = createQuestion({
      question: 'What is the capital of France?',
      correct_answer: 'A',
      explanation: 'Paris is the capital of France.',
    })
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    render(
      <Routes>
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Routes>,
      {
        initialEntries: ['/questions/507f1f77bcf86cd799439011'],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    })

    // Show answers first
    const showAnswerButton = screen.getByText('Show Answer')
    await userEvent.click(showAnswerButton)

    expect(screen.getByText('Correct Answer')).toBeInTheDocument()
    expect(screen.getByText('Paris is the capital of France.')).toBeInTheDocument()

    // Now hide answers
    const hideAnswerButton = screen.getByText('Hide Answer')
    await userEvent.click(hideAnswerButton)

    // Answers should be hidden again
    expect(screen.queryByText('Correct Answer')).not.toBeInTheDocument()
    expect(screen.queryByText('Paris is the capital of France.')).not.toBeInTheDocument()
    expect(screen.getByText('Show Answer')).toBeInTheDocument()
  })
})
