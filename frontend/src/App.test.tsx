/**
 * App Component Integration Tests
 *
 * Integration tests for the App component including:
 * - Router configuration and navigation
 * - Page rendering
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import App from './App'

describe('App Component', () => {
  describe('Routing and Navigation', () => {
    it('should render the home page by default', () => {
      render(<App />, { withRouter: false })
      expect(
        screen.getByRole('heading', { name: /Welcome to Quizling/i })
      ).toBeInTheDocument()
    })

    it('should render the header with navigation', () => {
      render(<App />, { withRouter: false })

      // Check that we have navigation links (they appear multiple times on the page)
      const homeLinks = screen.getAllByRole('link', { name: /^Home$/i })
      const browseLinks = screen.getAllByRole('link', { name: /Browse Questions/i })
      const quizLinks = screen.getAllByRole('link', { name: /Quiz/i })

      expect(homeLinks.length).toBeGreaterThan(0)
      expect(browseLinks.length).toBeGreaterThan(0)
      expect(quizLinks.length).toBeGreaterThan(0)
    })

    it('should render the footer', () => {
      render(<App />, { withRouter: false })
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
    })
  })
})
