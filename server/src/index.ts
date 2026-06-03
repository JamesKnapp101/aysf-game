// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import conversationRouter from "./routes/conversation.js";
import gameplayRouter from "./routes/gameplay.js";
import { getClientIp, getUserAgent } from "./utils/requestMeta.js";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistDir = path.resolve(__dirname, "../../dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");
const hasBuiltFrontend = existsSync(frontendIndexPath);
const isProduction = process.env.NODE_ENV === "production";
let nextRequestId = 1;

// Check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY not found in .env.local");
  console.error("Please create server/.env.local with your API key");
  process.exit(1);
}

app.disable("x-powered-by");
app.set("trust proxy", true);

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

function classifyRequestPath(pathname: string): "api" | "page" | "asset" {
  if (pathname.startsWith("/api/")) return "api";
  if (
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.png" ||
    /\.(?:css|js|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|txt)$/i.test(pathname)
  ) {
    return "asset";
  }

  return "page";
}

function formatDurationMs(startNs: bigint): string {
  const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
  return `${durationMs.toFixed(durationMs >= 100 ? 0 : 1)}ms`;
}

function formatBytes(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}b`;
  }

  if (typeof value === "string" && value.trim()) {
    return `${value}b`;
  }

  return "?";
}

// Logging middleware
app.use((req, res, next) => {
  const requestId = String(nextRequestId++).padStart(6, "0");
  const startedAtNs = process.hrtime.bigint();
  const pathWithQuery = req.originalUrl || req.url;
  const clientIp = getClientIp(req);
  const userAgent = getUserAgent(req);
  const requestKind = classifyRequestPath(req.path);
  const shouldLogRequest = requestKind !== "asset";

  res.locals.requestId = requestId;
  res.locals.clientIp = clientIp;
  res.setHeader("x-request-id", requestId);

  if (shouldLogRequest) {
    console.log(
      `[REQ ${requestId}] ${requestKind.toUpperCase()} ${req.method} ${pathWithQuery} ip=${clientIp} ua="${userAgent}"`,
    );
  }

  res.on("finish", () => {
    if (!shouldLogRequest) return;

    console.log(
      `[RES ${requestId}] ${requestKind.toUpperCase()} ${req.method} ${pathWithQuery} status=${res.statusCode} duration=${formatDurationMs(startedAtNs)} bytes=${formatBytes(
        res.getHeader("content-length"),
      )} ip=${clientIp}`,
    );
  });

  next();
});

// Routes
app.use("/api/conversation", conversationRouter);
app.use("/api/gameplay", gameplayRouter);

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
  console.log(`   Request logging: page + api requests + gameplay events`);
  console.log(`\n   Try: http://localhost:${PORT}/api/health\n`);
});
