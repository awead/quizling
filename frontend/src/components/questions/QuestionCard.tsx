import { Link } from 'react-router-dom'
import Card from '../common/Card'
import type { MultipleChoiceQuestion, DifficultyLevel } from '@/types'

export interface QuestionCardProps {
  question: MultipleChoiceQuestion
}

const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const truncatedQuestion =
    question.question.length > 100
      ? `${question.question.slice(0, 100)}...`
      : question.question

  const firstAnswer = question.options[0]

  return (
    <Link
      to={`/questions/${question._id}`}
      className="block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${difficultyColors[question.difficulty]}`}
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
