/**
 * Tests for useQuestion Hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useQuestion } from './useQuestion'
import { fetchQuestionById } from '@/api'
import { createQuestion, createQuestionResponse } from '@/test/factories'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestionById: vi.fn(),
}))

describe('useQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch question successfully', async () => {
    const mockQuestion = createQuestion()
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestion('507f1f77bcf86cd799439011'))

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.question).toBeNull()
    expect(result.current.error).toBeNull()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.question).toEqual(mockQuestion)
    expect(result.current.error).toBeNull()
    expect(fetchQuestionById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      { signal: expect.any(AbortSignal) }
    )
  })

  it('should handle loading state correctly', async () => {
    const mockQuestion = createQuestion()
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestion('507f1f77bcf86cd799439011'))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch question'
    vi.mocked(fetchQuestionById).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useQuestion('507f1f77bcf86cd799439011'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.question).toBeNull()
  })

  it('should refetch question when refetch is called', async () => {
    const mockQuestion = createQuestion()
    const mockResponse = createQuestionResponse({ data: mockQuestion })
    vi.mocked(fetchQuestionById).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestion('507f1f77bcf86cd799439011'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(fetchQuestionById).toHaveBeenCalledTimes(1)

    // Call refetch
    result.current.refetch()

    await waitFor(() => {
      expect(fetchQuestionById).toHaveBeenCalledTimes(2)
    })
  })
})
