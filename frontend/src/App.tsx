import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Lazy load page components for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const QuestionsPage = lazy(() => import('@/pages/QuestionsPage'))
const QuestionDetailPage = lazy(() => import('@/pages/QuestionDetailPage'))
const QuizPage = lazy(() => import('@/pages/QuizPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Loading fallback component for Suspense
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <HomePage />
                </Suspense>
              }
            />
            <Route
              path="/questions"
              element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <QuestionsPage />
                </Suspense>
              }
            />
            <Route
              path="/questions/:id"
              element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <QuestionDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/quiz"
              element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <QuizPage />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
