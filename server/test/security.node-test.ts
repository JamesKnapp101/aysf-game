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

function validConversationBody(topic = "reactor") {
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
      type: "ask",
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
      "/wp-includes/wlwmanifest.xml",
    ];

    for (const probePath of probePaths) {
      const response = await fetch(`${baseUrl}${probePath}`);
      assert.equal(response.status, 404, probePath);
      assert.match(await response.text(), /Not found/);
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
