/**
 * Test Data Factories
 *
 * Factory functions for generating test data with sensible defaults.
 * Allows overriding specific properties for different test scenarios.
 */

import type {
  MultipleChoiceQuestion,
  AnswerOption,
  DifficultyLevel,
} from '@/types/models'
import type {
  PaginatedResponse,
  QuestionResponse,
  HealthResponse,
} from '@/types/api'

/**
 * Create a mock answer option
 */
export const createAnswerOption = (
  overrides?: Partial<AnswerOption>
): AnswerOption => ({
  label: 'A',
  text: 'Sample answer',
  ...overrides,
})

/**
 * Create a mock multiple choice question
 */
export const createQuestion = (
  overrides?: Partial<MultipleChoiceQuestion>
): MultipleChoiceQuestion => ({
  id: '507f1f77bcf86cd799439011',
  question: 'What is the capital of France?',
  options: [
    { label: 'A', text: 'London' },
    { label: 'B', text: 'Paris' },
    { label: 'C', text: 'Berlin' },
    { label: 'D', text: 'Madrid' },
  ],
  correct_answer: 'B',
  explanation: 'Paris is the capital and most populous city of France.',
  difficulty: 'medium',
  ...overrides,
})

/**
 * Create multiple mock questions
 */
export const createQuestions = (
  count: number,
  overrides?: Partial<MultipleChoiceQuestion>
): MultipleChoiceQuestion[] => {
  return Array.from({ length: count }, (_, i) =>
    createQuestion({
      id: `507f1f77bcf86cd79943901${i}`,
      question: `Sample question ${i + 1}?`,
      ...overrides,
    })
  )
}

/**
 * Create a mock paginated response
 */
export const createPaginatedResponse = (
  overrides?: Partial<PaginatedResponse>
): PaginatedResponse => ({
  data: createQuestions(5),
  next_cursor: null,
  has_more: false,
  total: 5,
  ...overrides,
})

/**
 * Create a mock question response
 */
export const createQuestionResponse = (
  overrides?: Partial<QuestionResponse>
): QuestionResponse => ({
  data: createQuestion(),
  ...overrides,
})

/**
 * Create a mock health response
 */
export const createHealthResponse = (
  overrides?: Partial<HealthResponse>
): HealthResponse => ({
  status: 'healthy',
  service: 'quizling-api',
  ...overrides,
})

/**
 * Create questions with specific difficulty
 */
export const createQuestionsByDifficulty = (
  count: number,
  difficulty: DifficultyLevel
): MultipleChoiceQuestion[] => {
  return createQuestions(count, { difficulty })
}
