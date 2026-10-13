import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { createHeadlessSession } from "../game/harness/session";
import { runHeadlessAgent } from "../game/harness/agent";
import type { Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { updateItemLocation } from "../game/rules/items";
import { getCurrentMemory, getCurrentScore } from "../game/selectors/scoreSelectors";
import { useUIEffectsStore } from "../game/store/store";
import { splitMemory } from "../game/text/memorySequence";
import type { GameState } from "../game/types/gameTypes";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { createTestState, setInventory } from "./helpers/gameTestHelpers";

const execute = engine.handleCommand;
const controllers: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");
function fixture(): GameState {
  let state = setInventory(createTestState({ roomId: "StairWellSeven", rng: () => 0 }), ["MindGun", "MindCap"]);
  state = updateItemLocation(state, "cat", "StairWellSeven");
  return {
    ...state, world: { ...state.world, meta: { ...state.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } },
    itemState: { ...state.itemState, attachedTo: { ...state.itemState.attachedTo, cat: "PLAYER" }, wornByPlayer: { ...state.itemState.wornByPlayer, head: "MindCap" } },
  };
}
function session(initial: GameState = fixture()) {
  vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial);
  const directory = resolve(".headless-transcripts", `memory-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return controller;
}
async function history(controller: SessionController): Promise<TranscriptEntry[]> {
  return (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
}
afterEach(async () => {
  vi.useRealTimers();
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("automatic headless memory sequences", () => {
  it("supplies the full sequence as one autonomous tool result and resumes exploration", async () => {
    const initial = fixture();
    const selected = initial.world.items.find(item => item.id === "cat")!.meta!.memories[0] as string;
    const controller = session(initial);
    let turn = 0;
    const requests: MessageCreateParamsNonStreaming[] = [];
    const client = { messages: {
      countTokens: async () => ({ input_tokens: 100 }),
      create: async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const command = turn++ === 0 ? "shoot cat with scanner" : "wait";
        return {
          content: [{ type: "tool_use", id: `tool_${turn}`, name: "game_command", input: { command } }],
          stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      },
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: 2 } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(2);
    expect(run.events.map(event => event.request)).toEqual(["shoot cat with scanner", "wait"]);
    for (const fragment of splitMemory(selected)) {
      expect(run.events[0].text).toContain(fragment);
      expect(JSON.stringify(requests[1].messages[2].content)).toContain(fragment);
      expect(JSON.stringify(requests[0].messages)).not.toContain(fragment);
    }
    expect((await history(controller))[1].observation.text).toEqual(run.events[0].text);
    expect(run.events[1].text.join("\n")).toContain("Moves: 2");
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
  });

  it("presents only the cat's selected memory in React fragment order and restores the room", async () => {
    const initial = fixture();
    const memories = initial.world.items.find(item => item.id === "cat")!.meta!.memories as string[];
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const before = getCurrentMemory(initial);
    const response = await controller.explorer.command("shoot cat with scanner");
    const fragments = splitMemory(memories[0]);
    expect(response.text.slice(1, 1 + fragments.length)).toEqual(fragments);
    expect(response.text[0]).toContain("Link established...");
    expect(response.text.at(-1)).toContain("Bottom of Stairwell");
    expect(response.text.at(-1)).toContain("Moves: 1");
    expect(text(response)).not.toContain("needs a headless gameplay adapter");
    for (const later of memories.slice(1)) for (const fragment of splitMemory(later)) expect(response.text).not.toContain(fragment);
    const after = await spy.mock.results[0].value;
    expect(after.itemState.mindGunMemoryIndex.cat).toBe(1);
    expect(getCurrentMemory(after)).toBe(before);
    expect(getCurrentScore(after)).toBe(getCurrentScore(initial));
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    await controller.explorer.command("look");
    expect(spy.mock.calls[1][0]).toEqual(after);
    const records = await history(controller);
    expect(records[1].observation.text).toEqual(response.text);
    expect(records.filter(record => record.input === "shoot cat with scanner")).toHaveLength(1);
    expect(JSON.stringify(records)).not.toMatch(/mindGunMemoryIndex|memoriesTriggered|MindGun|StairWellSeven|seed/);
  });

  it("does not require timer advancement and gates queued input through completion exactly once", async () => {
    const controller = session();
    await controller.start();
    vi.useFakeTimers();
    const ended = vi.fn();
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    let entered!: () => void;
    const entry = new Promise<void>(resolve => { entered = resolve; });
    const spy = vi.spyOn(engine, "handleCommand").mockImplementationOnce(async (...args) => {
      const result = await execute(...args);
      const payload = useUIEffectsStore.getState().mindFlash!;
      useUIEffectsStore.setState({ mindFlash: { ...payload, onEnd: ended } });
      entered();
      await barrier;
      return result;
    });
    const shot = controller.explorer.command("shoot cat with scanner");
    const queued = controller.explorer.command("wait");
    await entry;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();
    release();
    expect(text(await shot)).toContain("Moves: 1");
    expect(text(await queued)).toContain("Moves: 2");
    expect(ended).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    await controller.dispose();
    expect(ended).toHaveBeenCalledTimes(1);
  });

  it("requires the cap and preserves successive-shot prerequisites and exhausted-memory behavior", async () => {
    const initial = fixture();
    const memories = initial.world.items.find(item => item.id === "cat")!.meta!.memories as string[];
    initial.itemState.wornByPlayer.head = undefined;
    // Keep the normally wandering cat in this trusted placement fixture while
    // testing scanner prerequisites across more than its five held turns.
    initial.world = { ...initial.world, items: initial.world.items.map(item => item.id === "cat" ? {
      ...item, meta: { ...item.meta, homeRegion: ["StairWellSeven"] },
    } : item) };
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const rejected = text(await controller.explorer.command("shoot cat with scanner"));
    expect(rejected).not.toContain(memories[0]);
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    expect((await spy.mock.results[0].value).itemState.mindGunMemoryIndex.cat).toBe(0);
    await controller.explorer.command("wear cap");
    for (const memory of memories) {
      const response = await controller.explorer.command("shoot cat with scanner");
      const expected = splitMemory(memory);
      const first = response.text.indexOf(expected[0]);
      expect(first).toBeGreaterThan(0);
      expect(response.text.slice(first, first + expected.length)).toEqual(expected);
    }
    const exhausted = await controller.explorer.command("shoot cat with scanner");
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    expect(text(exhausted)).not.toContain("needs a headless gameplay adapter");
    for (const memory of memories) for (const fragment of splitMemory(memory)) expect(exhausted.text).not.toContain(fragment);
  });

  it("works for other living targets and does not invent a sequence for empty archives", async () => {
    const initial = fixture();
    initial.world.items = [...initial.world.items, {
      id: "MemoryTestAnimal", name: "test animal", description: "A test animal.", vocab: ["test animal"],
      location: "StairWellSeven", itemCategory: "animate", itemClass: "solid", itemWeight: 1, itemSize: 1,
      meta: { isAlive: true, memories: ["A different first fragment. A different second fragment.", "Unrevealed later memory."] },
    }];
    initial.itemState.itemRoomId.MemoryTestAnimal = "StairWellSeven";
    initial.itemState.mindGunMemoryIndex.MemoryTestAnimal = 0;
    const controller = session(initial);
    await controller.start();
    const response = await controller.explorer.command("shoot test animal with scanner");
    expect(response.text.slice(1, 3)).toEqual(["A different first fragment.", "A different second fragment."]);
    expect(text(response)).not.toContain("Unrevealed later memory");
    initial.world.items.find(item => item.id === "MemoryTestAnimal")!.meta!.memories = [];
    const empty = await controller.explorer.command("shoot test animal with scanner");
    expect(text(empty)).not.toContain("needs a headless gameplay adapter");
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
  });

  it("resets memory acquisition without replaying prior fragments", async () => {
    const initial = fixture();
    const memory = initial.world.items.find(item => item.id === "cat")!.meta!.memories[0] as string;
    const controller = session(initial);
    await controller.start();
    await controller.explorer.command("shoot cat with scanner");
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(initial);
    const reset = text(await controller.reset());
    for (const fragment of splitMemory(memory)) expect(reset).not.toContain(fragment);
    const again = await controller.explorer.command("shoot cat with scanner");
    expect(again.text.slice(1, 1 + splitMemory(memory).length)).toEqual(splitMemory(memory));
    expect(text(again)).toContain("Moves: 1");
  });
});

describe("interactive corpse memory compatibility", () => {
  const targets = createTestState().world.items.filter(item => item.meta?.corpse?.memoryExperienceId);
  it.each(targets)("preserves turn-driven stages for $name", async target => {
    const initial = updateItemLocation(fixture(), target.id, "StairWellSeven");
    const controller = session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const response = await controller.explorer.command(`shoot ${target.name} with scanner`);
    const linked = await spy.mock.results[0].value;
    expect(linked.worldState.activeExperience?.experienceId).toBe(target.meta!.corpse.memoryExperienceId);
    expect(linked.moves).toBe(1);
    expect(text(response)).not.toContain("needs a headless gameplay adapter");
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    let after = linked;
    for (let turn = 0; turn < 20 && after.worldState.activeExperience; turn += 1) {
      await controller.explorer.command("wait");
      after = await spy.mock.results.at(-1)!.value;
    }
    expect(after.worldState.activeExperience).toBeUndefined();
    expect(after.player.roomId).toBe("StairWellSeven");
    expect(after.moves).toBeGreaterThan(1);
    expect((await history(controller)).at(-1)!.observation.text.join("\n")).toContain("Bottom of Stairwell");
  });
});
