/**
 * ErrorMessage Component Tests
 *
 * Tests for the ErrorMessage component including:
 * - Error message display
 * - Retry button functionality
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage Component', () => {
  it('should display error message', () => {
    render(<ErrorMessage message="Something went wrong" />)

    expect(screen.getByText(/Error/i)).toBeInTheDocument()
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
  })

  it('should not show retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Network error" />)

    expect(screen.queryByRole('button', { name: /Try Again/i })).not.toBeInTheDocument()
  })

  it('should show retry button when onRetry is provided', () => {
    const handleRetry = vi.fn()
    render(<ErrorMessage message="Failed to load" onRetry={handleRetry} />)

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const handleRetry = vi.fn()
    render(<ErrorMessage message="Failed to load" onRetry={handleRetry} />)

    const retryButton = screen.getByRole('button', { name: /Try Again/i })
    await user.click(retryButton)

    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
