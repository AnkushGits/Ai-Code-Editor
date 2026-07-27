import Editor, { type BeforeMount } from '@monaco-editor/react'
import { useEditor } from '../context/EditorContext'

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

export default function EditorPanel() {
  const { code, setCode, language, setLanguage } = useEditor()

  const handleEditorBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('vscode-dark-plus', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
      },
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#252526] px-3 py-1.5">
        <span className="text-xs text-[#969696]">Editor</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-0.5 text-xs text-[#cccccc] outline-none focus:border-[#007fd4]"
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vscode-dark-plus"
          beforeMount={handleEditorBeforeMount}
          options={{
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 8 },
            bracketPairColorization: { enabled: true },
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </div>
  )
}

