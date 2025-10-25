import { useQuiz } from '@/hooks';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizStart from './QuizStart';
import QuizProgress from './QuizProgress';
import QuizNavigation from './QuizNavigation';

export interface QuizInterfaceProps {
  questionCount?: number;
}

export default function QuizInterface({ questionCount = 15 }: QuizInterfaceProps) {
  const {
    questions,
    currentQuestionIndex,
    currentQuestion,
    selectedAnswer,
    userAnswers,
    isLoading,
    error,
    isQuizComplete,
    isQuizStarted,
    score,
    totalQuestions,
    isLastQuestion,
    canGoNext,
    canGoPrevious,
    startQuiz,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  } = useQuiz(questionCount);

  // Initial state - show start button
  if (!isQuizStarted) {
    return <QuizStart questionCount={questionCount} onStart={startQuiz} />;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg
            className="animate-spin mx-auto h-16 w-16 text-primary-600 dark:text-primary-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Loading quiz questions...
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-red-600 dark:text-red-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Quiz
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={resetQuiz} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Quiz completed - show results
  if (isQuizComplete) {
    return (
      <QuizResults
        score={score}
        totalQuestions={totalQuestions}
        questions={questions}
        userAnswers={userAnswers}
        onRetake={resetQuiz}
      />
    );
  }

  // Quiz in progress
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <QuizProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
      />

      {/* Question card */}
      <Card>
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={selectAnswer}
        />
      </Card>

      {/* Navigation */}
      <QuizNavigation
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        answeredCount={userAnswers.size}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        onSubmit={submitQuiz}
      />
    </div>
  );
}
