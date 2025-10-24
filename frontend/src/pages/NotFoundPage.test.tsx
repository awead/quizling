/**
 * NotFoundPage Component Tests
 *
 * Tests for the NotFoundPage component including:
 * - 404 message display
 * - Navigation back to home
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage Component', () => {
  it('should render 404 status code', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('should render "Page Not Found" heading', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument()
  })

  it('should render error message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/The page you're looking for doesn't exist/i)).toBeInTheDocument()
  })

  it('should render link back to home', () => {
    render(<NotFoundPage />)
    const homeLink = screen.getByRole('link', { name: /Go Back Home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
