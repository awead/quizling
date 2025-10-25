import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function QuizNavigation({
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
}: QuizNavigationProps) {
  return (
    <Card className="bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between">
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="secondary"
          aria-label="Go to previous question"
        >
          <svg
            className="w-5 h-5 mr-2 inline"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Previous
        </Button>

        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount} of {totalQuestions} answered
          </div>
        </div>

        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            variant="primary"
            disabled={answeredCount === 0}
          >
            Submit Quiz
            <svg
              className="w-5 h-5 ml-2 inline"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            variant="primary"
            aria-label={`Go to question ${currentQuestionIndex + 2} of ${totalQuestions}`}
          >
            Next
            <svg
              className="w-5 h-5 ml-2 inline"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
      </div>
    </Card>
  );
}
