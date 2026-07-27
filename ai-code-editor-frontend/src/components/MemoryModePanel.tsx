import { useState, useRef, useEffect } from 'react'
import { useEditor } from '../context/EditorContext'
import { queryMemory } from '../api/memoryApi'
import type { ChatMessage } from '../types'

export default function MemoryModePanel() {
  const { code, language, chatMessages, setChatMessages } = useEditor()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async () => {
    if (!question.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question.trim(),
      timestamp: Date.now(),
    }

    setChatMessages([...chatMessages, userMessage])
    setQuestion('')
    setLoading(true)
    setError(null)

    try {
      const response = await queryMemory(userMessage.content, code, language)
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-[#cccccc]">
      <div className="border-b border-[#1e1e1e] bg-[#252526] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#969696]">
          Memory Mode
        </h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {chatMessages.length === 0 && (
          <div className="mt-8 text-center text-xs text-[#969696]">
            <p>Ask a question about your codebase</p>
            <p className="mt-1">e.g. "Why does this function exist?"</p>
          </div>
        )}

        <div className="space-y-3">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#094771] text-white'
                    : 'border border-[#3c3c3c] bg-[#252526] text-[#cccccc]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-1 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    <span className="text-[10px] font-medium text-blue-400">AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg border border-[#3c3c3c] bg-[#252526] px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-800 bg-red-900/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#1e1e1e] bg-[#252526] p-3">
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 resize-none rounded border border-[#3c3c3c] bg-[#1e1e1e] p-2 text-sm text-[#cccccc] placeholder-[#969696] outline-none focus:border-[#007fd4]"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading || !question.trim()}
            className="self-end rounded bg-[#094771] p-2 text-white transition-colors hover:bg-[#1a6ba0] disabled:cursor-not-allowed disabled:opacity-50"
            title="Send message"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 14V2l12 6L2 14z" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-[#969696]">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}

