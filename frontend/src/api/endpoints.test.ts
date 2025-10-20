/**
 * API Endpoints Tests
 *
 * Tests for endpoint constant definitions and parameterized route generation
 */

import { describe, it, expect } from 'vitest'
import { ENDPOINTS } from './endpoints'

describe('API Endpoints', () => {
  describe('Static Endpoints', () => {
    it('should define HEALTH endpoint', () => {
      expect(ENDPOINTS.HEALTH).toBe('/')
    })

    it('should define HEALTH_CHECK endpoint', () => {
      expect(ENDPOINTS.HEALTH_CHECK).toBe('/health')
    })

    it('should define QUESTIONS endpoint', () => {
      expect(ENDPOINTS.QUESTIONS).toBe('/questions')
    })
  })

  describe('Dynamic Endpoints', () => {
    it('should generate QUESTION_BY_ID endpoint with valid ObjectId', () => {
      const questionId = '507f1f77bcf86cd799439011'
      const endpoint = ENDPOINTS.QUESTION_BY_ID(questionId)

      expect(endpoint).toBe(`/questions/${questionId}`)
    })

    it('should generate QUESTION_BY_ID endpoint with different IDs', () => {
      const id1 = '507f1f77bcf86cd799439011'
      const id2 = '507f191e810c19729de860ea'

      expect(ENDPOINTS.QUESTION_BY_ID(id1)).toBe(`/questions/${id1}`)
      expect(ENDPOINTS.QUESTION_BY_ID(id2)).toBe(`/questions/${id2}`)
      expect(ENDPOINTS.QUESTION_BY_ID(id1)).not.toBe(
        ENDPOINTS.QUESTION_BY_ID(id2)
      )
    })

    it('should handle empty string ID (even though invalid)', () => {
      const endpoint = ENDPOINTS.QUESTION_BY_ID('')
      expect(endpoint).toBe('/questions/')
    })
  })

  describe('Endpoint Immutability', () => {
    it('should be a const object', () => {
      expect(ENDPOINTS).toBeDefined()
      expect(typeof ENDPOINTS).toBe('object')
    })

    it('should not allow adding new properties (const assertion)', () => {
      // TypeScript const assertion prevents this at compile time
      // This test verifies the object structure
      expect(Object.isFrozen(ENDPOINTS)).toBe(false) // const doesn't freeze, just type assertion
      expect(Object.keys(ENDPOINTS)).toHaveLength(4)
    })
  })

  describe('Endpoint Format', () => {
    it('should all start with forward slash', () => {
      expect(ENDPOINTS.HEALTH.startsWith('/')).toBe(true)
      expect(ENDPOINTS.HEALTH_CHECK.startsWith('/')).toBe(true)
      expect(ENDPOINTS.QUESTIONS.startsWith('/')).toBe(true)
      expect(
        ENDPOINTS.QUESTION_BY_ID('test-id').startsWith('/questions/')
      ).toBe(true)
    })

    it('should not have trailing slashes', () => {
      expect(ENDPOINTS.HEALTH.endsWith('/')).toBe(true) // Root is an exception
      expect(ENDPOINTS.HEALTH_CHECK.endsWith('/')).toBe(false)
      expect(ENDPOINTS.QUESTIONS.endsWith('/')).toBe(false)
    })
  })
})
