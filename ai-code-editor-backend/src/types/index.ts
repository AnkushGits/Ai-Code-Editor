// ──────────────────────────────────────────────
// Request body types
// ──────────────────────────────────────────────

export interface ReviewRequest {
  code: string;
  language: string;
}

export interface ReviewResult {
  severity: "error" | "warning" | "info";
  line: number;
  title: string;
  description: string;
}

export interface ReviewResponse {
  results: ReviewResult[];
}

// ──────────────────────────────────────────────

export interface IntentRequest {
  code: string;
  language: string;
  instruction: string;
}

export interface IntentResponse {
  before: string;
  after: string;
  explanation: string;
}

// ──────────────────────────────────────────────

export interface MemorySummarizeRequest {
  code: string;
  fileName: string;
  language: string;
}

export interface ChunkSummary {
  name: string;
  startLine: number;
  endLine: number;
  summary: string;
}

export interface MemorySummarizeResponse {
  chunks: ChunkSummary[];
}

// ──────────────────────────────────────────────

export interface MemoryAskRequest {
  fileName: string;
  question: string;
}

export interface MemoryAskResponse {
  answer: string;
}

// ──────────────────────────────────────────────
// Claude service internal types
// ──────────────────────────────────────────────

export type ClaudeResponse<T> = T & {
  /** Raw text from Claude before parsing (for debugging/fallback) */
  _raw?: string;
};

