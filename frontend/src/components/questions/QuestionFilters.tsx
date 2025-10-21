import type { DifficultyLevel } from '@/types'

export interface QuestionFiltersProps {
  selectedDifficulty: DifficultyLevel | null
  onDifficultyChange: (difficulty: DifficultyLevel | null) => void
}

export default function QuestionFilters({
  selectedDifficulty,
  onDifficultyChange,
}: QuestionFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onDifficultyChange(value === 'all' ? null : (value as DifficultyLevel))
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="difficulty-filter"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Difficulty
      </label>
      <select
        id="difficulty-filter"
        value={selectedDifficulty || 'all'}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="all">All</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  )
}
