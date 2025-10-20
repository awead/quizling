/**
 * Custom Testing Utilities
 *
 * Re-exports React Testing Library with custom configurations
 * and additional utilities specific to this application.
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with necessary providers
 * Currently just passes through to RTL render, but ready for future providers
 * (Router, Theme, Auth Context, etc.)
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with custom version
export { customRender as render }
