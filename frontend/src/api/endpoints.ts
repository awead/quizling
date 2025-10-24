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
  HEALTH: '/',

  HEALTH_CHECK: '/health',

  QUESTIONS: '/questions',

  QUESTION_BY_ID: (id: string) => `/questions/${id}`,
} as const;
