/**
 * API Endpoint Definitions
 *
 * Centralized constants for all API endpoints.
 * Provides type-safe endpoint construction and makes it easy to update routes.
 */

/**
 * API endpoint constants
 * Uses functions for parameterized routes to ensure type safety
 */
export const ENDPOINTS = {
  /**
   * Root health endpoint
   */
  HEALTH: '/',

  /**
   * Dedicated health check endpoint
   */
  HEALTH_CHECK: '/health',

  /**
   * Questions collection endpoint
   * Supports query parameters: difficulty, search, cursor, limit
   */
  QUESTIONS: '/questions',

  /**
   * Single question by ID endpoint
   * @param id - MongoDB ObjectId string
   */
  QUESTION_BY_ID: (id: string) => `/questions/${id}`,
} as const;
