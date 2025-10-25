import { memo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../common/Card'
import { getDifficultyColor } from '@/utils/difficulty'
import type { MultipleChoiceQuestion } from '@/types'

export interface QuestionCardProps {
  question: MultipleChoiceQuestion
}

function QuestionCard({ question }: QuestionCardProps) {
  const truncatedQuestion =
    question.question.length > 100
      ? `${question.question.slice(0, 100)}...`
      : question.question

  const firstAnswer = question.options[0]

  return (
    <Link
      to={`/questions/${question.id}`}
      className="block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getDifficultyColor(question.difficulty)}`}
            >
              {question.difficulty}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {truncatedQuestion}
          </h3>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{firstAnswer.label}:</span>{' '}
            {firstAnswer.text}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default memo(QuestionCard)
