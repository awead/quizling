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
  _id?: string;  // MongoDB ObjectId (optional, only present when fetched from DB)
  question: string;
  options: AnswerOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty: DifficultyLevel;
}

export interface QuizConfig {
  num_questions?: number;  // 1-50, default: 5
  difficulty?: DifficultyLevel;  // default: 'medium'
  include_explanations?: boolean;  // default: true
  topic_focus?: string | null;
  output_directory?: string;  // default: 'out'
  azure_endpoint?: string;
  azure_api_key?: string;
  azure_deployment_name?: string;
  api_version?: string;
}

export interface QuizResult {
  questions: MultipleChoiceQuestion[];
  source_file: string;
  config: QuizConfig;
}
