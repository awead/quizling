/**
 * Header Component Tests
 *
 * Tests for the Header component including:
 * - Logo/title rendering
 * - Navigation links
 * - Link routing
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Header from './Header'

describe('Header Component', () => {
  it('should render the Quizling logo/title', () => {
    render(<Header />)
    expect(screen.getByRole('heading', { name: /Quizling/i })).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse Questions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Take Quiz/i })).toBeInTheDocument()
  })

  it('should have correct href attributes for navigation links', () => {
    render(<Header />)

    const homeLinks = screen.getAllByRole('link', { name: /^Home$/i })
    const browseLink = screen.getByRole('link', { name: /Browse Questions/i })
    const quizLink = screen.getByRole('link', { name: /Take Quiz/i })

    expect(homeLinks[0]).toHaveAttribute('href', '/')
    expect(browseLink).toHaveAttribute('href', '/questions')
    expect(quizLink).toHaveAttribute('href', '/quiz')
  })
})
