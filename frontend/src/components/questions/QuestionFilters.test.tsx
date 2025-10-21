/**
 * Tests for QuestionFilters Component
 */

import { render, screen } from '@/test/test-utils'
import QuestionFilters from './QuestionFilters'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('QuestionFilters', () => {
  it('should render difficulty dropdown with options', () => {
    const onDifficultyChange = vi.fn()

    render(
      <QuestionFilters
        selectedDifficulty={null}
        onDifficultyChange={onDifficultyChange}
      />
    )

    const select = screen.getByLabelText('Difficulty')
    expect(select).toBeInTheDocument()

    // Should have all difficulty options
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Easy' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Hard' })).toBeInTheDocument()
  })

  it('should call onChange when difficulty is selected', async () => {
    const user = userEvent.setup()
    const onDifficultyChange = vi.fn()

    render(
      <QuestionFilters
        selectedDifficulty={null}
        onDifficultyChange={onDifficultyChange}
      />
    )

    const select = screen.getByLabelText('Difficulty')
    await user.selectOptions(select, 'hard')

    expect(onDifficultyChange).toHaveBeenCalledWith('hard')
  })

  it('should call onChange with null when "All" is selected', async () => {
    const user = userEvent.setup()
    const onDifficultyChange = vi.fn()

    render(
      <QuestionFilters
        selectedDifficulty="medium"
        onDifficultyChange={onDifficultyChange}
      />
    )

    const select = screen.getByLabelText('Difficulty')
    await user.selectOptions(select, 'all')

    expect(onDifficultyChange).toHaveBeenCalledWith(null)
  })
})
