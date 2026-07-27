export interface FileItem {
  name: string
  language: string
  content: string
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

