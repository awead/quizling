export interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div
      className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden"
      role="progressbar"
      aria-valuenow={currentQuestion}
      aria-valuemin={1}
      aria-valuemax={totalQuestions}
      aria-label={`Quiz progress: question ${currentQuestion} of ${totalQuestions}`}
    >
      <div
        className="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-300 ease-out"
        style={{
          width: `${progressPercentage}%`,
        }}
      />
    </div>
  );
}
