/**
 * Questions API Service
 *
 * Service functions for interacting with the questions API.
 * All functions use the configured axios client and centralized endpoints.
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type {
  PaginatedResponse,
  QuestionResponse,
  QuestionQueryParams,
  HealthResponse,
} from '@/types';

/**
 * Fetch questions with optional filters and pagination
 *
 * @param params - Query parameters for filtering and pagination
 * @param params.difficulty - Filter by difficulty level ('easy' | 'medium' | 'hard')
 * @param params.search - Search term to filter questions by text content
 * @param params.cursor - Pagination cursor (question index to start from)
 * @param params.limit - Maximum number of questions to return
 * @returns Promise resolving to paginated question list
 * @throws {ApiError} If the request fails
 *
 * @example
 * ```typescript
 * // Get first page of medium difficulty questions
 * const response = await fetchQuestions({ difficulty: 'medium', limit: 20 });
 *
 * // Search for questions containing "JavaScript"
 * const results = await fetchQuestions({ search: 'JavaScript' });
 *
 * // Get next page using cursor
 * const nextPage = await fetchQuestions({ cursor: 20, limit: 20 });
 * ```
 */
export async function fetchQuestions(
  params?: QuestionQueryParams
): Promise<PaginatedResponse> {
  const response = await apiClient.get<PaginatedResponse>(ENDPOINTS.QUESTIONS, {
    params,
  });

  return response.data;
}

/**
 * Fetch a single question by its ID
 *
 * @param id - MongoDB ObjectId string of the question
 * @returns Promise resolving to the question data
 * @throws {ApiError} If the question is not found or request fails
 *
 * @example
 * ```typescript
 * const question = await fetchQuestionById('507f1f77bcf86cd799439011');
 * console.log(question.data.question);
 * ```
 */
export async function fetchQuestionById(
  id: string
): Promise<QuestionResponse> {
  const response = await apiClient.get<QuestionResponse>(
    ENDPOINTS.QUESTION_BY_ID(id)
  );

  return response.data;
}

/**
 * Check API health status
 *
 * @returns Promise resolving to health status
 * @throws {ApiError} If the health check fails
 *
 * @example
 * ```typescript
 * const health = await healthCheck();
 * console.log(health.status); // "healthy"
 * console.log(health.service); // "quizling-api"
 * ```
 */
export async function healthCheck(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH_CHECK);

  return response.data;
}
