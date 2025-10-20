import { useState } from 'react'
import { healthCheck, fetchQuestions } from '@/api'
import type { ApiError } from '@/api'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [healthResult, setHealthResult] = useState<string | null>(null)
  const [questionsResult, setQuestionsResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleHealthCheck = async () => {
    setLoading(true)
    setError(null)
    setHealthResult(null)

    try {
      const response = await healthCheck()
      setHealthResult(JSON.stringify(response, null, 2))
    } catch (err) {
      const apiError = err as ApiError
      setError(`Health Check Failed: ${apiError.detail || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchQuestions = async () => {
    setLoading(true)
    setError(null)
    setQuestionsResult(null)

    try {
      const response = await fetchQuestions({ limit: 5 })
      setQuestionsResult(JSON.stringify(response, null, 2))
    } catch (err) {
      const apiError = err as ApiError
      setError(`Fetch Questions Failed: ${apiError.detail || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setHealthResult(null)
    setQuestionsResult(null)
    setError(null)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Connection Test</h1>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleHealthCheck}
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          Test Health Check
        </button>

        <button
          onClick={handleFetchQuestions}
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          Fetch 5 Questions
        </button>

        <button
          onClick={clearResults}
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {healthResult && (
        <div style={{ marginBottom: '1rem' }}>
          <h2>Health Check Result:</h2>
          <pre style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {healthResult}
          </pre>
        </div>
      )}

      {questionsResult && (
        <div>
          <h2>Questions Result:</h2>
          <pre style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {questionsResult}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p><strong>What this tests:</strong></p>
        <ul>
          <li>API client is configured correctly</li>
          <li>Axios interceptors are working</li>
          <li>TypeScript types are correct</li>
          <li>Backend connection is established</li>
          <li>Error handling is working</li>
        </ul>
      </div>
    </div>
  )
}

export default App
