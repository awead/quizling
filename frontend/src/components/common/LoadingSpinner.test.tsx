/**
 * LoadingSpinner Component Tests
 *
 * Minimal tests for Phase 1 - verifying it renders, not styling
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('should render with proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('should render with different size variants', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(<LoadingSpinner size="md" />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
