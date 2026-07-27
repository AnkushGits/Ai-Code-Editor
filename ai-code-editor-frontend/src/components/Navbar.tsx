import { useEditor } from '../context/EditorContext'
import type { Mode } from '../types'

const modes: { key: Mode; label: string }[] = [
  { key: 'intent', label: 'Intent Mode' },
  { key: 'review', label: 'Review Mode' },
  { key: 'memory', label: 'Memory Mode' },
]

export default function Navbar() {
  const { activeMode, setActiveMode } = useEditor()

  return (
    <header className="flex h-12 items-center justify-between border-b border-[#1e1e1e] bg-[#252526] px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5 3L13 8.5L10.5 12L13 15.5L9.5 21L3 12L9.5 3ZM14.5 3L21 12L14.5 21L11 15.5L13.5 12L11 8.5L14.5 3Z" />
          </svg>
          <span className="select-none text-sm font-semibold text-[#cccccc]">
            AI Code Editor
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeMode === mode.key
                ? 'bg-[#094771] text-white'
                : 'text-[#969696] hover:text-[#cccccc]'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

