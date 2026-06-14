// Load environment variables FIRST, before any other imports.
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createApp } from "./app.js";

const PORT = process.env.PORT || 3001;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY is not configured.");
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "Create server/.env.local from server/.env.example for local development.",
    );
  }
  process.exit(1);
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`AYSF Game Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `   API Key configured: ${process.env.ANTHROPIC_API_KEY ? "Yes" : "No"}`,
  );
  console.log(
    `   Serving frontend build: ${app.locals.hasBuiltFrontend ? "Yes" : "No"}`,
  );
  console.log("   Request logging: page + api requests + gameplay events");
  console.log(`\n   Try: http://localhost:${PORT}/api/health\n`);
});
