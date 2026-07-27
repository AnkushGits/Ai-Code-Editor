import { Router, type Request, type Response } from "express";
import { callClaudeAndParseJSON } from "../services/claudeService.js";
import type { ReviewRequest, ReviewResponse } from "../types/index.js";

const router = Router();

/**
 * POST /apiAction
 *
 * Review code for readability, quality, and issues.
 *
 * Request:  { code: string; language: string }
 * Response: { results: Array<{ severity, line, title, description }> }
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body as ReviewRequest;

    // ── Validate input ──────────────────────────────────────────
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing required field: 'code' (string)" });
      return;
    }
    if (!language || typeof language !== "string") {
      res.status(400).json({ error: "Missing required field: 'language' (string)" });
      return;
    }

    const prompt = `You are a senior code reviewer reviewing ${language} code.

Review the following code for:
- Bugs and logic errors
- Style issues and readability concerns
- Security vulnerabilities
- Performance problems

Respond ONLY with a strict JSON object (no markdown, no preamble) in this exact format:
{
  "results": [
    {
      "severity": "error" | "warning" | "info",
      "line": <number>,
      "title": "<short title>",
      "description": "<detailed description>"
    }
  ]
}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON object, nothing else.`;

    const data = await callClaudeAndParseJSON<ReviewResponse>({
      prompt,
      system: "You are a meticulous senior software engineer performing a code review. Always respond with valid JSON only.",
      maxTokens: 4096,
    });

    // Ensure the response has the expected shape
    if (!Array.isArray(data.results)) {
      res.status(500).json({ error: "Claude returned an unexpected response format" });
      return;
    }

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Review Route Error]", message);
    res.status(500).json({ error: "Failed to review code", details: message });
  }
});

export default router;

