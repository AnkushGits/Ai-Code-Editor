import { useState } from 'react'
import type { FileItem } from '../types'
import { useEditor } from '../context/EditorContext'

const fileIconMap: Record<string, string> = {
  typescript: '🟦',
  javascript: '🟨',
  python: '🐍',
  css: '🎨',
  html: '🌐',
  json: '📋',
  cpp: '⚙️',
  c: '⚙️',
  java: '☕',
  go: '🐹',
  rust: '🦀',
  php: '🐘',
  csharp: '🟪',
  ruby: '💎',
  markdown: '📝',
}

// Maps a file extension to a Monaco/backend-recognized language id.
// Used so language is auto-detected from the filename when adding a new file.
const extensionToLanguage: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  css: 'css',
  html: 'html',
  htm: 'html',
  json: 'json',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  java: 'java',
  go: 'go',
  rs: 'rust',
  php: 'php',
  cs: 'csharp',
  rb: 'ruby',
  md: 'markdown',
}

const languageOptions = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'markdown', label: 'Markdown' },
]

function detectLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return extensionToLanguage[ext] ?? 'plaintext'
}

export default function Sidebar() {
  const { files, activeFileName, openFile, addFile } = useEditor()
  const [collapsed, setCollapsed] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('cpp')
  const [addError, setAddError] = useState<string | null>(null)

  const handleFileNameChange = (value: string) => {
    setNewFileName(value)
    setAddError(null)
    // Auto-detect language as the user types a recognizable extension
    if (value.includes('.')) {
      const detected = detectLanguageFromFileName(value)
      if (detected !== 'plaintext') {
        setNewFileLanguage(detected)
      }
    }
  }

  const handleCreateFile = () => {
    const trimmed = newFileName.trim()
    if (!trimmed) {
      setAddError('File name is required')
      return
    }
    if (files.some((f) => f.name === trimmed)) {
      setAddError('A file with this name already exists')
      return
    }

    const newFile: FileItem = {
      name: trimmed,
      language: newFileLanguage,
      content: `// ${trimmed}\n// Start writing your ${newFileLanguage} code here\n`,
    }
    addFile(newFile)
    setNewFileName('')
    setIsAdding(false)
    setAddError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreateFile()
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewFileName('')
      setAddError(null)
    }
  }

  if (collapsed) {
    return (
      <aside className="flex w-10 flex-col items-center border-r border-[#1e1e1e] bg-[#252526] pt-2">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded p-1.5 text-[#969696] hover:text-[#cccccc]"
          title="Expand sidebar"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex w-56 flex-col border-r border-[#1e1e1e] bg-[#252526]">
      <div className="flex items-center justify-between border-b border-[#1e1e1e] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#969696]">
          Explorer
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-1 text-[#969696] hover:text-[#cccccc]"
          title="Collapse sidebar"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="px-1 text-xs font-medium text-[#969696]">Workspace</span>
          <button
            onClick={() => setIsAdding(true)}
            className="rounded p-1 text-[#969696] hover:bg-[#2a2d2e] hover:text-[#cccccc]"
            title="New File"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <div className="mx-2 mb-2 rounded border border-[#3c3c3c] bg-[#1e1e1e] p-2">
            <input
              autoFocus
              value={newFileName}
              onChange={(e) => handleFileNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. solution.cpp"
              className="mb-1.5 w-full rounded border border-[#3c3c3c] bg-[#252526] px-2 py-1 text-xs text-[#cccccc] placeholder-[#6e6e6e] outline-none focus:border-[#007fd4]"
            />
            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value)}
              className="mb-1.5 w-full rounded border border-[#3c3c3c] bg-[#252526] px-2 py-1 text-xs text-[#cccccc] outline-none focus:border-[#007fd4]"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {addError && <p className="mb-1.5 text-[10px] text-red-400">{addError}</p>}
            <div className="flex gap-1.5">
              <button
                onClick={handleCreateFile}
                className="flex-1 rounded bg-[#094771] px-2 py-1 text-xs font-medium text-white hover:bg-[#1a6ba0]"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewFileName('')
                  setAddError(null)
                }}
                className="flex-1 rounded border border-[#3c3c3c] px-2 py-1 text-xs text-[#969696] hover:text-[#cccccc]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => openFile(file.name)}
            className={`flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm transition-colors ${
              activeFileName === file.name
                ? 'bg-[#094771] text-[#cccccc]'
                : 'text-[#969696] hover:bg-[#2a2d2e] hover:text-[#cccccc]'
            }`}
          >
            <span className="text-xs">{fileIconMap[file.language] ?? '📄'}</span>
            <span>{file.name}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
