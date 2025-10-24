/**
 * Tests for QuestionDetailPage
 */

import { render, screen, waitFor } from '@/test/test-utils'
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
    expect(screen.getByText('Paris is the capital of France.')).toBeInTheDocument()
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
})
