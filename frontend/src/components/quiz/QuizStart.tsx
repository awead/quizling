import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export interface QuizStartProps {
  questionCount: number;
  onStart: () => void;
}

export default function QuizStart({ questionCount, onStart }: QuizStartProps) {
  return (
    <Card>
      <div className="text-center py-12">
        <svg
          className="mx-auto h-24 w-24 text-primary-600 dark:text-primary-400 mb-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Test Your Knowledge?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This quiz contains {questionCount} questions from various categories and difficulty levels.
        </p>
        <Button onClick={onStart} variant="primary" className="text-lg px-8 py-3">
          Start Quiz
        </Button>
      </div>
    </Card>
  );
}
