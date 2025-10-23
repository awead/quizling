import { useParams, Link } from 'react-router-dom'
import { useQuestion } from '@/hooks/useQuestion'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import Button from '@/components/common/Button'
import type { DifficultyLevel } from '@/types'

const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { question, isLoading, error, refetch } = useQuestion(id)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/questions">
            <Button variant="secondary">Back to Questions</Button>
          </Link>
        </div>
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/questions">
            <Button variant="secondary">Back to Questions</Button>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Question not found
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="mb-4">
          <Link to="/questions">
            <Button variant="secondary">Back to Questions</Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Question Details
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {question.id}
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
              Question
            </h2>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
              {question.question}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
              Answer Options
            </h2>
            <div className="space-y-3">
              {question.options.map((option) => {
                const isCorrect = option.label === question.correct_answer
                return (
                  <div
                    key={option.label}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mr-3 flex-shrink-0 ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {option.label}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`text-base ${
                            isCorrect
                              ? 'text-green-900 dark:text-green-100 font-medium'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {option.text}
                        </p>
                        {isCorrect && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Correct Answer
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {question.explanation && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                Explanation
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
