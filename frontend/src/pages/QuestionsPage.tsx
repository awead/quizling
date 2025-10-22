import { useState } from 'react'
import { useQuestions } from '@/hooks/useQuestions'
import { useDebounce } from '@/hooks/useDebounce'
import SearchBar from '@/components/questions/SearchBar'
import QuestionFilters from '@/components/questions/QuestionFilters'
import QuestionList from '@/components/questions/QuestionList'
import Pagination from '@/components/questions/Pagination'
import ErrorMessage from '@/components/common/ErrorMessage'
import type { DifficultyLevel } from '@/types'

const QUESTIONS_PER_PAGE = 20

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(searchQuery, 300)

  const cursor = (currentPage - 1) * QUESTIONS_PER_PAGE

  const { questions, isLoading, error, pagination, refetch } = useQuestions({
    difficulty: selectedDifficulty,
    search: debouncedSearch,
    cursor,
    limit: QUESTIONS_PER_PAGE,
  })

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDifficultyChange = (difficulty: DifficultyLevel | null) => {
    setSelectedDifficulty(difficulty)
    setCurrentPage(1)
  }

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Questions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Explore our collection of quiz questions
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
        <div className="md:w-48">
          <QuestionFilters
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={handleDifficultyChange}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      )}

      {!error && (
        <>
          <QuestionList questions={questions} isLoading={isLoading} />

          {!isLoading && questions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              hasMore={pagination.hasMore}
              onNext={handleNextPage}
              onPrevious={handlePreviousPage}
              total={pagination.total}
            />
          )}
        </>
      )}
    </div>
  )
}
