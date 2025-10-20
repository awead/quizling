/**
 * API-related Types
 *
 * TypeScript types for API requests and responses.
 * Backend source: /backend/src/quizling/api/models.py
 */

import type { MultipleChoiceQuestion, DifficultyLevel } from './models';

// API Response types
export interface PaginatedResponse {
  data: MultipleChoiceQuestion[];
  next_cursor: string | null;
  has_more: boolean;
  total: number | null;
}

export interface QuestionResponse {
  data: MultipleChoiceQuestion;
}

export interface ErrorResponse {
  detail: string;
}

export interface HealthResponse {
  status: string;
  service?: string;
}

// API Request types
export interface QuestionQueryParams {
  difficulty?: DifficultyLevel;
  search?: string;
  cursor?: number;
  limit?: number;
}

// Frontend-specific types for filters and state
export interface QuestionFilters {
  difficulty: DifficultyLevel | null;
  search: string;
  page: number;
}
