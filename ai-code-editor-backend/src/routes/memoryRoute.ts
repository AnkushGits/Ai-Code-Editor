import { Router, type Request, type Response } from "express";
import { callClaudeAndParseJSON } from "../services/claudeService.js";
import { setSummaries, getSummaries } from "../services/memoryStore.js";
import type {
  MemorySummarizeRequest,
  MemorySummarizeResponse,
  MemoryAskRequest,
  MemoryAskResponse,
} from "../types/index.js";

const router = Router();

/**
 * POST /api/memory/summarize
 *
 * Break code into logical chunks and generate purpose summaries.
 * Stores results in the in-memory store keyed by fileName.
 *
 * Request:  { code: string; fileName: string; language: string }
 * Response: { chunks: Array<{ name, startLine, endLine, summary }> }
 */
router.post("/summarize", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, fileName, language } = req.body as MemorySummarizeRequest;

    // ── Validate input ──────────────────────────────────────────
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing required field: 'code' (string)" });
      return;
    }
    if (!fileName || typeof fileName !== "string") {
      res.status(400).json({ error: "Missing required field: 'fileName' (string)" });
      return;
    }
    if (!language || typeof language !== "string") {
      res.status(400).json({ error: "Missing required field: 'language' (string)" });
      return;
    }

    const prompt = `You are an expert ${language} developer. Analyse the following code and break it into logical chunks (functions, classes, or significant blocks). For each chunk, provide its name, the start/end line numbers, and a one-sentence summary of its purpose.

Respond ONLY with a strict JSON object (no markdown, no preamble) in this exact format:
{
  "chunks": [
    {
      "name": "<chunk name (function/class name)>",
      "startLine": <number>,
      "endLine": <number>,
      "summary": "<one-sentence purpose summary>"
    }
  ]
}

Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON object, nothing else.`;

    const data = await callClaudeAndParseJSON<MemorySummarizeResponse>({
      prompt,
      system: "You are an expert code analyst. Always respond with valid JSON only.",
      maxTokens: 4096,
    });

    if (!Array.isArray(data.chunks)) {
      res.status(500).json({ error: "Claude returned an unexpected response format" });
      return;
    }

    // Store in memory
    setSummaries(fileName, data.chunks);

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Memory Summarize Error]", message);
    res.status(500).json({ error: "Failed to summarize code", details: message });
  }
});

/**
 * POST /api/memory/ask
 *
 * Ask a question about a previously summarised file.
 *
 * Request:  { fileName: string; question: string }
 * Response: { answer: string }
 */
router.post("/ask", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, question } = req.body as MemoryAskRequest;

    // ── Validate input ──────────────────────────────────────────
    if (!fileName || typeof fileName !== "string") {
      res.status(400).json({ error: "Missing required field: 'fileName' (string)" });
      return;
    }
    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Missing required field: 'question' (string)" });
      return;
    }

    // Retrieve stored summaries
    const summaries = getSummaries(fileName);
    if (!summaries || summaries.length === 0) {
      res.status(404).json({
        error: `No stored summaries found for file '${fileName}'. Call POST /api/memory/summarize first.`,
      });
      return;
    }

    const context = JSON.stringify(summaries, null, 2);

    const prompt = `You are a code-memory assistant. You have the following pre-computed chunk summaries for the file "${fileName}":

${context}

Answer the user's question using ONLY the information in these summaries. If the answer cannot be determined from the summaries alone, say so.

Respond ONLY with a strict JSON object (no markdown, no preamble) in this exact format:
{
  "answer": "<your answer>"
}

User question:
${question}

Return ONLY the JSON object, nothing else.`;

    const data = await callClaudeAndParseJSON<MemoryAskResponse>({
      prompt,
      system: "You are a helpful code-memory assistant. Always respond with valid JSON only.",
      maxTokens: 2048,
    });

    if (typeof data.answer !== "string") {
      res.status(500).json({ error: "Claude returned an unexpected response format" });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Memory Ask Error]", message);
    res.status(500).json({ error: "Failed to answer question", details: message });
  }
});

export default router;

