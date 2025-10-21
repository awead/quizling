import QuestionCard from './QuestionCard'
import LoadingSpinner from '../common/LoadingSpinner'
import type { MultipleChoiceQuestion } from '@/types'

export interface QuestionListProps {
  questions: MultipleChoiceQuestion[]
  isLoading: boolean
}

export default function QuestionList({
  questions,
  isLoading,
}: QuestionListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No questions found. Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </div>
  )
}
