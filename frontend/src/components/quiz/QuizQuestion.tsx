import type { MultipleChoiceQuestion } from '@/types';
import AnswerOption from './AnswerOption';
import { getDifficultyColor } from '@/utils/difficulty';
import { optionLetter } from '@/utils/options';
import { useFocusOnMount } from '@/hooks';

export interface QuizQuestionProps {
  question: MultipleChoiceQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionIndex: number | null;
  onAnswerSelect: (optionIndex: number) => void;
  showResults?: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionIndex,
  onAnswerSelect,
  showResults = false,
}: QuizQuestionProps) {
  // Focus the question heading when it mounts
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getDifficultyColor(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* Question text */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed focus:outline-none"
        >
          {question.question}
        </h2>
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index;
          const isCorrect = showResults && option.is_correct;
          const isIncorrect = showResults && isSelected && !option.is_correct;

          return (
            <AnswerOption
              key={index}
              label={optionLetter(index)}
              text={option.text}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isIncorrect={isIncorrect}
              showResults={showResults}
              onClick={() => onAnswerSelect(index)}
            />
          );
        })}
      </div>

      {/* Explanation (shown only in results mode if available) */}
      {showResults && question.explanation && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Explanation
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
