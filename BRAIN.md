# 🧠 AI Code Editor — Complete Project Brain

> **Generated from full source-code analysis of both frontend and backend.**

> start date : 01/12/2025

> End date :: processing 
---

## 1. PROJECT OVERVIEW

**AI Code Editor** is a local web application that pairs a Monaco-based code editor (the same editor VS Code uses) with an AI backend powered by Google Gemini (free tier). It lets developers write code in the browser and then use natural language to review, rewrite, or ask questions about it — all without leaving the editor.

The project has **three core features**, each accessible from a top navbar:

### Core Features

| Feature | Button in Navbar | What It Actually Does |
|---|---|---|
| **Intent Mode** | `Intent Mode` | Takes a natural-language instruction (e.g. "optimize this function") and asks Gemini to rewrite the current editor code. Displays a before/after diff. |
| **Review Mode** | `Review Mode` | Sends the current editor code to Gemini for a structured code review. Returns a list of issues with severity, line number, title, and description. |
| **Code Work Memory** | `Memory Mode` | First breaks the current code into logical chunks and summarizes each (stored server-side in memory), then lets you ask questions about that code in a chat interface. Answers are based on the stored summaries, not the full code. |

---

## 2. ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │  Navbar.tsx │  │  Sidebar.tsx │  │     EditorPanel.tsx        │   │
│  │ (mode tabs) │  │ (file list)  │  │  (Monaco Editor instance)  │   │
│  └──────┬──────┘  └──────────────┘  └────────────┬───────────────┘   │
│         │                                         │                  │
│         │  activeMode                             │ code, language   │
│         ▼                                         ▼                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    EditorContext (React Context)              │   │
│  │  • files[] • activeFileName • code • language • activeMode   │   │
│  │  • intentResult • reviewComments[] • chatMessages[]          │   │
│  └──────┬──────┬──────┬─────────────────────────────────────────┘   │
│         │      │      │                                              │
│         ▼      ▼      ▼                                              │
│  ┌────────┐ ┌────────┐ ┌───────────┐                                │
│  │Intent  │ │Review  │ │Memory     │  <-- right side panel          │
│  │Mode    │ │Mode    │ │Mode       │     (changes per mode)         │
│  │Panel.ts│ │Panel.ts│ │Panel.ts   │                                │
│  └───┬────┘ └───┬────┘ └─────┬─────┘                                │
│      │          │            │                                       │
│      ▼          ▼            ▼                                       │
│  ┌────────┐ ┌────────┐ ┌──────────┐                                 │
│  │intent  │ │review  │ │memory    │  API Layer (api/ folder)        │
│  │Api.ts  │ │Api.ts  │ │Api.ts    │                                 │
│  └────┬───┘ └───┬────┘ └────┬─────┘                                 │
└───────┼──────────┼───────────┼───────────────────────────────────────┘
        │          │           │
        │   HTTP POST (fetch)  │  port configured in api/config.ts
        │          │           │  (currently http://localhost:5000)
        ▼          ▼           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express + TypeScript)                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    index.ts (Entry Point)                      │   │
│  │  • cors() middleware                                          │   │
│  │  • express.json({ limit: "2mb" })                             │   │
│  │  • Routes mounted:                                            │   │
│  │     /api/review  → reviewRoute.ts                             │   │
│  │     /api/intent  → intentRoute.ts                             │   │
│  │     /api/memory  → memoryRoute.ts                             │   │
│  │     /health      → inline health check                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                 claudeService.ts (AI Gateway)                 │   │
│  │  • Named "claudeService" but internally calls Google Gemini   │   │
│  │  • Model: gemini-flash-latest                                 │   │
│  │  • Uses env var: GEMINI_API_KEY                               │   │
│  │  • Temperature: 0.3 (low randomness)                          │   │
│  │  • Function: callClaudeAndParseJSON<T>()                      │   │
│  │    - Sends prompt + optional system instruction               │   │
│  │    - Strips markdown code fences from response                │   │
│  │    - Parses and returns typed JSON                            │   │
│  └───────────────────────┬───────────────────────────────────────┘   │
│                          │                                           │
│                          ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              memoryStore.ts (In-Memory Cache)                │   │
│  │  • Map<string, { chunks: ChunkSummary[] }>                   │   │
│  │  • Keyed by fileName string                                  │   │
│  │  • NOT persisted — resets on server restart                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Default port: 3001 (controlled by PORT env var)                    │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │  Google Gemini API (Free)    │
            │  gemini-flash-latest model   │
            │  generativelanguage.google-  │
            │  api.com/v1beta/models/...   │
            └──────────────────────────────┘
