/**
 * Tests for Pagination Component
 */

import { render, screen } from '@/test/test-utils'
import Pagination from './Pagination'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('Pagination', () => {
  it('should call onNext when Next button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const onPrevious = vi.fn()

    render(
      <Pagination
        currentPage={1}
        hasMore={true}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('should call onPrevious when Previous button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const onPrevious = vi.fn()

    render(
      <Pagination
        currentPage={2}
        hasMore={true}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    )

    const previousButton = screen.getByRole('button', { name: /previous/i })
    await user.click(previousButton)

    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('should disable Previous button on first page', () => {
    const onNext = vi.fn()
    const onPrevious = vi.fn()

    render(
      <Pagination
        currentPage={1}
        hasMore={true}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    )

    const previousButton = screen.getByRole('button', { name: /previous/i })
    expect(previousButton).toBeDisabled()
  })

  it('should disable Next button when no more pages', () => {
    const onNext = vi.fn()
    const onPrevious = vi.fn()

    render(
      <Pagination
        currentPage={2}
        hasMore={false}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })
})
