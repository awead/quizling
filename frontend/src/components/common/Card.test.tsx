/**
 * Card Component Tests
 *
 * Minimal tests for Phase 1 - verifying content renders, not styling
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Card from './Card'

describe('Card Component', () => {
  it('should render children content', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content goes here</p>
      </Card>
    )

    expect(screen.getByRole('heading', { name: /Card Title/i })).toBeInTheDocument()
    expect(screen.getByText(/Card content goes here/i)).toBeInTheDocument()
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Card variant="default">Default</Card>)
    expect(screen.getByText(/Default/i)).toBeInTheDocument()

    rerender(<Card variant="glass">Glass</Card>)
    expect(screen.getByText(/Glass/i)).toBeInTheDocument()

    rerender(<Card variant="elevated">Elevated</Card>)
    expect(screen.getByText(/Elevated/i)).toBeInTheDocument()
  })
})
