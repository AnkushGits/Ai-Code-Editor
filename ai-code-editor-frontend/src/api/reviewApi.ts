import type { ReviewComment } from '../types'
import { API_BASE_URL } from './config'

interface BackendReviewResult {
  severity: 'error' | 'warning' | 'info'
  line: number
  title: string
  description: string
}

interface BackendReviewResponse {
  results: BackendReviewResult[]
}

/**
 * Runs a code review on the given code by calling the backend,
 * which sends the code to the AI model and returns structured feedback.
 */
export async function runReviewMode(code: string, language: string): Promise<ReviewComment[]> {
  const response = await fetch(`${API_BASE_URL}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => null)
    throw new Error(errBody?.error ?? `Review request failed (${response.status})`)
  }

  const data: BackendReviewResponse = await response.json()

  // Map backend shape to the frontend's ReviewComment shape (adds an id)
  return data.results.map((r, index) => ({
    id: `${index}-${r.line}-${r.title}`,
    severity: r.severity,
    title: r.title,
    description: r.description,
    line: r.line,
  }))
}
