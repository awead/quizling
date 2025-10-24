/**
 * Questions API Service Tests
 *
 * Tests for the questions API service functions:
 * - fetchQuestions with various query parameters
 * - fetchQuestionById for single question retrieval
 * - healthCheck for API health status
 * - Error handling and edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchQuestions, fetchQuestionById, healthCheck } from './questions'
import { ENDPOINTS } from './endpoints'
import {
  createPaginatedResponse,
  createQuestionResponse,
  createHealthResponse,
  createQuestions,
} from '@/test/factories'
import apiClient from './client'

// Mock the API client
vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Questions API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchQuestions', () => {
    it('should fetch questions without parameters', async () => {
      const mockResponse = createPaginatedResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions()

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONS, {
        params: undefined,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch questions with difficulty filter', async () => {
      const mockResponse = createPaginatedResponse({
        data: createQuestions(3, { difficulty: 'hard' }),
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions({ difficulty: 'hard' })

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONS, {
        params: { difficulty: 'hard' },
      })
      expect(result.data).toHaveLength(3)
      expect(result.data[0].difficulty).toBe('hard')
    })

    it('should fetch questions with search parameter', async () => {
      const mockResponse = createPaginatedResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions({ search: 'JavaScript' })

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONS, {
        params: { search: 'JavaScript' },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should fetch questions with pagination parameters', async () => {
      const mockResponse = createPaginatedResponse({
        data: createQuestions(20),
        next_cursor: '20',
        has_more: true,
        total: 100,
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions({ cursor: 0, limit: 20 })

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONS, {
        params: { cursor: 0, limit: 20 },
      })
      expect(result.has_more).toBe(true)
      expect(result.next_cursor).toBe('20')
    })

    it('should fetch questions with multiple filters', async () => {
      const mockResponse = createPaginatedResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      await fetchQuestions({
        difficulty: 'medium',
        search: 'React',
        cursor: 10,
        limit: 10,
      })

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.QUESTIONS, {
        params: {
          difficulty: 'medium',
          search: 'React',
          cursor: 10,
          limit: 10,
        },
      })
    })

    it('should handle empty results', async () => {
      const mockResponse = createPaginatedResponse({
        data: [],
        total: 0,
        has_more: false,
        next_cursor: null,
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions()

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should handle API errors', async () => {
      const mockError = {
        status: 500,
        detail: 'Internal server error',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(fetchQuestions()).rejects.toMatchObject({
        status: 500,
        detail: 'Internal server error',
      })
    })

    it('should handle network errors', async () => {
      const mockError = {
        detail: 'Network error: Unable to reach the server',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(fetchQuestions()).rejects.toMatchObject({
        detail: 'Network error: Unable to reach the server',
      })
    })
  })

  describe('fetchQuestionById', () => {
    const questionId = '507f1f77bcf86cd799439011'

    it('should fetch a single question by ID', async () => {
      const mockResponse = createQuestionResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestionById(questionId)

      expect(apiClient.get).toHaveBeenCalledWith(
        ENDPOINTS.QUESTION_BY_ID(questionId)
      )
      expect(result).toEqual(mockResponse)
      expect(result.data.id).toBe('507f1f77bcf86cd799439011')
    })

    it('should handle 404 when question not found', async () => {
      const mockError = {
        status: 404,
        detail: 'Question not found',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(fetchQuestionById(questionId)).rejects.toMatchObject({
        status: 404,
        detail: 'Question not found',
      })
    })

    it('should handle invalid ObjectId format', async () => {
      const mockError = {
        status: 400,
        detail: 'Invalid question ID format',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(fetchQuestionById('invalid-id')).rejects.toMatchObject({
        status: 400,
        detail: 'Invalid question ID format',
      })
    })

    it('should fetch questions with different difficulties', async () => {
      const easyQuestion = createQuestionResponse({
        data: createQuestions(1, { difficulty: 'easy' })[0],
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: easyQuestion })

      const result = await fetchQuestionById(questionId)

      expect(result.data.difficulty).toBe('easy')
    })
  })

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const mockResponse = createHealthResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await healthCheck()

      expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.HEALTH_CHECK)
      expect(result.status).toBe('healthy')
      expect(result.service).toBe('quizling-api')
    })

    it('should handle unhealthy status', async () => {
      const mockResponse = createHealthResponse({
        status: 'unhealthy',
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await healthCheck()

      expect(result.status).toBe('unhealthy')
    })

    it('should handle health check endpoint failure', async () => {
      const mockError = {
        status: 503,
        detail: 'Service unavailable',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(healthCheck()).rejects.toMatchObject({
        status: 503,
        detail: 'Service unavailable',
      })
    })

    it('should handle timeout errors', async () => {
      const mockError = {
        detail: 'Network error: Unable to reach the server',
      }

      vi.mocked(apiClient.get).mockRejectedValue(mockError)

      await expect(healthCheck()).rejects.toMatchObject({
        detail: 'Network error: Unable to reach the server',
      })
    })
  })

  describe('Response Type Validation', () => {
    it('should return properly typed PaginatedResponse', async () => {
      const mockResponse = createPaginatedResponse({
        data: createQuestions(5),
        next_cursor: '5',
        has_more: true,
        total: 50,
      })

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestions()

      // Type validation
      expect(result.data).toBeInstanceOf(Array)
      expect(typeof result.has_more).toBe('boolean')
      expect(typeof result.total).toBe('number')

      // Data structure validation
      result.data.forEach((question) => {
        expect(question).toHaveProperty('question')
        expect(question).toHaveProperty('options')
        expect(question.options).toHaveLength(4)
        expect(question).toHaveProperty('correct_answer')
        expect(question).toHaveProperty('difficulty')
      })
    })

    it('should return properly typed QuestionResponse', async () => {
      const mockResponse = createQuestionResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await fetchQuestionById('507f1f77bcf86cd799439011')

      // Type validation
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('question')
      expect(result.data).toHaveProperty('options')
      expect(result.data.options).toHaveLength(4)

      // Validate answer options
      result.data.options.forEach((option) => {
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('text')
        expect(['A', 'B', 'C', 'D']).toContain(option.label)
      })
    })

    it('should return properly typed HealthResponse', async () => {
      const mockResponse = createHealthResponse()

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse })

      const result = await healthCheck()

      expect(result).toHaveProperty('status')
      expect(typeof result.status).toBe('string')
      expect(result).toHaveProperty('service')
    })
  })
})
