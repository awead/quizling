import { memo } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { CheckIcon, XIcon } from '@/components/common/icons';

export interface AnswerOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  showResults?: boolean;
}

function AnswerOption({
  label,
  text,
  isSelected,
  isCorrect = false,
  isIncorrect = false,
  showResults = false,
  className = '',
  ...props
}: AnswerOptionProps) {
  // Determine button styling based on state
  const getButtonStyles = () => {
    // During quiz (not showing results)
    if (!showResults) {
      if (isSelected) {
        return 'bg-primary-100 dark:bg-primary-900 border-primary-500 dark:border-primary-400 ring-2 ring-primary-500 dark:ring-primary-400';
      }
      return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700';
    }

    // During results review
    if (isCorrect) {
      return 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400';
    }
    if (isIncorrect && isSelected) {
      return 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-400 ring-2 ring-red-500 dark:ring-red-400';
    }
    return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60';
  };

  // Icon for results
  const getResultIcon = () => {
    if (!showResults) return null;

    if (isCorrect) {
      return <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }

    if (isIncorrect && isSelected) {
      return <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }

    return null;
  };

  return (
    <button
      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed ${getButtonStyles()} ${className}`}
      disabled={showResults}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="flex-1 text-gray-900 dark:text-white pt-1">{text}</span>
        {getResultIcon()}
      </div>
    </button>
  );
}

export default memo(AnswerOption);
