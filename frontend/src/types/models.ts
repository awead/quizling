/**
 * Domain Models
 *
 * TypeScript types that mirror the Pydantic models from the FastAPI backend.
 * Backend source: /backend/src/quizling/base/models.py
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface MultipleChoiceQuestion {
  id: string; 
  question: string;
  options: AnswerOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty: DifficultyLevel;
}
