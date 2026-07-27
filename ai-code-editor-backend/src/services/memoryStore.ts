import type { ChunkSummary } from "../types/index.js";

/**
 * In-memory store for code chunk summaries keyed by file name.
 *
 * ─── IMPORTANT ──────────────────────────────────────────────────
 * This is a simple in-memory implementation intended for prototyping
 * and local development. It does NOT persist data across server
 * restarts and is NOT suitable for production use.
 *
 * For a production deployment, replace this module with a real vector
 * database such as Chroma, Pinecone, or Weaviate to enable
 * scalable, persistent, semantic search over stored summaries.
 * ────────────────────────────────────────────────────────────────
 */

/** Internal record stored per file. */
interface FileSummaryRecord {
  chunks: ChunkSummary[];
}

const store = new Map<string, FileSummaryRecord>();

// ── Public API ──────────────────────────────────────────────────

/**
 * Store (or overwrite) the chunk summaries for a given file.
 */
export function setSummaries(fileName: string, chunks: ChunkSummary[]): void {
  store.set(fileName, { chunks });
}

/**
 * Retrieve the stored chunk summaries for a file, or `undefined` if
 * the file has not been summarised yet.
 */
export function getSummaries(fileName: string): ChunkSummary[] | undefined {
  return store.get(fileName)?.chunks;
}

/**
 * Check whether summaries exist for a file.
 */
export function hasSummaries(fileName: string): boolean {
  return store.has(fileName);
}

/**
 * Remove all stored summaries (useful for testing).
 */
export function clear(): void {
  store.clear();
}

/**
 * Return the total number of files currently stored.
 */
export function size(): number {
  return store.size;
}

