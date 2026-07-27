import { useState } from 'react'
import { useEditor } from '../context/EditorContext'
import { runReviewMode } from '../api/reviewApi'
import type { ReviewComment } from '../types'

const severityConfig = {
  error: {
    bg: 'bg-red-900/20',
    border: 'border-red-800/50',
    badge: 'bg-red-600',
    label: 'Error',
  },
  warning: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-700/50',
    badge: 'bg-yellow-600',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-800/50',
    badge: 'bg-blue-600',
    label: 'Info',
  },
}

export default function ReviewModePanel() {
  const { code, language, reviewComments, setReviewComments } = useEditor()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunReview = async () => {
    setLoading(true)
    setError(null)
    try {
      const comments: ReviewComment[] = await runReviewMode(code, language)
      setReviewComments(comments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="border-b border-[#1e1e1e] bg-[#252526] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#969696]">
          Review Mode
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Run Review Button */}
        <button
          onClick={handleRunReview}
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-[#094771] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a6ba0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7V4zm0 6h2v2H7v-2z" />
              </svg>
              Run Review
            </>
          )}
        </button>

        {error && (
          <div className="mb-3 rounded border border-red-800 bg-red-900/30 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Review Comments */}
        {reviewComments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#969696]">
              Results ({reviewComments.length})
            </h3>
            {reviewComments.map((comment) => {
              const config = severityConfig[comment.severity]
              return (
                <div
                  key={comment.id}
                  className={`rounded border ${config.border} ${config.bg} p-3`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white ${config.badge}`}
                    >
                      {config.label}
                    </span>
                    {comment.line != null && (
                      <span className="text-[10px] text-[#969696]">Line {comment.line}</span>
                    )}
                  </div>
                  <h4 className="mb-0.5 text-sm font-medium text-[#cccccc]">{comment.title}</h4>
                  <p className="text-xs leading-relaxed text-[#969696]">{comment.description}</p>
                </div>
              )
            })}
          </div>
        )}

        {reviewComments.length === 0 && !loading && (
          <div className="mt-8 text-center text-xs text-[#969696]">
            <p>Click "Run Review" to analyze your code</p>
            <p className="mt-1">for potential issues and improvements.</p>
          </div>
        )}
      </div>
    </div>
  )
}

