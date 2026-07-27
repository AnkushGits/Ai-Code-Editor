import type { DiffContent } from '../types'
import { API_BASE_URL } from './config'

interface BackendIntentResponse {
  before: string
  after: string
  explanation: string
}

/**
 * Runs the intent mode analysis on the given code with the provided instruction
 * by calling the backend, which sends the code + instruction to the AI model.
 */
export async function runIntentMode(
  code: string,
  instruction: string,
  language: string,
): Promise<DiffContent> {
  const response = await fetch(`${API_BASE_URL}/api/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, instruction, language }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => null)
    throw new Error(errBody?.error ?? `Intent request failed (${response.status})`)
  }

  const data: BackendIntentResponse = await response.json()

  return {
    before: data.before,
    after: data.after,
  }
}
