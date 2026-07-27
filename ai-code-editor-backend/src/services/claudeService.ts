// ── Gemini-backed AI service ────────────────────────────────────
//
// NOTE: File is still named claudeService.ts so the rest of the app
// (routes, imports) doesn't need to change. Internally it now calls
// Google's Gemini API (free tier) instead of the Anthropic API.

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Helper: parse JSON from the model's text response ───────────
//
// Models sometimes wrap JSON in markdown code fences (```json ... ```).
// We strip those before parsing so the handler doesn't need to worry
// about the format variation.
function extractJSON<T>(raw: string): T {
  let cleaned = raw.trim();

  const jsonBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
  const match = cleaned.match(jsonBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  return JSON.parse(cleaned) as T;
}

// ── Main API call ───────────────────────────────────────────────

export interface CallClaudeOptions {
  /** The primary user message. Can include instructions + context. */
  prompt: string;
  /** Optional system-level instructions (role / personality). */
  system?: string;
  /** Maximum tokens to generate. Defaults to 4096. */
  maxTokens?: number;
}

/**
 * Send a prompt to Gemini and return the parsed JSON output.
 *
 * The caller tells the model to respond with JSON only; this function
 * strips any markdown fences before parsing.
 *
 * @throws If the API call fails or the response cannot be parsed as JSON.
 */
export async function callClaudeAndParseJSON<T>(
  options: CallClaudeOptions,
): Promise<T> {
  const { prompt, system, maxTokens = 4096 } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const body = {
    ...(system
      ? { system_instruction: { parts: [{ text: system }] } }
      : {}),
    contents: [
      {
        role: "user" as const,
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no text content");
  }

  return extractJSON<T>(text);
}