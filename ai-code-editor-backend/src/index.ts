export interface FileItem {
  name: string
  language: string
  content: string
}

export interface FileSystemFileHandle {}
export interface FileSystemDirectoryHandle {}

// A node in the real, disk-backed workspace tree (files and folders
// opened via "Open Folder" or drag-and-drop, plus loose in-memory files
// created via "+ New File" before they've ever been saved).
export interface FileNode {
  id: string // stable path-based id, e.g. "root/src/App.tsx"
  name: string
  kind: 'file' | 'directory'
  language?: string // only for files
  content?: string // only for files; undefined until loaded
  isDirty?: boolean // has unsaved changes since last disk write
  isBinaryOrTooLarge?: boolean // file exists but we didn't load its content
  children?: FileNode[] // only for directories
  isExpanded?: boolean // only for directories, UI state
  // Real browser handles enabling actual disk read/write.
  // Present only in Chromium browsers with File System Access API support.
  fileHandle?: FileSystemFileHandle
  dirHandle?: FileSystemDirectoryHandle
}

export interface ReviewComment {
  id: string
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  line?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface DiffContent {
  before: string
  after: string
}

export type Mode = 'intent' | 'review' | 'memory'

