/**
 * API Module Index
 *
 * Re-exports all API-related functionality for convenient importing.
 * Usage: import { fetchQuestions, ENDPOINTS, apiClient } from '@/api';
 */

export { default as apiClient } from './client';
export { ApiError } from './errors';
export { ENDPOINTS } from './endpoints';
export { fetchQuestions, fetchQuestionById, healthCheck } from './questions';