```

### End-to-End Request Flow (Review Mode Example)

1. User clicks **"Run Review"** in `ReviewModePanel.tsx`
2. `ReviewModePanel` calls `runReviewMode(code, language)` from `src/api/reviewApi.ts`
3. `reviewApi.ts` sends `POST` to `http://localhost:5000/api/review` with body `{ code, language }`
4. Backend `reviewRoute.ts` receives the request, validates inputs
5. Route calls `callClaudeAndParseJSON<ReviewResponse>()` in `claudeService.ts`
6. `claudeService.ts` constructs a Gemini request with a system prompt + review prompt + the code
7. Gemini returns a JSON response with `{ results: [...] }`
8. Backend validates that `results` is an array, sends it back as JSON
9. Frontend `reviewApi.ts` maps each result (adding an `id` field) and returns `ReviewComment[]`
10. `ReviewModePanel` stores the comments via `setReviewComments()`, which triggers a re-render
11. Each comment is displayed with severity badge (error/warning/info), line number, title, and description

---

## 3. TECH STACK

### Frontend (`ai-code-editor-frontend`)

| Group | Package | Version | Purpose |
|---|---|---|---|
| **UI Framework** | `react` | ^19.2.7 | Component-based UI library |
| | `react-dom` | ^19.2.7 | React DOM renderer |
| **Code Editor** | `@monaco-editor/react` | ^4.7.0 | Monaco Editor wrapper (same editor as VS Code) |
| **HTTP Client** | `axios` | ^1.18.1 | HTTP requests (installed but not used — the app uses `fetch()` instead) |
| **Icons** | `lucide-react` | ^1.25.0 | SVG icon library (installed but not used — the app uses inline SVGs) |
| **Styling** | `tailwindcss` | ^4.3.3 | Utility-first CSS framework |
| | `@tailwindcss/postcss` | ^4.3.3 | Tailwind PostCSS plugin (v4) |
| | `postcss` | ^8.5.22 | CSS transformation tool |
| | `autoprefixer` | ^10.5.4 | Vendor prefix auto-insertion |
| **Dev Tooling** | `vite` | ^8.1.1 | Build tool and dev server |
| | `@vitejs/plugin-react` | ^6.0.3 | React Fast Refresh for Vite |
| | `typescript` | ~6.0.2 | TypeScript compiler |
| | `oxlint` | ^1.71.0 | Rust-based linter (replaces ESLint) |
| | `@types/react` | ^19.2.17 | React type definitions |
| | `@types/react-dom` | ^19.2.3 | ReactDOM type definitions |
| | `@types/node` | ^24.13.2 | Node.js type definitions |

### Backend (`ai-code-editor-backend`)

| Group | Package | Version | Purpose |
|---|---|---|---|
| **Runtime** | `express` | ^5.2.1 | HTTP server framework (Express v5!) |
| | `cors` | ^2.8.6 | Cross-origin request support |
| | `dotenv` | ^17.4.2 | Loads `.env` files into `process.env` |
| **Dev Tooling** | `typescript` | ^5.5.4 | TypeScript compiler |
| | `tsx` | ^4.23.1 | TypeScript execution with watch mode |
| | `ts-node-dev` | ^2.0.0 | Alternative TS dev server (not used — `tsx` is used instead) |
| | `@types/express` | ^5.0.6 | Express type definitions |
| | `@types/cors` | ^2.8.19 | CORS type definitions |
| | `@types/node` | ^26.1.1 | Node.js type definitions |

### AI Provider

**Google Gemini (free tier)** — the model is `gemini-flash-latest`.

The service file is still named `claudeService.ts` (so all imports across routes remain unchanged), but internally it:
- Calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
- Uses `x-goog-api-key` header with `GEMINI_API_KEY` env var
- Was originally scaffolded for Anthropic Claude but was swapped to Gemini for free-tier access

