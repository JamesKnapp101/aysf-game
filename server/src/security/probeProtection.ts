import type { RequestHandler } from "express";
import {
  getClientIp,
  getUserAgent,
  sanitizeLogValue,
} from "../utils/requestMeta.js";

const SUSPICIOUS_PATH_PATTERNS: RegExp[] = [
  /(?:^|\/)\.env(?:$|[./_-])/i,
  /(?:^|\/)\.git(?:$|\/)/i,
  /(?:^|\/)\.aws(?:$|\/)/i,
  /(?:^|\/)aws\.env$/i,
  /(?:^|\/)(?:config|credentials|secrets?|service-account|gcp-credentials|firebase|key|keyfile)\.json$/i,
  /(?:^|\/)firebase-adminsdk[^/]*\.json$/i,
  /(?:^|\/)xmlrpc\.php$/i,
  /(?:^|\/)wp-(?:admin|content|includes)(?:\/|$)/i,
  /(?:^|\/)wlwmanifest\.xml$/i,
  /^\/api\/(?:env|config)\/?$/i,
];

function stripQuery(pathname: string): string {
  return pathname.split("?")[0] ?? pathname;
}

function decodePathCandidates(pathname: string): string[] {
  const candidates = new Set([pathname]);
  let current = pathname;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;

      candidates.add(decoded);
      current = decoded;
    } catch {
      break;
    }
  }

  return Array.from(candidates);
}

function normalizePathForProbeCheck(pathname: string): string {
  const normalized = stripQuery(pathname).replace(/\\/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function isSecurityProbePath(pathname: string): boolean {
  return decodePathCandidates(pathname).some((candidate) => {
    const normalized = normalizePathForProbeCheck(candidate);
    return SUSPICIOUS_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
  });
}

export const blockSecurityProbes: RequestHandler = (req, res, next) => {
  const pathForCheck = req.originalUrl || req.url || req.path;

  if (!isSecurityProbePath(pathForCheck)) {
    next();
    return;
  }

  const safePath = sanitizeLogValue(stripQuery(req.path || pathForCheck), 180);
  const clientIp = getClientIp(req);
  const userAgent = getUserAgent(req);

  console.warn(`[PROBE] path=${safePath} ip=${clientIp} ua="${userAgent}"`);
  res.status(404).json({ error: "Not found" });
};
