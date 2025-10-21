/**
 * MainLayout Component Tests
 *
 * Tests for the MainLayout component including:
 * - Header and Footer rendering
 * - Child content rendering via Outlet
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './MainLayout'

describe('MainLayout Component', () => {
  it('should render Header component', () => {
    render(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div>Test Content</div>} />
        </Route>
      </Routes>
    )

    expect(screen.getByRole('heading', { name: /Quizling/i })).toBeInTheDocument()
  })

  it('should render Footer component', () => {
    render(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div>Test Content</div>} />
        </Route>
      </Routes>
    )

    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  it('should render child content via Outlet', () => {
    render(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div>Test Child Content</div>} />
        </Route>
      </Routes>
    )

    expect(screen.getByText(/Test Child Content/i)).toBeInTheDocument()
  })
})
