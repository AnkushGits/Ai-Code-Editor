# Ai-Code-Editor
PROJECT OVERVIEW

**AI Code Editor** is a local web application that pairs a Monaco-based code editor (the same editor VS Code uses) with an AI backend powered by Google Gemini (free tier). It lets developers write code in the browser and then use natural language to review, rewrite, or ask questions about it — all without leaving the editor.

The project has **three core features**, each accessible from a top navbar:

### Core Features

| Feature | Button in Navbar | What It Actually Does |
|---|---|---|
| **Intent Mode** | `Intent Mode` | Takes a natural-language instruction (e.g. "optimize this function") and asks Gemini to rewrite the current editor code. Displays a before/after diff. |
| **Review Mode** | `Review Mode` | Sends the current editor code to Gemini for a structured code review. Returns a list of issues with severity, line number, title, and description. |
| **Code Work Memory** | `Memory Mode` | First breaks the current code into logical chunks and summarizes each (stored server-side in memory), then lets you ask questions about that code in a chat interface. Answers are based on the stored summaries, not the full code. |

---