---

## 4. FOLDER STRUCTURE

```
ai-code-editor/
│
├── BRAIN.md                                  ← THIS FILE
│
├── ai-code-editor-backend/
│   ├── .gitignore
│   ├── package.json                          # Backend deps & scripts (express, cors, dotenv)
│   ├── tsconfig.json                         # TypeScript config (strict, ESM)
│   ├── TODO.md                               # Implementation checklist
│   ├── Brain.md                              # Old backend-only brain doc (outdated — references Claude)
│   └── src/
│       ├── index.ts                          # Express entry: middleware, route mounting, health check
│       ├── routes/
│       │   ├── intentRoute.ts                # POST /api/intent — rewrite code by instruction
│       │   ├── reviewRoute.ts                # POST /api/review — structured code review
│       │   └── memoryRoute.ts                # POST /api/memory/summarize + /ask
│       ├── services/
│       │   ├── claudeService.ts              # Gemini API gateway (file still named claudeService)
│       │   └── memoryStore.ts                # In-memory Map<string, ChunkSummary[]> storage
│       └── types/
│           └── index.ts                      # All request/response TypeScript interfaces
│
└── ai-code-editor-frontend/
    ├── .gitignore
    ├── .oxlintrc.json                        # Oxlint (Rust linter) configuration
    ├── index.html                            # Vite entry HTML
    ├── package.json                          # Frontend deps & scripts (react, monaco, tailwind)
    ├── postcss.config.js                     # PostCSS: @tailwindcss/postcss plugin
    ├── tsconfig.json                         # Root TS config (references app + node configs)
    ├── tsconfig.app.json                     # App-specific TS config
    ├── tsconfig.node.json                    # Node-specific TS config
    ├── vite.config.ts                        # Vite config: React plugin
    ├── README.md                             # Placeholder README
    ├── TODO.md                               # Implementation checklist
    ├── public/
    │   ├── favicon.svg                       # Browser tab icon
    │   └── icons.svg                         # SVG icon sprite
    └── src/
        ├── main.tsx                          # React entry: renders <App /> into #root
        ├── App.tsx                           # Root layout: Navbar + Sidebar + Editor + ModePanel
        ├── index.css                         # Tailwind import + custom scrollbar + base styles
        ├── api/
        │   ├── config.ts                     # API_BASE_URL = 'http://localhost:5000'
        │   ├── intentApi.ts                  # Fetches POST /api/intent, returns DiffContent
        │   ├── reviewApi.ts                  # Fetches POST /api/review, returns ReviewComment[]
        │   └── memoryApi.ts                  # Fetches /summarize + /ask, returns answer string
        ├── assets/
        │   ├── hero.png                      # Hero image asset
        │   ├── react.svg                     # React logo
        │   └── vite.svg                      # Vite logo
        ├── components/
        │   ├── Navbar.tsx                    # Top bar: logo + mode tabs (Intent/Review/Memory)
        │   ├── Sidebar.tsx                   # File explorer: list files, "+ New File" button
        │   ├── EditorPanel.tsx               # Monaco code editor + language dropdown
        │   ├── IntentModePanel.tsx           # Right panel: instruction input + before/after diff
        │   ├── ReviewModePanel.tsx           # Right panel: "Run Review" button + issue list
        │   └── MemoryModePanel.tsx           # Right panel: chat interface for code Q&A
        ├── context/
        │   └── EditorContext.tsx             # Central state: files, code, mode, results
        └── types/
            └── index.ts                     # Frontend types: FileItem, ReviewComment, ChatMessage, etc.
```

---

## 5. HOW EACH FEATURE WORKS (Technical Deep Dive)

### 5A. Intent Mode

