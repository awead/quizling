/**
 * Footer Component Tests
 *
 * Tests for the Footer component including:
 * - Copyright text rendering
 * - External links
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Footer from './Footer'

describe('Footer Component', () => {
  it('should render copyright text with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${currentYear}.*Quizling.*All rights reserved`, 'i'))).toBeInTheDocument()
  })

  it('should render GitHub link', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /GitHub/i })
    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute('href', 'https://github.com/awead/quizling')
    expect(githubLink).toHaveAttribute('target', '_blank')
  })

  it('should render About link', () => {
    render(<Footer />)
    const aboutLink = screen.getByRole('link', { name: /About/i })
    expect(aboutLink).toBeInTheDocument()
  })
})
