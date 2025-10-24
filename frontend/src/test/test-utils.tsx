/**
 * Custom Testing Utilities
 *
 * Re-exports React Testing Library with custom configurations
 * and additional utilities specific to this application.
 */

import { render as rtlRender } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  withRouter?: boolean
}

/**
 * Wrapper component that provides router context
 */
function AllTheProviders({ children, initialEntries = ['/'] }: { children: ReactNode; initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  )
}

/**
 * Custom render function that wraps components with necessary providers
 * Includes MemoryRouter for testing components with routing
 * Set withRouter: false to skip router wrapping (for components that already have a router)
 */
function customRender(
  ui: ReactElement,
  { initialEntries = ['/'], withRouter = true, ...options }: CustomRenderOptions = {}
) {
  if (!withRouter) {
    return rtlRender(ui, options)
  }

  return rtlRender(ui, {
    wrapper: ({ children }) => <AllTheProviders initialEntries={initialEntries}>{children}</AllTheProviders>,
    ...options
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with custom version
export { customRender as render }
