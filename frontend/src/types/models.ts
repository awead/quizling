/**
 * Domain Models
 *
 * TypeScript types that mirror the Pydantic models from the FastAPI backend.
 * Backend source: /backend/src/quizling/base/models.py
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  text: string;
  is_correct: boolean;
}

export interface MultipleChoiceQuestion {
  id: string; 
  question: string;
  options: AnswerOption[];
  explanation: string | null;
  difficulty: DifficultyLevel;
}
