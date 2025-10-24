import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Quizling
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Test your knowledge with our interactive quiz platform
        </p>
      </div>

      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          About Quizling
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Quizling is your go-to platform for creating, managing, and taking quizzes.
          Whether you're studying for an exam, testing your general knowledge, or just
          having fun, we've got you covered.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
          <li>Browse through a wide variety of questions</li>
          <li>Take quizzes on topics that interest you</li>
          <li>Track your progress and improve your knowledge</li>
          <li>Challenge yourself with different difficulty levels</li>
        </ul>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Browse Questions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explore our collection of questions across various topics and difficulty
            levels.
          </p>
          <Link to="/questions">
            <Button variant="secondary" className="w-full">
              Browse Questions
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-primary-600"
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
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start Quiz
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to test your knowledge? Jump right into a quiz and see how you do!
          </p>
          <Link to="/quiz">
            <Button className="w-full">Start Quiz</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
