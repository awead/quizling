# Frontend Testing Guide

This directory contains test utilities, factories, and setup files for the Quizling frontend application.

## Test Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.test.ts          # Axios client & interceptor tests
│   │   ├── endpoints.test.ts       # Endpoint constant tests
│   │   └── questions.test.ts       # API service function tests
│   ├── test/
│   │   ├── factories.ts            # Test data factories
│   │   ├── setup.ts                # Global test setup
│   │   └── test-utils.tsx          # Custom testing utilities
│   └── App.test.tsx                # App component integration tests
├── vitest.config.ts                # Vitest configuration
└── package.json                    # Test scripts
```

## Test Files

### `/src/test/setup.ts`
Global test configuration that runs before all tests:
- Configures React Testing Library
- Sets up global test environment
- Mocks console methods (optional)
- Sets environment variables for tests

### `/src/test/factories.ts`
Factory functions for generating test data:
- `createQuestion()` - Create mock question objects
- `createQuestions(count)` - Create multiple questions
- `createPaginatedResponse()` - Create paginated API response
- `createQuestionResponse()` - Create single question response
- `createHealthResponse()` - Create health check response

### `/src/test/test-utils.tsx`
Custom testing utilities:
- Custom `render()` function (ready for providers)
- Re-exports from React Testing Library
- User event utilities

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### API Layer
- ✅ Axios client configuration
- ✅ Request interceptors (logging, future auth)
- ✅ Response interceptors (error transformation)
- ✅ API service functions (healthCheck, fetchQuestions, fetchQuestionById)
- ✅ Endpoint constants and parameterized routes
- ✅ Error handling (server errors, network errors, validation errors)

### Components
- ✅ App component rendering
- ✅ User interactions (button clicks)
- ✅ Loading states
- ✅ Error states
- ✅ Success states with API responses
- ✅ Multiple sequential operations

### Type Safety
- ✅ TypeScript types match API responses
- ✅ Request/response type validation
- ✅ Error type structure

## Writing New Tests

### API Service Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { myApiFunction } from './myApi'
import { createMockResponse } from '@/test/factories'

vi.mock('axios')

describe('My API Function', () => {
  it('should fetch data successfully', async () => {
    const mockResponse = createMockResponse()
    vi.mocked(axios.get).mockResolvedValue({ data: mockResponse })

    const result = await myApiFunction()

    expect(result).toEqual(mockResponse)
  })
})
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { userEvent } from '@testing-library/user-event'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render and handle interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(screen.getByText(/clicked/i)).toBeInTheDocument()
  })
})
```

## Best Practices

### DO ✅
- Use factories for test data consistency
- Test user behavior, not implementation details
- Use `screen.getByRole()` for accessibility
- Mock external dependencies (API calls, third-party libraries)
- Test error scenarios and edge cases
- Use descriptive test names that explain the expected behavior
- Clean up after each test (automatic with setup)

### DON'T ❌
- Don't test implementation details (internal state, private methods)
- Don't make real HTTP requests in tests
- Don't use `setTimeout()` - use `waitFor()` instead
- Don't rely on test execution order
- Don't share state between tests
- Don't forget to clear mocks between tests

## Testing Patterns

### Async Operations
```typescript
import { waitFor } from '@/test/test-utils'

it('should handle async operations', async () => {
  render(<MyComponent />)

  await user.click(button)

  await waitFor(() => {
    expect(screen.getByText(/result/i)).toBeInTheDocument()
  })
})
```

### Error Handling
```typescript
it('should display error message', async () => {
  vi.mocked(api.fetchData).mockRejectedValue({
    status: 500,
    detail: 'Server error'
  })

  render(<MyComponent />)
  await user.click(button)

  await waitFor(() => {
    expect(screen.getByText(/Server error/i)).toBeInTheDocument()
  })
})
```

### Loading States
```typescript
it('should show loading indicator', async () => {
  vi.mocked(api.fetchData).mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 100))
  )

  render(<MyComponent />)
  await user.click(button)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
})
```

## Debugging Tests

### View Test Output
```bash
# Run specific test file
npm test -- src/api/client.test.ts

# Run tests matching pattern
npm test -- -t "should fetch questions"

# Show console output
npm test -- --reporter=verbose
```

### Debug in Browser
```bash
# Open Vitest UI
npm run test:ui
```

### Debug with VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run"],
  "console": "integratedTerminal"
}
```

## CI/CD Integration

Tests are designed to run in CI environments:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Future Testing Needs

As the application grows, consider adding:

1. **E2E Tests**: Use Playwright or Cypress for full user flows
2. **Visual Regression**: Use Percy or Chromatic for UI consistency
3. **Performance Tests**: Use Lighthouse CI for performance metrics
4. **Accessibility Tests**: Use axe-core for a11y validation
5. **API Contract Tests**: Use Pact for contract testing with backend
6. **Load Tests**: Use k6 or Artillery for frontend performance

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest UI](https://vitest.dev/guide/ui.html)
