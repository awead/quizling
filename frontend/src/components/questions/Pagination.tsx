import { memo } from 'react'
import Button from '../common/Button'

export interface PaginationProps {
  currentPage: number
  hasMore: boolean
  onNext: () => void
  onPrevious: () => void
  total?: number | null
}

function Pagination({
  currentPage,
  hasMore,
  onNext,
  onPrevious,
  total,
}: PaginationProps) {
  const isPreviousDisabled = currentPage === 1
  const isNextDisabled = !hasMore

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        aria-label="Previous page"
      >
        Previous
      </Button>

      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">Page {currentPage}</span>
        {total !== null && total !== undefined && (
          <span className="text-gray-500 dark:text-gray-400">
            ({total} total)
          </span>
        )}
      </div>

      <Button
        variant="secondary"
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  )
}

export default memo(Pagination)
