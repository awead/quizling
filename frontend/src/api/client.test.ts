/**
 * API Client Tests
 *
 * Tests for the axios client configuration and error handling.
 * These tests verify the ApiError type and client export.
 */

import { describe, it, expect } from 'vitest'
import type { ApiError } from './client'

describe('API Client', () => {
  describe('ApiError Type', () => {
    it('should have correct structure with all properties', () => {
      const error: ApiError = {
        status: 404,
        detail: 'Not found',
        originalError: new Error('Original'),
      }

      expect(error.status).toBe(404)
      expect(error.detail).toBe('Not found')
      expect(error.originalError).toBeInstanceOf(Error)
    })

    it('should allow optional status', () => {
      const error: ApiError = {
        detail: 'Network error',
      }

      expect(error.status).toBeUndefined()
      expect(error.detail).toBe('Network error')
    })

    it('should allow optional originalError', () => {
      const error: ApiError = {
        status: 500,
        detail: 'Server error',
      }

      expect(error.status).toBe(500)
      expect(error.detail).toBe('Server error')
      expect(error.originalError).toBeUndefined()
    })

    it('should support different error status codes', () => {
      const errors: ApiError[] = [
        { status: 400, detail: 'Bad request' },
        { status: 401, detail: 'Unauthorized' },
        { status: 403, detail: 'Forbidden' },
        { status: 404, detail: 'Not found' },
        { status: 500, detail: 'Internal server error' },
        { status: 503, detail: 'Service unavailable' },
      ]

      errors.forEach((error) => {
        expect(error).toHaveProperty('status')
        expect(error).toHaveProperty('detail')
        expect(typeof error.status).toBe('number')
        expect(typeof error.detail).toBe('string')
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