| Layer | File | What Happens |
|---|---|---|
| **Trigger** | `IntentModePanel.tsx` | User types an instruction in `<textarea>` and clicks "Run Intent" button → calls `runIntentMode(code, instruction, language)` |
| **API Call** | `src/api/intentApi.ts` | `POST` to `${API_BASE_URL}/api/intent` with body `{ code, instruction, language }` |
| **Backend Route** | `src/routes/intentRoute.ts` | Validates all three fields are strings, constructs a prompt asking Gemini to rewrite the code |
| **AI Prompt** | Constructed in `intentRoute.ts` | *"You are an AI-powered code assistant. Given the following ${language} code and a user instruction, rewrite the code according to the instruction. Respond ONLY with a strict JSON object..."* — includes the code in a fenced block and the user instruction verbatim |
| **Expected Response** | `{ before: string, after: string, explanation: string }` | The AI returns the original code, rewritten code, and a short explanation |
| **UI Display** | `IntentModePanel.tsx` | Renders two `<pre><code>` blocks side-by-vertical: "Before" (red label) and "After" (green label). The `explanation` field from the API is **not displayed** in the current UI (the frontend type `DiffContent` only has `before` and `after`). |

**Prompt system instruction:** *"You are a helpful AI coding assistant that rewrites code based on user instructions. Always respond with valid JSON only."*

**Prompt temperature:** 0.3 (low randomness for deterministic rewrites)

---

### 5B. Review Mode

| Layer | File | What Happens |
|---|---|---|
| **Trigger** | `ReviewModePanel.tsx` | User clicks "Run Review" button → calls `runReviewMode(code, language)` |
| **API Call** | `src/api/reviewApi.ts` | `POST` to `${API_BASE_URL}/api/review` with body `{ code, language }` |
| **Backend Route** | `src/routes/reviewRoute.ts` | Validates `code` and `language` fields, constructs a prompt asking Gemini to act as a senior code reviewer |
| **AI Prompt** | Constructed in `reviewRoute.ts` | *"You are a senior code reviewer reviewing ${language} code. Review the following code for: bugs and logic errors, style issues and readability concerns, security vulnerabilities, performance problems. Respond ONLY with a strict JSON object..."* |
| **Expected Response** | `{ results: Array<{ severity, line, title, description }> }` | Each result has severity (`error` / `warning` / `info`), a line number, a short title, and a detailed description |
| **UI Display** | `ReviewModePanel.tsx` | Each comment rendered as a card with colored severity badge (red/orange/blue), line number, title, and description. Count shown as "Results (N)". |

**Prompt system instruction:** *"You are a meticulous senior software engineer performing a code review. Always respond with valid JSON only."*

**Note on mapping:** The frontend `reviewApi.ts` maps the backend `BackendReviewResult` to the frontend `ReviewComment` type by adding a generated `id` field (`${index}-${line}-${title}`).

---

### 5C. Memory Mode (Code Work Memory)

Memory Mode is a **two-step flow**:

#### Step 1: Summarize

| Layer | File | What Happens |
|---|---|---|
| **Trigger** | `memoryApi.ts` → `queryMemory()` | On every question, the first step is to re-summarize the current code |
| **API Call** | `memoryApi.ts` | `POST` to `${API_BASE_URL}/api/memory/summarize` with body `{ code, fileName: 'current-file', language }` |
| **Backend Route** | `memoryRoute.ts` → `/summarize` | Validates inputs, calls Gemini to break code into logical chunks |
| **AI Prompt** | Constructed in `memoryRoute.ts` | *"You are an expert ${language} developer. Analyse the following code and break it into logical chunks (functions, classes, or significant blocks). For each chunk, provide its name, the start/end line numbers, and a one-sentence summary of its purpose."* |
| **Expected Response** | `{ chunks: Array<{ name, startLine, endLine, summary }> }` | List of code chunks with positions and summaries |
| **Storage** | `memoryStore.ts` → `setSummaries(fileName, chunks)` | Stored in a `Map<string, FileSummaryRecord>` keyed by fileName. The frontend always uses `'current-file'` as the key. |

#### Step 2: Ask

