/**
 * Logger Utility
 *
 * A lightweight logging utility that only outputs logs in development mode.
 * This prevents console logs from appearing in production builds.
 *
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.log('User action:', userAction);
 * logger.error('API error:', error);
 * logger.warn('Deprecated feature used');
 * ```
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  /**
   * Log general information (only in development)
   * @param args - Values to log
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log error messages (only in development)
   * @param args - Error values to log
   */
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args)
    }
  },

  /**
   * Log warning messages (only in development)
   * @param args - Warning values to log
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
}
