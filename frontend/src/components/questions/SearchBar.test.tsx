/**
 * Tests for SearchBar Component
 */

import { render, screen } from '@/test/test-utils'
import SearchBar from './SearchBar'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('SearchBar', () => {
  it('should call onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SearchBar value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search')
    await user.type(input, 'test')

    expect(onChange).toHaveBeenCalled()
    // userEvent.type calls onChange for each character, so last call would be 't', 'e', 's', 't'
    // Check that it was called with 't' as the last character typed
    expect(onChange).toHaveBeenLastCalledWith('t')
  })

  it('should show clear button when value is present', () => {
    const onChange = vi.fn()

    render(<SearchBar value="test" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
  })

  it('should call onChange with empty string when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SearchBar value="test query" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    expect(onChange).toHaveBeenCalledWith('')
  })
})
