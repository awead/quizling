/**
 * HomePage Component Tests
 *
 * Tests for the HomePage component including:
 * - Welcome message
 * - CTA buttons and their links
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import HomePage from './HomePage'

describe('HomePage Component', () => {
  it('should render welcome heading', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /Welcome to Quizling/i })).toBeInTheDocument()
  })

  it('should render tagline', () => {
    render(<HomePage />)
    expect(screen.getByText(/Test your knowledge with our interactive quiz platform/i)).toBeInTheDocument()
  })

  it('should render Browse Questions CTA button', () => {
    render(<HomePage />)
    const browseButtons = screen.getAllByRole('button', { name: /Browse Questions/i })
    expect(browseButtons.length).toBeGreaterThan(0)
  })

  it('should render Start Quiz CTA button', () => {
    render(<HomePage />)
    const startButtons = screen.getAllByRole('button', { name: /Start Quiz/i })
    expect(startButtons.length).toBeGreaterThan(0)
  })

  it('should have correct navigation links', () => {
    render(<HomePage />)

    const questionsLink = screen.getByRole('link', { name: /Browse Questions/i })
    const quizLink = screen.getByRole('link', { name: /Start Quiz/i })

    expect(questionsLink).toHaveAttribute('href', '/questions')
    expect(quizLink).toHaveAttribute('href', '/quiz')
  })
})
