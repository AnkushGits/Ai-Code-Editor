import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Mode, DiffContent, ReviewComment, ChatMessage, FileItem } from '../types'

interface EditorContextType {
  // File workspace
  files: FileItem[]
  activeFileName: string
  openFile: (fileName: string) => void
  addFile: (file: FileItem) => void

  // Currently open file's content/language (kept in sync with `files`)
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage: (lang: string) => void

  activeMode: Mode
  setActiveMode: (mode: Mode) => void
  intentResult: DiffContent | null
  setIntentResult: (result: DiffContent | null) => void
  reviewComments: ReviewComment[]
  setReviewComments: React.Dispatch<React.SetStateAction<ReviewComment[]>>
  chatMessages: ChatMessage[]
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const EditorContext = createContext<EditorContextType | null>(null)

const INITIAL_FILES: FileItem[] = [
  {
    name: 'index.ts',
    language: 'typescript',
    content: `// Welcome to AI Code Editor
// Select a file from the sidebar, or click "+ New File" to add your own

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to the AI Code Editor.\`;
}

const message = greet("Developer");
console.log(message);
`,
  },
  { name: 'app.tsx', language: 'typescript', content: '// app.tsx\nimport React from "react";\n\nexport default function App() {\n  return <div>Hello</div>;\n}' },
  { name: 'styles.css', language: 'css', content: '/* styles.css */\nbody {\n  margin: 0;\n  padding: 0;\n}' },
  { name: 'main.py', language: 'python', content: '# main.py\ndef hello():\n    print("Hello from Python")\n\nhello()' },
  { name: 'utils.js', language: 'javascript', content: '// utils.js\nexport function formatDate(date) {\n  return date.toISOString();\n}' },
  { name: 'config.json', language: 'json', content: '{\n  "name": "AI Code Editor",\n  "version": "1.0.0"\n}' },
]

export function EditorProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES)
  const [activeFileName, setActiveFileName] = useState<string>(INITIAL_FILES[0].name)
  const [code, setCodeState] = useState<string>(INITIAL_FILES[0].content)
  const [language, setLanguageState] = useState<string>(INITIAL_FILES[0].language)
  const [activeMode, setActiveMode] = useState<Mode>('intent')
  const [intentResult, setIntentResult] = useState<DiffContent | null>(null)
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  // Editing the code also writes it back into the files list,
  // so switching files and coming back preserves your edits.
  const setCode = (newCode: string) => {
    setCodeState(newCode)
    setFiles((prev) =>
      prev.map((f) => (f.name === activeFileName ? { ...f, content: newCode } : f)),
    )
  }

  // Changing the language dropdown also updates the active file's stored language.
  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    setFiles((prev) =>
      prev.map((f) => (f.name === activeFileName ? { ...f, language: lang } : f)),
    )
  }

  const openFile = (fileName: string) => {
    const file = files.find((f) => f.name === fileName)
    if (!file) return
    setActiveFileName(fileName)
    setCodeState(file.content)
    setLanguageState(file.language)
  }

  const addFile = (file: FileItem) => {
    setFiles((prev) => [...prev, file])
    setActiveFileName(file.name)
    setCodeState(file.content)
    setLanguageState(file.language)
  }

  return (
    <EditorContext.Provider
      value={{
        files,
        activeFileName,
        openFile,
        addFile,
        code,
        setCode,
        language,
        setLanguage,
        activeMode,
        setActiveMode,
        intentResult,
        setIntentResult,
        reviewComments,
        setReviewComments,
        chatMessages,
        setChatMessages,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor(): EditorContextType {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
