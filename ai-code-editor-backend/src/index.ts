import "dotenv/config";
import express from "express";
import cors from "cors";

// ── Route imports ───────────────────────────────────────────────
import reviewRouter from "./routes/reviewRoute.js";
import intentRouter from "./routes/intentRoute.js";
import memoryRouter from "./routes/memoryRoute.js";

// ── App setup ───────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// ── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/review", reviewRouter);    // POST /apiAction
app.use("/api/intent", intentRouter);
app.use("/api/memory", memoryRouter);

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AI Code Editor backend running on http://localhost:${PORT}`);
});

export default app;

