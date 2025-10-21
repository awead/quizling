/**
 * LoadingSpinner Component Tests
 *
 * Tests for the LoadingSpinner component including:
 * - Rendering with different sizes
 * - Accessibility attributes
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('should render with default (medium) size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-6', 'w-6')
  })

  it('should render with medium size', () => {
    render(<LoadingSpinner size="md" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-10', 'w-10')
  })

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-16', 'w-16')
  })

  it('should have accessible label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })
})
