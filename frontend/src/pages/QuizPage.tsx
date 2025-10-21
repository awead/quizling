import Card from '@/components/common/Card'

export default function QuizPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Take Quiz
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Test your knowledge
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Quiz interface will appear here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This feature will be implemented in Phase 4
          </p>
        </div>
      </Card>
    </div>
  )
}