| Layer | File | What Happens |
|---|---|---|
| **Trigger** | `MemoryModePanel.tsx` | User types a question in chat textarea, presses Enter or clicks send → calls `queryMemory(question, code, language)` |
| **API Call** | `memoryApi.ts` | After summarize completes, `POST` to `${API_BASE_URL}/api/memory/ask` with body `{ fileName: 'current-file', question }` |
| **Backend Route** | `memoryRoute.ts` → `/ask` | Retrieves stored summaries from `memoryStore.ts`, constructs a prompt that includes the summaries as context |
| **AI Prompt** | Constructed in `memoryRoute.ts` | *"You are a code-memory assistant. You have the following pre-computed chunk summaries for the file "${fileName}": [summaries JSON]. Answer the user's question using ONLY the information in these summaries. If the answer cannot be determined from the summaries alone, say so."* |
| **Expected Response** | `{ answer: string }` | AI's answer based on the summaries |
| **UI Display** | `MemoryModePanel.tsx` | Chat-style interface: user messages in blue bubbles (right-aligned), AI responses in gray bubbles (left-aligned) with an AI icon. Loading animation with bouncing dots. Error message displayed in red. |

**Prompt system instruction (summarize):** *"You are an expert code analyst. Always respond with valid JSON only."*

**Prompt system instruction (ask):** *"You are a helpful code-memory assistant. Always respond with valid JSON only."*

**Important caveat:** The `memoryApi.ts` re-summarizes the code on **every question** — even if nothing changed. This is intentional to ensure the summaries reflect the latest editor content, but it means every question costs 2 AI API calls (summarize + ask).

---

## 6. THE MULTI-LANGUAGE WORKSPACE SYSTEM

### File Explorer / Sidebar

The sidebar (`Sidebar.tsx`) manages a list of `FileItem` objects stored in React Context (`EditorContext.tsx`):

```typescript
interface FileItem {
  name: string       // e.g. "index.ts", "styles.css"
  language: string   // e.g. "typescript", "css"
  content: string    // the full source code
}
```

**Initial state:** The app starts with 6 demo files: `index.ts`, `app.tsx`, `styles.css`, `main.py`, `utils.js`, `config.json`.

**Switching files:** Clicking a file name calls `openFile(fileName)`, which finds the file in the array and sets `activeFileName`, `code`, and `language` in context. Edits are preserved because `setCode()` also writes back into the files array.

### "+ New File" Flow

1. User clicks the **"+"** icon next to "Workspace" heading
2. A form opens inline with:
   - A text input for the file name (e.g. `solution.ts`)
   - A language dropdown (defaults to C++)
   - Create / Cancel buttons
3. As the user types a file name with an extension, the language is **auto-detected** via `detectLanguageFromFileName()`:

```typescript
function detectLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return extensionToLanguage[ext] ?? 'plaintext'
}
```

4. If detection succeeds, the language dropdown auto-updates to match
5. On "Create", the file is added via `addFile()` with a template comment: `// ${fileName}\n// Start writing your ${newFileLanguage} code here`
6. Duplicate file names are rejected with an error message

### Language Auto-Detection

There is **no separate `detectLanguage.ts` file** — the detection is entirely in `Sidebar.tsx` using a static lookup table (`extensionToLanguage`). This is a **rule-based approach** (not statistical/AI-based) for the following reasons:

**Why rule-based:**
- **Instant** — no AI round-trip needed
- **Deterministic** — `.ts` will always map to `typescript`, no ambiguity
- **Zero cost** — no API calls consumed
- **Sufficient** — file extension is a highly reliable signal for language

**Supported extension mappings (17 mappings):**

| Extension | Language |
|-----------|----------|
| `ts` | typescript |
| `tsx` | typescript |
| `js` | javascript |
| `jsx` | javascript |
| `py` | python |
| `css` | css |
| `html` | html |
| `htm` | html |
| `json` | json |
| `cpp`, `cc`, `cxx` | cpp |
| `c` | c |
| `h`, `hpp` | c / cpp |
| `java` | java |
| `go` | go |
| `rs` | rust |
| `php` | php |
| `cs` | csharp |
| `rb` | ruby |
| `md` | markdown |

---

## 7. API REFERENCE

All routes are served by the Express backend. Default port: **3001**.

