/**
 * Tests for useDebounce Hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from './useDebounce'
import { describe, it, expect, vi } from 'vitest'

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))
    expect(result.current).toBe('test')
  })

  it('should debounce value updates', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update the value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be the old one immediately after update
    expect(result.current).toBe('initial')

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated')
      },
      { timeout: 600 }
    )
  })

  it('should cleanup timeout on unmount', () => {
    vi.useFakeTimers()
    const { unmount } = renderHook(() => useDebounce('test', 500))

    // Unmount before delay completes
    unmount()

    // Advance timers - should not cause any errors
    vi.advanceTimersByTime(500)

    vi.useRealTimers()
  })
})
