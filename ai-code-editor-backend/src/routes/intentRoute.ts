import { Router, type Request, type Response } from "express";
import { callClaudeAndParseJSON } from "../services/claudeService.js";
import type { IntentRequest, IntentResponse } from "../types/index.js";

const router = Router();

/**
 * POST /api/intent
 *
 * Rewrite code according to a natural-language instruction.
 *
 * Request:  { code: string; language: string; instruction: string }
 * Response: { before: string; after: string; explanation: string }
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language, instruction } = req.body as IntentRequest;

    // ── Validate input ──────────────────────────────────────────
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing required field: 'code' (string)" });
      return;
    }
    if (!language || typeof language !== "string") {
      res.status(400).json({ error: "Missing required field: 'language' (string)" });
      return;
    }
    if (!instruction || typeof instruction !== "string") {
      res.status(400).json({ error: "Missing required field: 'instruction' (string)" });
      return;
    }

    const prompt = `You are an AI-powered code assistant. Given the following ${language} code and a user instruction, rewrite the code according to the instruction.

Respond ONLY with a strict JSON object (no markdown, no preamble) in this exact format:
{
  "before": "<the original code as-is>",
  "after": "<the rewritten code>",
  "explanation": "<short explanation of what changed and why>"
}

Original code:
\`\`\`${language}
${code}
\`\`\`

User instruction:
${instruction}

Return ONLY the JSON object, nothing else.`;

    const data = await callClaudeAndParseJSON<IntentResponse>({
      prompt,
      system: "You are a helpful AI coding assistant that rewrites code based on user instructions. Always respond with valid JSON only.",
      maxTokens: 4096,
    });

    if (typeof data.before !== "string" || typeof data.after !== "string" || typeof data.explanation !== "string") {
      res.status(500).json({ error: "Claude returned an unexpected response format" });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Intent Route Error]", message);
    res.status(500).json({ error: "Failed to process intent", details: message });
  }
});

export default router;