| Method | Path | Request Body | Response Body | Description |
|---|---|---|---|---|
| `GET` | `/health` | — | `{ status: "ok", uptime: <number> }` | Health check |
| `POST` | `/api/review` | `{ code: string, language: string }` | `{ results: [ { severity: "error"\|"warning"\|"info", line: number, title: string, description: string } ] }` | Run AI code review |
| `POST` | `/api/intent` | `{ code: string, language: string, instruction: string }` | `{ before: string, after: string, explanation: string }` | Rewrite code by natural-language instruction |
| `POST` | `/api/memory/summarize` | `{ code: string, fileName: string, language: string }` | `{ chunks: [ { name: string, startLine: number, endLine: number, summary: string } ] }` | Break code into summarized chunks |
| `POST` | `/api/memory/ask` | `{ fileName: string, question: string }` | `{ answer: string }` | Ask a question about previously summarized code |

**Error responses** (all endpoints): `{ error: string, details?: string }` — returned with status 400 (validation) or 500 (server/AI error).

---

## 8. ENVIRONMENT VARIABLES & SETUP

### Required Environment Variables

| Variable | Where Used | Description |
|---|---|---|
| `GEMINI_API_KEY` | `backend/src/services/claudeService.ts` | Google Gemini API key. Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `PORT` (optional) | `backend/src/index.ts` | Backend port. Defaults to `3001` |

**Note:** The frontend's `api/config.ts` has `API_BASE_URL = 'http://localhost:5000'`. This is a **mismatch** with the backend's default port of 3001. You must either:
- Set `PORT=5000` in the backend `.env`, OR
- Change `API_BASE_URL` in `frontend/src/api/config.ts` to `'http://localhost:3001'`

### Setup & Run Commands

#### Backend

```bash
cd ai-code-editor-backend
npm install

# Create .env file with your API key
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
# Optionally set the port:
echo "PORT=5000" >> .env

# Development (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Frontend

```bash
cd ai-code-editor-frontend
npm install

# Development server (default port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint with Oxlint
npm run lint
```

---

## 9. KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

### Current Limitations (from real code)

1. **In-memory storage resets on server restart** — `memoryStore.ts` uses a `Map<string, ...>` with no persistence layer. Every time the backend restarts, all stored code summaries are lost. The file itself has a comment warning about this.

2. **Single fixed file key for memory mode** — `memoryApi.ts` uses a hardcoded `CURRENT_FILE_KEY = 'current-file'` instead of the actual active file name. The code has a TODO comment: *"replace with the real active file name once multi-file tracking exists"*.

3. **Free-tier API rate limits** — Gemini free tier has rate limits (typically 60 requests per minute). Each Memory Mode question costs 2 API calls (summarize + ask), which can hit limits quickly during heavy use.

4. **Frontend API URL mismatch** — `api/config.ts` points to `http://localhost:5000` but the backend defaults to port 3001. This causes a silent CORS/fetch failure until the user configures one side or the other.

5. **No authentication** — The backend has no auth middleware. Any process on the user's machine can send requests to the API endpoint.

6. **No database** — There's no SQLite, PostgreSQL, or any database. File content is stored only in React state (lost on page refresh) and code summaries are stored only in an in-memory Map (lost on server restart).

7. **`explanation` field not displayed** — The Intent Mode API returns an `explanation` string, but the frontend `DiffContent` type only includes `before` and `after`, so the explanation is never shown to the user.

8. **axios and lucide-react are unused** — Both are listed in `package.json` dependencies, but the app uses native `fetch()` for HTTP and inline SVGs for icons.

### Suggested Improvements (Realistic Next Steps)

1. **Replace in-memory store with a lightweight database** — Add SQLite (via `better-sqlite3`) or LevelDB to persist code summaries across restarts. This would make Memory Mode actually useful across sessions.

2. **Fix the frontend/backend port mismatch** — Align `API_BASE_URL` in `config.ts` with the backend's actual default port (3001), or update the backend to default to 5000. Add a `.env.example` file documenting this.

3. **Add proper file tracking for memory mode** — Replace the hardcoded `'current-file'` key with the actual `activeFileName` from context. This would let users ask questions about different files independently.

4. **Implement streaming responses** — The Gemini API supports streaming (Server-Sent Events). Streaming the AI response to the chat UI would feel much faster and more interactive, especially for long code rewrites.

5. **Add basic error handling for API key validation** — The backend should validate that `GEMINI_API_KEY` is set at startup and return a clear error message if it's missing, rather than failing on the first API call.

---

