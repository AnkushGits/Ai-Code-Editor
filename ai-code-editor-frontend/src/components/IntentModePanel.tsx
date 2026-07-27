import { useState } from 'react'
import { useEditor } from '../context/EditorContext'
import { runIntentMode } from '../api/intentApi'
import type { DiffContent } from '../types'

export default function IntentModePanel() {
  const { code, language, intentResult, setIntentResult } = useEditor()
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunIntent = async () => {
    if (!instruction.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result: DiffContent = await runIntentMode(code, instruction, language)
      setIntentResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run intent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="border-b border-[#1e1e1e] bg-[#252526] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#969696]">
          Intent Mode
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Instruction Input */}
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Type your instruction here... (e.g. 'optimize this function')"
          className="mb-3 w-full resize-none rounded border border-[#3c3c3c] bg-[#252526] p-2.5 text-sm text-[#cccccc] placeholder-[#969696] outline-none focus:border-[#007fd4]"
          rows={3}
        />

        {/* Run Intent Button */}
        <button
          onClick={handleRunIntent}
          disabled={loading || !instruction.trim()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-[#094771] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a6ba0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 14V2l10 6-10 6z" />
              </svg>
              Run Intent
            </>
          )}
        </button>

        {error && (
          <div className="mb-3 rounded border border-red-800 bg-red-900/30 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Diff Display */}
        {intentResult && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#969696]">Changes</h3>

            {/* Before */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#3c3c3c] bg-[#252526] px-2 py-1">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-400">Before</span>
              </div>
              <pre className="overflow-x-auto bg-[#1e1e1e] p-2.5 text-xs leading-relaxed text-[#ce9178]">
                <code>{intentResult.before}</code>
              </pre>
            </div>

            {/* After */}
            <div>
              <div className="flex items-center gap-2 border-b border-[#3c3c3c] bg-[#252526] px-2 py-1">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-400">After</span>
              </div>
              <pre className="overflow-x-auto bg-[#1e1e1e] p-2.5 text-xs leading-relaxed text-[#ce9178]">
                <code>{intentResult.after}</code>
              </pre>
            </div>
          </div>
        )}

        {!intentResult && !loading && (
          <div className="mt-8 text-center text-xs text-[#969696]">
            <p>Enter an instruction above and click "Run Intent"</p>
            <p className="mt-1">to see AI-powered code changes.</p>
          </div>
        )}
      </div>
    </div>
  )
}

