/**
 * Button Component Tests
 *
 * Tests for the Button component including:
 * - Rendering with different variants
 * - Click event handling
 * - Disabled state
 * - Loading state
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button Component', () => {
  it('should render with primary variant by default', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /Click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary-600')
  })

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /Secondary/i })
    expect(button).toHaveClass('bg-gray-600')
  })

  it('should render with danger variant', () => {
    render(<Button variant="danger">Delete</Button>)
    const button = screen.getByRole('button', { name: /Delete/i })
    expect(button).toHaveClass('bg-red-600')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /Click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: /Disabled/i })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should show loading state and be disabled when isLoading is true', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button isLoading onClick={handleClick}>Submit</Button>)

    const button = screen.getByRole('button', { name: /Loading/i })
    expect(button).toBeDisabled()
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
