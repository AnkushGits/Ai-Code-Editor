import { API_BASE_URL } from './config'

// Since the current UI doesn't yet track distinct file names per tab,
// we use a single fixed key so memory persists across questions in a session.
// TODO: replace with the real active file name once multi-file tracking exists.
const CURRENT_FILE_KEY = 'current-file'

interface SummarizeResponse {
  chunks: Array<{
    name: string
    startLine: number
    endLine: number
    summary: string
  }>
}

interface AskResponse {
  answer: string
}

/**
 * Queries the AI memory with a question about the codebase.
 *
 * Under the hood this:
 * 1. Re-summarizes the current code (so memory reflects the latest edits)
 * 2. Asks the question against those stored summaries
 */
export async function queryMemory(question: string, code: string, language: string): Promise<string> {
  // Step 1: refresh the stored summary for the current code
  const summarizeRes = await fetch(`${API_BASE_URL}/api/memory/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, fileName: CURRENT_FILE_KEY, language }),
  })

  if (!summarizeRes.ok) {
    const errBody = await summarizeRes.json().catch(() => null)
    throw new Error(errBody?.error ?? `Memory summarize failed (${summarizeRes.status})`)
  }
  await (summarizeRes.json() as Promise<SummarizeResponse>)

  // Step 2: ask the question using the freshly stored summaries
  const askRes = await fetch(`${API_BASE_URL}/api/memory/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: CURRENT_FILE_KEY, question }),
  })

  if (!askRes.ok) {
    const errBody = await askRes.json().catch(() => null)
    throw new Error(errBody?.error ?? `Memory ask failed (${askRes.status})`)
  }

  const data: AskResponse = await askRes.json()
  return data.answer
}
