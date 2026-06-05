import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import {
  createConversationRouter,
  type GenerateConversationResponse,
} from "./routes/conversation.js";
import gameplayRouter from "./routes/gameplay.js";
import { blockSecurityProbes } from "./security/probeProtection.js";
import {
  getClientIp,
  getUserAgent,
  sanitizeLogValue,
  summarizeErrorForLog,
} from "./utils/requestMeta.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateAppOptions {
  frontendDistDir?: string;
  generateConversationResponse?: GenerateConversationResponse;
  isProduction?: boolean;
}

function getDefaultFrontendDistDir(): string {
  return path.resolve(__dirname, "../../dist");
}

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
    return `${sanitizeLogValue(value, 32)}b`;
  }

  return "?";
}

export function createApp(options: CreateAppOptions = {}): express.Express {
  const isProduction =
    options.isProduction ?? process.env.NODE_ENV === "production";
  const frontendDistDir = options.frontendDistDir ?? getDefaultFrontendDistDir();
  const frontendIndexPath = path.join(frontendDistDir, "index.html");
  const hasBuiltFrontend = existsSync(frontendIndexPath);
  let nextRequestId = 1;

  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.locals.hasBuiltFrontend = hasBuiltFrontend;

  app.use(
    helmet({
      contentSecurityPolicy: isProduction,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(blockSecurityProbes);

  if (!isProduction) {
    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      }),
    );
  }

  app.use(express.json({ limit: "64kb" }));

  app.use((req, res, next) => {
    const requestId = String(nextRequestId++).padStart(6, "0");
    const startedAtNs = process.hrtime.bigint();
    const safePath = sanitizeLogValue(req.path, 180);
    const clientIp = getClientIp(req);
    const userAgent = getUserAgent(req);
    const requestKind = classifyRequestPath(req.path);
    const shouldLogRequest = requestKind !== "asset";

    res.locals.requestId = requestId;
    res.locals.clientIp = clientIp;
    res.setHeader("x-request-id", requestId);

    if (shouldLogRequest) {
      console.log(
        `[REQ ${requestId}] ${requestKind.toUpperCase()} ${req.method} ${safePath} ip=${clientIp} ua="${userAgent}"`,
      );
    }

    res.on("finish", () => {
      if (!shouldLogRequest) return;

      console.log(
        `[RES ${requestId}] ${requestKind.toUpperCase()} ${req.method} ${safePath} status=${res.statusCode} duration=${formatDurationMs(startedAtNs)} bytes=${formatBytes(
          res.getHeader("content-length"),
        )} ip=${clientIp}`,
      );
    });

    next();
  });

  app.use(
    "/api/conversation",
    createConversationRouter({
      generateResponse: options.generateConversationResponse,
    }),
  );
  app.use("/api/gameplay", gameplayRouter);

  app.get("/api/health", (req, res) => {
    void req;
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

    app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
      if (path.extname(req.path)) {
        next();
        return;
      }

      res.sendFile(frontendIndexPath);
    });
  }

  app.use((req, res) => {
    res.status(404).json({
      error: "Not found",
      path: req.path,
    });
  });

  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      void req;
      void next;
      console.error(`Server error: ${summarizeErrorForLog(err)}`);
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    },
  );

  return app;
}
