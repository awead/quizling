/**
 * Tests for useQuestions Hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useQuestions } from './useQuestions'
import { fetchQuestions } from '@/api'
import { createQuestions, createPaginatedResponse } from '@/test/factories'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API module
vi.mock('@/api', () => ({
  fetchQuestions: vi.fn(),
}))

describe('useQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch questions successfully', async () => {
    const mockQuestions = createQuestions(5)
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 5,
      has_more: false,
      next_cursor: null,
    })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestions())

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.questions).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.questions).toEqual(mockQuestions)
    expect(result.current.pagination.total).toBe(5)
    expect(result.current.pagination.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should filter by difficulty', async () => {
    const mockQuestions = createQuestions(3, { difficulty: 'hard' })
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 3,
    })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestions({ difficulty: 'hard' }))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(fetchQuestions).toHaveBeenCalledWith({
      difficulty: 'hard',
    })
    expect(result.current.questions).toEqual(mockQuestions)
  })

  it('should return pagination info correctly', async () => {
    const mockQuestions = createQuestions(20)
    const mockResponse = createPaginatedResponse({
      data: mockQuestions,
      total: 50,
      has_more: true,
      next_cursor: '20',
    })
    vi.mocked(fetchQuestions).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useQuestions({ limit: 20 }))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.pagination.hasMore).toBe(true)
    expect(result.current.pagination.total).toBe(50)
    expect(result.current.pagination.nextCursor).toBe('20')
  })

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch questions'
    vi.mocked(fetchQuestions).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useQuestions())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.questions).toEqual([])
    expect(result.current.pagination.hasMore).toBe(false)
    expect(result.current.pagination.total).toBeNull()
  })
})
