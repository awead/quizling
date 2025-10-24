import type { MultipleChoiceQuestion } from '@/types';
import type { UserAnswer } from '@/hooks';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import QuizQuestion from './QuizQuestion';

export interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  questions: MultipleChoiceQuestion[];
  userAnswers: Map<string, UserAnswer>;
  onRetake: () => void;
}

export default function QuizResults({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onRetake,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  // Determine performance level and styling
  const getPerformanceInfo = () => {
    if (percentage >= 90) {
      return {
        label: 'Outstanding!',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900',
        message: 'You have excellent knowledge!',
      };
    }
    if (percentage >= 70) {
      return {
        label: 'Great Job!',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
        message: 'You did very well!',
      };
    }
    if (percentage >= 50) {
      return {
        label: 'Good Effort',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        message: 'Keep practicing to improve!',
      };
    }
    return {
      label: 'Keep Learning',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
      message: 'Review the material and try again!',
    };
  };

  const performance = getPerformanceInfo();

  return (
    <div className="space-y-6">
      {/* Score summary card */}
      <Card className={`text-center ${performance.bgColor}`}>
        <div className="py-8">
          <h2 className={`text-3xl font-bold mb-2 ${performance.color}`}>
            {performance.label}
          </h2>
          <div className="my-6">
            <div className={`text-6xl font-bold ${performance.color}`}>
              {percentage}%
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mt-2">
              {score} out of {totalQuestions} correct
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {performance.message}
          </p>
          <div className="mt-6">
            <Button onClick={onRetake} variant="primary">
              Take Another Quiz
            </Button>
          </div>
        </div>
      </Card>

      {/* Review section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Your Answers
        </h3>
      </div>

      {/* Question review */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const userAnswer = userAnswers.get(question.id);
          const selectedAnswer = userAnswer?.selectedAnswer || null;

          return (
            <Card key={question.id}>
              <QuizQuestion
                question={question}
                questionNumber={index + 1}
                totalQuestions={totalQuestions}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={() => {}}
                showResults={true}
              />
              {/* Show if no answer was selected */}
              {!selectedAnswer && (
                <div className="mt-4 bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-500 dark:border-gray-400 p-3 rounded-r-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You did not answer this question.
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom retake button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onRetake} variant="primary">
          Take Another Quiz
        </Button>
      </div>
    </div>
  );
}
