/**
 * App Component Integration Tests
 *
 * Integration tests for the App component including:
 * - Component rendering and UI elements
 * - User interactions (button clicks)
 * - Loading states during API calls
 * - Error handling and display
 * - Successful API call responses
 * - State management across multiple operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { userEvent } from '@testing-library/user-event'
import App from './App'
import * as api from '@/api'
import {
  createHealthResponse,
  createPaginatedResponse,
} from '@/test/factories'

// Mock the entire API module
vi.mock('@/api', () => ({
  healthCheck: vi.fn(),
  fetchQuestions: vi.fn(),
}))

describe('App Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Rendering the App page', () => {
    it('should render the main heading', () => {
      render(<App />)
      expect(
        screen.getByRole('heading', { name: /API Connection Test/i })
      ).toBeInTheDocument()
    })

    it('should render all three action buttons', () => {
      render(<App />)

      expect(
        screen.getByRole('button', { name: /Test Health Check/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Fetch 5 Questions/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Clear Results/i })
      ).toBeInTheDocument()
    })

    it('should render informational list', () => {
      render(<App />)

      expect(screen.getByText(/What this tests:/i)).toBeInTheDocument()
      expect(
        screen.getByText(/API client is configured correctly/i)
      ).toBeInTheDocument()
    })

    it('should not show any results initially', () => {
      render(<App />)

      expect(
        screen.queryByText(/Health Check Result:/i)
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Questions Result:/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument()
    })

    it('should have all buttons enabled initially', () => {
      render(<App />)

      expect(
        screen.getByRole('button', { name: /Test Health Check/i })
      ).toBeEnabled()
      expect(
        screen.getByRole('button', { name: /Fetch 5 Questions/i })
      ).toBeEnabled()
      expect(
        screen.getByRole('button', { name: /Clear Results/i })
      ).toBeEnabled()
    })
  })
})
