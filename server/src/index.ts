// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import conversationRouter from "./routes/conversation.js";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistDir = path.resolve(__dirname, "../../dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");
const hasBuiltFrontend = existsSync(frontendIndexPath);
const isProduction = process.env.NODE_ENV === "production";

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY not found in .env.local");
  console.error("Please create server/.env.local with your API key");
  process.exit(1);
}

app.disable("x-powered-by");

// Middleware
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5173", // Vite dev server
      credentials: true,
    }),
  );
}

app.use(express.json({ limit: "1mb" }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/conversation", conversationRouter);

// Root health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "aysf-game-server",
    timestamp: new Date().toISOString(),
  });
});

if (hasBuiltFrontend) {
  app.use(
    express.static(frontendDistDir, {
      index: false,
    }),
  );

  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    void next;
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`AYSF Game Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `   API Key configured: ${process.env.ANTHROPIC_API_KEY ? "Yes" : "No"}`,
  );
  console.log(`   Serving frontend build: ${hasBuiltFrontend ? "Yes" : "No"}`);
  console.log(`\n   Try: http://localhost:${PORT}/api/health\n`);
});
