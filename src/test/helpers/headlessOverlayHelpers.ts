import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { afterEach, vi } from "vitest";
import * as gameInit from "../../game/gameInit";
import { createHeadlessSession } from "../../game/harness/session";
import type { Observation, SessionController, TranscriptEntry } from "../../game/harness/types";
import { updateItemLocation } from "../../game/rules/items";
import type { GameState } from "../../game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "../../world/World";
import { createTestState } from "./gameTestHelpers";

const controllers: SessionController[] = [];
const directories: string[] = [];
export const observationText = (observation: Observation) => observation.text.join("\n\n");

/** Placement is trusted test setup; opening/controls still run production rules. */
export function overlayFixture(itemIds: string[]): GameState {
  let state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  for (const id of itemIds) state = updateItemLocation(state, id, "StairWellSeven");
  return {
    ...state,
    world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } },
  };
}

export function overlaySession(initial: GameState) {
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial);
  const directory = resolve(".headless-transcripts", `terminal-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return controller;
}

export async function overlayHistory(controller: SessionController): Promise<TranscriptEntry[]> {
  return (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
}

afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});
