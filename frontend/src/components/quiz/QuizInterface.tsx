import { useQuiz } from '@/hooks';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';

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
    return (
      <Card>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-24 w-24 text-primary-600 dark:text-primary-400 mb-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
          <Button onClick={startQuiz} variant="primary" className="text-lg px-8 py-3">
            Start Quiz
          </Button>
        </div>
      </Card>
    );
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
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-300 ease-out"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

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
      <Card className="bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <Button
            onClick={previousQuestion}
            disabled={!canGoPrevious}
            variant="secondary"
          >
            <svg
              className="w-5 h-5 mr-2 inline"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
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
              {userAnswers.size} of {totalQuestions} answered
            </div>
          </div>

          {isLastQuestion ? (
            <Button
              onClick={submitQuiz}
              variant="primary"
              disabled={userAnswers.size === 0}
            >
              Submit Quiz
              <svg
                className="w-5 h-5 ml-2 inline"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
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
              onClick={nextQuestion}
              disabled={!canGoNext}
              variant="primary"
            >
              Next
              <svg
                className="w-5 h-5 ml-2 inline"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
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
    </div>
  );
}