## 10. HOW TO EXPLAIN THIS PROJECT IN AN INTERVIEW

### 60-90 Second Spoken Summary

> "AI Code Editor is a full-stack web application that integrates a Monaco code editor with Google Gemini's free-tier API to provide AI-assisted code editing. It has three modes. First, **Intent Mode** — you type something like 'add error handling to this function', and it rewrites the code showing a before-and-after diff. Second, **Review Mode** — it sends your code to Gemini for a structured code review and returns a list of issues with severity levels and line numbers. Third, **Memory Mode** — it breaks your code into logical chunks, summarizes each chunk, and then lets you ask questions about the code in a chat interface. The frontend is React 19 with Tailwind CSS, the backend is Express 5 with TypeScript, and the AI layer uses Google Gemini's free API with a temperature of 0.3 for deterministic outputs. It was originally scaffolded for Anthropic Claude but was swapped to Gemini for the free tier. Current limitations include in-memory storage that resets on restart and a frontend-backend port mismatch that needs manual configuration."

### 5 Likely Interview Questions & Answers

**Q1: Why did you choose this architecture (React + Express + AI API)?**

> "We chose a classic three-tier architecture because it's simple to understand and debug. React handles the UI with Monaco for editing, Express provides a lightweight REST API, and the AI service is isolated behind a single service file so we can swap providers. We keep prompts on the server side so the AI key stays secure and we can control API costs centrally. The architecture is deliberately simple — no message queues, no database yet — because this is a prototype focused on demonstrating the AI interaction patterns, not scale."

**Q2: How does the Memory feature actually work under the hood?**

> "Memory Mode is a two-step process. First, the backend sends the user's code to Gemini with a prompt asking it to identify logical chunks like functions and classes, including their line numbers and purpose. Those chunk summaries are stored server-side in an in-memory Map keyed by filename. Second, when the user asks a question, the backend retrieves those summaries and sends them as context to Gemini with a prompt that says 'answer using ONLY this information.' This is a form of Retrieval-Augmented Generation — we summarize once and reuse those summaries for multiple questions, which saves tokens. Currently we re-summarize on every question, which is redundant, but ensures the summaries are always fresh."

**Q3: What would you do differently if this project needed to scale to hundreds of users?**

> "Several things. First, the in-memory Map would need to become a real database — probably PostgreSQL for structured data and a vector database like pgvector for semantic search. Second, we'd add user authentication with JWT so users have isolated workspaces. Third, we'd implement rate limiting per user to prevent API cost overruns. Fourth, we'd switch from request-response to streaming responses using Server-Sent Events for a smoother UX. Fifth, we'd add caching at multiple levels — cache code review results for unchanged code, cache common AI responses, and use Redis for session state. We'd also need to handle API failure more gracefully with retry logic and fallback models."

**Q4: Can you walk through the request flow from clicking 'Run Review' to seeing results?**

> "Sure. The user clicks 'Run Review' in `ReviewModePanel.tsx`. This calls `runReviewMode(code, language)` in the frontend's `reviewApi.ts`, which sends a POST request to `/api/review` on the Express backend. The backend's `reviewRoute.ts` validates the input, then calls `callClaudeAndParseJSON()` in `claudeService.ts`. Despite the name, this service wraps Google Gemini — it constructs a JSON payload with the code and a prompt asking Gemini to act as a senior code reviewer. The response is a JSON object with a `results` array of issues. The backend validates that `results` is an array and sends it back. The frontend maps each result to add an `id` field, then renders each one as a card with a colored severity badge, line number, title, and description."

**Q5: Why is the service file called `claudeService.ts` if it calls Gemini?**

> "That's a deliberate naming choice. The file was originally written against Anthropic's Claude SDK, but we swapped the implementation to Google Gemini because of the free tier — zero cost for development and prototyping. We kept the filename unchanged so that every import across the codebase (in `intentRoute.ts`, `reviewRoute.ts`, `memoryRoute.ts`) didn't need to be updated. The function signature `callClaudeAndParseJSON<T>()` also stayed the same, making it a drop-in replacement. If we ever want to switch back to Claude or add multi-model support, we only need to change one file and the rest of the app is unaffected. It's an example of the Strategy pattern in practice."

