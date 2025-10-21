/**
 * Card Component Tests
 *
 * Tests for the Card component including:
 * - Rendering children
 * - Custom className application
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

  it('should apply custom className along with base classes', () => {
    render(
      <Card className="custom-class">
        <div>Test content</div>
      </Card>
    )

    const card = screen.getByText(/Test content/i).parentElement
    expect(card).toHaveClass('custom-class')
    expect(card).toHaveClass('bg-white')
  })

  it('should render without custom className', () => {
    render(
      <Card>
        <div>Simple card</div>
      </Card>
    )

    const card = screen.getByText(/Simple card/i).parentElement
    expect(card).toHaveClass('bg-white')
  })
})
