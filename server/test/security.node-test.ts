import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/app.js";
import type { GenerateConversationResponse } from "../src/routes/conversation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendFixtureDir = path.join(__dirname, "fixtures", "frontend");

function validConversationBody(topic = "reactor", type: "ask" | "tell" = "ask") {
  return {
    characterProfile: {
      directives: ["Stay brief."],
      goals: ["Help the player without breaking character."],
      identity: "A test NPC.",
      knownFacts: ["The reactor exists."],
      name: "Test NPC",
      scene: "A quiet test room.",
      unknownFacts: ["The exact ending."],
      voice: ["plain"],
    },
    conversationHistory: [],
    npcId: "test_npc",
    playerInput: {
      topic,
      type,
    },
  };
}

async function withServer(
  generateConversationResponse: GenerateConversationResponse,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const app = createApp({
    frontendDistDir: frontendFixtureDir,
    generateConversationResponse,
    isProduction: false,
  });
  const server = app.listen(0);

  try {
    const address = server.address() as AddressInfo;
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

test("known secret and probe paths return 404 before SPA fallback", async () => {
  await withServer(async () => "unused", async (baseUrl) => {
    const probePaths = [
      "/.env",
      "/.git/config",
      "/credentials.json",
      "/root/.boto",
      "/root/.git-credentials",
      "/root/.gitconfig",
      "/root/.netrc",
      "/root/.s3cfg",
      "/rest/users",
      "/rest/workflows",
      "/s3/credentials",
      "/symfony/_profiler/phpinfo",
      "/webhook",
      "/wp-json/wp/v2/users",
      "/wp-includes/wlwmanifest.xml",
    ];

    for (const probePath of probePaths) {
      const response = await fetch(`${baseUrl}${probePath}`);
      assert.equal(response.status, 404, probePath);
      assert.match(await response.text(), /Not found/);
    }
  });
});

test("unknown extensionless page paths return 404 instead of the SPA shell", async () => {
  await withServer(async () => "unused", async (baseUrl) => {
    const unknownPagePaths = ["/feed/", "/products", "/projects/*", "/test"];

    for (const pagePath of unknownPagePaths) {
      const response = await fetch(`${baseUrl}${pagePath}`);
      assert.equal(response.status, 404, pagePath);
      assert.doesNotMatch(await response.text(), /AYSF test frontend/);
    }
  });
});

test("frontend root and real API endpoints still work", async () => {
  await withServer(async () => "unused", async (baseUrl) => {
    const rootResponse = await fetch(`${baseUrl}/`);
    assert.equal(rootResponse.status, 200);
    assert.match(await rootResponse.text(), /AYSF test frontend/);

    const healthResponse = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthResponse.status, 200);
    assert.equal((await healthResponse.json()).service, "aysf-game-server");

    const gameplayHealthResponse = await fetch(`${baseUrl}/api/gameplay/health`);
    assert.equal(gameplayHealthResponse.status, 200);
    assert.equal((await gameplayHealthResponse.json()).service, "gameplay-events");
  });
});

test("probe logs prefer validated visitor IP headers", async () => {
  const originalWarn = console.warn;
  const warnLines: string[] = [];

  console.warn = (...args: unknown[]) => {
    warnLines.push(args.map(String).join(" "));
  };

  try {
    await withServer(async () => "unused", async (baseUrl) => {
      const cloudflareResponse = await fetch(`${baseUrl}/.env`, {
        headers: {
          "CF-Connecting-IP": "203.0.113.8",
          "User-Agent": "test scanner",
        },
      });
      assert.equal(cloudflareResponse.status, 404);

      const forwardedResponse = await fetch(`${baseUrl}/.git/config`, {
        headers: {
          "User-Agent": "test scanner",
          "X-Forwarded-For": "198.51.100.44, 104.22.24.197",
        },
      });
      assert.equal(forwardedResponse.status, 404);
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.match(warnLines.join("\n"), /ip=203\.0\.113\.8/);
  assert.match(warnLines.join("\n"), /ip=198\.51\.100\.44/);
});

test("conversation endpoint returns 429 after repeated valid requests", async () => {
  let providerCalls = 0;
  await withServer(
    async () => {
      providerCalls += 1;
      return "Test response.";
    },
    async (baseUrl) => {
      const statuses: number[] = [];

      for (let index = 0; index < 9; index += 1) {
        const response = await fetch(`${baseUrl}/api/conversation/ask`, {
          body: JSON.stringify(validConversationBody(`topic-${index}`)),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        statuses.push(response.status);
      }

      assert.deepEqual(statuses.slice(0, 8), Array(8).fill(200));
      assert.equal(statuses[8], 429);
      assert.equal(providerCalls, 8);
    },
  );
});

test("malformed conversation requests are rejected before the AI provider", async () => {
  let providerCalls = 0;
  await withServer(
    async () => {
      providerCalls += 1;
      return "Should not be called.";
    },
    async (baseUrl) => {
      const malformed = {
        ...validConversationBody("reactor"),
        extraField: "not allowed",
        playerInput: {
          topic: "x".repeat(501),
          type: "ask",
        },
      };

      const response = await fetch(`${baseUrl}/api/conversation/ask`, {
        body: JSON.stringify(malformed),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      assert.equal(response.status, 400);
      assert.equal(providerCalls, 0);
      assert.equal((await response.json()).fallback, true);
    },
  );
});

test("AI generate logs include sanitized ask and tell text", async () => {
  const originalLog = console.log;
  const logLines: string[] = [];

  console.log = (...args: unknown[]) => {
    logLines.push(args.map(String).join(" "));
  };

  try {
    await withServer(
      async () => "Test response.",
      async (baseUrl) => {
        for (const [type, topic] of [
          ["ask", 'where is the "reactor"\nnow?'],
          ["tell", "the reactor is humming"],
        ] as const) {
          const response = await fetch(`${baseUrl}/api/conversation/ask`, {
            body: JSON.stringify(validConversationBody(topic, type)),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });

          assert.equal(response.status, 200);
        }
      },
    );
  } finally {
    console.log = originalLog;
  }

  const generateLogs = logLines.filter((line) => line.includes("[AI GENERATE "));

  assert.equal(generateLogs.length, 2);
  assert.match(
    generateLogs[0],
    /ask="where is the 'reactor' now\?" chars=27/,
  );
  assert.match(generateLogs[1], /tell="the reactor is humming" chars=22/);
  assert.doesNotMatch(generateLogs[0], /topic=chars=/);
});
