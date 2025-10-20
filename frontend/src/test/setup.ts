/**
 * Vitest Test Setup
 *
 * Global test configuration and setup that runs before all tests.
 * - Configures testing-library matchers
 * - Sets up MSW for API mocking
 * - Configures global test utilities
 */

import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock console methods to reduce noise in tests (optional)
// Comment out if you want to see console output during test development
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.log = vi.fn()
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Setup environment variables for tests
process.env.VITE_API_BASE_URL = 'http://localhost:8000'
process.env.VITE_API_TIMEOUT = '10000'
