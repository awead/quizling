/**
 * Tests for QuestionsPage
 */

import { render, screen, waitFor } from '@/test/test-utils'
import QuestionsPage from './QuestionsPage'
import { fetchQuestions } from '@/api'
import { createQuestions, createPaginatedResponse } from '@/test/factories'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestions: vi.fn(),
}))

describe('QuestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page with title and filters', async () => {
    const mockQuestions = createQuestions(5)
    const mockResponse = createPaginatedResponse({ data: mockQuestions })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />)

    expect(screen.getByText('Browse Questions')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Difficulty')).toBeInTheDocument()

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getAllByRole('link')).toHaveLength(5)
    })
  })

  it('should filter questions by difficulty', async () => {
    const user = userEvent.setup()
    const mockQuestions = createQuestions(3, { difficulty: 'hard' })
    const mockResponse = createPaginatedResponse({ data: mockQuestions })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledTimes(1)
    })

    // Select difficulty
    const difficultySelect = screen.getByLabelText('Difficulty')
    await user.selectOptions(difficultySelect, 'hard')

    // Should make a new API call with difficulty filter
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'hard' }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })
  })

  it('should search questions with debounce', async () => {
    const user = userEvent.setup()
    const mockQuestions = createQuestions(2)
    const mockResponse = createPaginatedResponse({ data: mockQuestions })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledTimes(1)
    })

    const searchInput = screen.getByLabelText('Search')
    await user.type(searchInput, 'test')

    // Should eventually make API call with search term (after debounce)
    await waitFor(
      () => {
        expect(fetchQuestions).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'test' }),
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        )
      },
      { timeout: 1000 }
    )
  })

  it('should handle pagination', async () => {
    const user = userEvent.setup()
    const mockQuestions = createQuestions(20)
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      has_more: true,
      total: 40,
    })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />)

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should fetch next page
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ cursor: 20 }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })
  })

  it('should initialize state from URL search parameters', async () => {
    const mockQuestions = createQuestions(5)
    const mockResponse = createPaginatedResponse({ data: mockQuestions })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />, {
      initialEntries: ['/questions?search=test&difficulty=hard&page=3'],
    })

    // Should make API call with parameters from URL
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ 
          search: 'test',
          difficulty: 'hard',
          cursor: 40 // page 3 with 20 per page = cursor 40
        }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })
  })

  it('should handle invalid URL parameters gracefully', async () => {
    const mockQuestions = createQuestions(5)
    const mockResponse = createPaginatedResponse({ data: mockQuestions })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    render(<QuestionsPage />, {
      initialEntries: ['/questions?search=test&difficulty=invalid&page=abc'],
    })

    // Should make API call with valid parameters only and defaults for invalid ones
    await waitFor(() => {
      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ 
          search: 'test',
          // difficulty should be null (invalid value ignored)
          cursor: 0 // page defaults to 1, so cursor is 0
        }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      // Ensure difficulty is not passed for invalid values
      expect(fetchQuestions).toHaveBeenCalledWith(
        expect.not.objectContaining({ difficulty: 'invalid' }),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    })
  })
})
