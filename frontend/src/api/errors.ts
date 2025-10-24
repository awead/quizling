/**
 * ApiError Class
 *
 * A custom error class for API-related errors. Extends the native Error class
 * and provides additional context about the error (status code, original error).
 *
 * This ensures proper instanceof checks work correctly throughout the application.
 *
 * @example
 * ```typescript
 * try {
 *   const response = await fetchData();
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     console.log('API Error:', err.message, 'Status:', err.status);
 *   }
 * }
 * ```
 */

export class ApiError extends Error {
  public readonly status?: number
  public readonly originalError?: unknown

  constructor(message: string, status?: number, originalError?: unknown) {
    super(message)

    // Set the name property for better error identification
    this.name = 'ApiError'

    // Store additional error context
    this.status = status
    this.originalError = originalError

    // Restore prototype chain for proper instanceof checks
    // This is necessary when extending built-in classes in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
