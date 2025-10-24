/**
 * API Client Tests
 *
 * Tests for the axios client configuration and error handling.
 * These tests verify the ApiError type and client export.
 */

import { describe, it, expect } from 'vitest'
import { ApiError } from './errors'

describe('API Client', () => {
  describe('ApiError Class', () => {
    it('should create error with all properties', () => {
      const originalError = new Error('Original')
      const error = new ApiError('Not found', 404, originalError)

      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
      expect(error.originalError).toBe(originalError)
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should create error with optional status', () => {
      const error = new ApiError('Network error')

      expect(error.message).toBe('Network error')
      expect(error.status).toBeUndefined()
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create error with optional originalError', () => {
      const error = new ApiError('Server error', 500)

      expect(error.message).toBe('Server error')
      expect(error.status).toBe(500)
      expect(error.originalError).toBeUndefined()
      expect(error.name).toBe('ApiError')
    })

    it('should support different error status codes', () => {
      const errorData = [
        { status: 400, detail: 'Bad request' },
        { status: 401, detail: 'Unauthorized' },
        { status: 403, detail: 'Forbidden' },
        { status: 404, detail: 'Not found' },
        { status: 500, detail: 'Internal server error' },
        { status: 503, detail: 'Service unavailable' },
      ]

      errorData.forEach(({ status, detail }) => {
        const error = new ApiError(detail, status)
        expect(error.message).toBe(detail)
        expect(error.status).toBe(status)
        expect(error).toBeInstanceOf(ApiError)
        expect(error.name).toBe('ApiError')
      })
    })
  })

  describe('Client Configuration', () => {
    it('should use environment variables or defaults', () => {
      // These are set in test/setup.ts
      expect(process.env.VITE_API_BASE_URL).toBe('http://localhost:8000')
      expect(process.env.VITE_API_TIMEOUT).toBe('10000')
    })
  })
})
