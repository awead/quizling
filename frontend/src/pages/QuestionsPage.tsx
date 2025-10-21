import Card from '@/components/common/Card'

export default function QuestionsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Questions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Explore our collection of quiz questions
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Questions list will appear here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This feature will be implemented in Phase 3
          </p>
        </div>
      </Card>
    </div>
  )
}
