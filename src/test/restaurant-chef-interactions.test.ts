import { describe, expect, it } from "vitest";
import { tickNpcIdleActions } from "@game/engine/ticks/npcIdleActionsTick";
import { createInitialState, mergeWorldChunkIntoState } from "@game/gameInit";
import { restoreResumeSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { updateItemLocation } from "@game/rules/items";
import { applyStatusEffectToPlayer, removeStatusEffectFromPlayer } from "@game/rules/status";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { INITIAL_WORLD, loadWorldChunk } from "src/world/World";
import {
  addInventoryItems, createTestState, getLastLogEntry, runCommand, runCommands,
} from "./helpers/gameTestHelpers";

const REFUSAL = `The chef's eyes, though dim, implore you.\n\n"Must you? I have so little..."`;
const ENTRY = `Something stirs in the freezer.\n\n"Hello?" a weak voice calls. "Who is there..?"`;
const INFECTED = [
  `"You...it's in you, too...I can feel it..."`,
  `"It's in you...I feel it...find a way to stop it...or end up...like me..."`,
];

function fixture(roomId = "WalkIn"): GameState {
  return addInventoryItems(createTestState({ roomId }), ["CarvingKnife"]);
}

function chef(state: GameState): Item {
  return state.world.items.find((item) => item.id === "DoomedChef")!;
}

function patchChef(state: GameState, patch: Partial<Item>): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((item) => item.id === "DoomedChef" ? { ...item, ...patch } : item),
    },
  };
}

function entryCount(state: GameState): number {
  return state.log.filter((entry) => entry.includes(ENTRY)).length;
}

// Exercise the real random selection for every slot, including the last one.
function selectedIdlePool(state: GameState, length: number): string[] {
  return Array.from({ length }, (_, index) => {
    const rolls = [0.99, 0, (index + 0.5) / length];
    return getLastLogEntry(tickNpcIdleActions({ ...state, rng: () => rolls.shift() ?? 0 }));
  });
}

describe("chef head-cutting refusal", () => {
  const phrases = [
    "cut head", "cut man's head", "cut chef's head", "cut off chef's head",
    "cut off man's head", "sever chef's head", "cut off head", "cut chef's head off",
    "sever the man's head", "slice off the chef's head", "carve off the head of the chef",
    "cut the head from the man", "cut the head off the chef", "cut chef’s head",
    "cut the doomed man's head", "decapitate chef", "sever Matthias's head",
  ];
  it.each(phrases.flatMap((phrase) => [phrase, `${phrase} with carving knife`, `${phrase} with the knife`]))(
    "refuses '%s' without changing the chef or creating any item", async (command) => {
      const initial = fixture();
      const next = await runCommand(initial, command);
      expect(getLastLogEntry(next).trim()).toBe(`> ${command}\n${REFUSAL}`);
      expect(chef(next)).toEqual(chef(initial));
      expect(chef(next).description).toContain("His head is intact");
      expect(next.world.items.map((item) => item.id)).toEqual(initial.world.items.map((item) => item.id));
      expect(next.player.inventory).toEqual(initial.player.inventory);
      expect(next.itemState.itemRoomId.DoomedChef).toBe(initial.itemState.itemRoomId.DoomedChef);
      expect(next.itemState.attachedTo).toEqual(initial.itemState.attachedTo);
      expect(next.worldState.chefSample).toBeUndefined();
    },
  );

  it("normalizes capitalization and spacing, and refuses even without a knife", async () => {
    const next = await runCommand(createTestState({ roomId: "WalkIn" }), "  CUT   OFF  THE CHEF'S HEAD WITH THE KNIFE  ");
    expect(next.log.join("\n")).toContain(REFUSAL);
    expect(next.worldState.chefSample).toBeUndefined();
  });

  it("keeps sampling repeatable after refusals and sample expiry", async () => {
    let state = await runCommands(fixture(), ["cut head", "cut chef with carving knife"]);
    expect(state.worldState.chefSample?.remainingWarmTurns).toBe(4);
    state = await runCommand(state, "cut off chef's head");
    expect(getLastLogEntry(state)).toContain(REFUSAL);
    expect(state.worldState.chefSample?.remainingWarmTurns).toBe(4);
    state = await runCommands(state, ["east", "wait", "wait", "wait"]);
    expect(state.worldState.chefSample).toBeUndefined();
    state = await runCommands(state, ["west", "cut off piece of chef with knife"]);
    expect(state.worldState.chefSample?.remainingWarmTurns).toBe(4);
    expect(state.player.inventory.general).toContain("ChefSample");
    expect(state.world.items.filter((item) => item.id === "ChefSample")).toHaveLength(1);
  });

  it("preserves unrelated cutting overrides, including another head in a different room", async () => {
    const initial = fixture("Kitchen");
    const state = {
      ...initial,
      world: { ...initial.world, items: [...initial.world.items, {
        id: "TestHead", name: "wooden head", vocab: ["head"], location: "Kitchen",
        description: "A wooden head.", itemCategory: "scenery" as const,
        itemClass: "solid" as const, itemWeight: 1, itemSize: 1,
        overrides: { cut: "You notch the wooden head." },
      }] },
    };
    expect(getLastLogEntry(await runCommand(state, "cut head"))).toContain("You notch the wooden head.");
    const elsewhere = await runCommand(initial, "cut chef's head");
    expect(elsewhere.log.join("\n")).not.toContain(REFUSAL);
    expect(elsewhere.worldState.chefSample).toBeUndefined();
  });
});

describe("chef WalkIn entry dialogue", () => {
  it("speaks on each entry, preserves the description, and stays quiet between entries", async () => {
    let state = fixture("Kitchen");
    const description = state.world.rooms.find((room) => room.id === "WalkIn")!.description;
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("WalkIn");
    expect(entryCount(state)).toBe(1);
    expect(state.log.join("\n")).toContain(description);
    state = await runCommands(state, ["wait", "look", "examine chef", "north"]);
    expect(entryCount(state)).toBe(1);
    state = await runCommands(state, ["east", "west"]);
    expect(entryCount(state)).toBe(2);
    expect(state.world.rooms.find((room) => room.id === "WalkIn")!.description).toBe(description);
  });

  it.each(["dead", "absent", "missing", "frozen"])("does not speak if the chef is %s", async (condition) => {
    let state = fixture("Kitchen");
    if (condition === "dead") state = patchChef(state, { meta: { ...chef(state).meta, isAlive: false } });
    if (condition === "absent") state = updateItemLocation(state, "DoomedChef", "Restaurant");
    if (condition === "missing") state = { ...state, world: { ...state.world, items: state.world.items.filter((item) => item.id !== "DoomedChef") } };
    if (condition === "frozen") state = { ...state, itemState: { ...state.itemState, frozenItems: { ...state.itemState.frozenItems, DoomedChef: true } } };
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("WalkIn");
    expect(entryCount(state)).toBe(0);
    expect(tickNpcIdleActions({ ...state, log: [], rng: () => 0.99 }).log).toEqual([]);
  });
});

describe("chef Syndrome X idle dialogue", () => {
  it("adds both responses only while infected, without altering the original pool or accumulating duplicates", () => {
    let state = fixture();
    const original = [...chef(state).idleActions!];
    expect(selectedIdlePool(state, original.length)).toEqual(original);
    for (let cycle = 0; cycle < 3; cycle++) {
      state = applyStatusEffectToPlayer(state, "syndrome x", 1, 2000);
      const expected = [...original, ...INFECTED];
      expect(selectedIdlePool(state, expected.length)).toEqual(expected);
      expect(chef(state).getIdleActions!(state, chef(state))).toEqual(expected);
      state = { ...state, player: { ...state.player, statusEffects: state.player.statusEffects.filter((effect) => effect.id !== "syndrome x") } };
      expect(selectedIdlePool(state, original.length)).toEqual(original);
      expect(chef(state).getIdleActions!(state, chef(state))).toEqual(original);
      expect(chef(state).idleActions).toEqual(original);
    }
  });

  it("uses normal idle timing and stops offering the dialogue after the removal turn", async () => {
    let state = applyStatusEffectToPlayer(fixture(), "syndrome x", 1, 2000);
    const missed = tickNpcIdleActions({ ...state, log: [], rng: () => 0 });
    expect(missed.log).toEqual([]);
    state = await runCommand({ ...state, rng: () => 0.99 }, "wait");
    expect(state.log.join("\n")).toContain(INFECTED[1]);
    state = removeStatusEffectFromPlayer(state, "syndrome x");
    state = await runCommand({ ...state, log: [] }, "wait");
    expect(state.player.statusEffects.some((effect) => effect.id === "syndrome x")).toBe(false);
    expect(state.log.join("\n")).not.toContain(INFECTED[0]);
    expect(state.log.join("\n")).not.toContain(INFECTED[1]);
  });
});

describe("chef interaction save compatibility", () => {
  async function savableFixture() {
    const state = mergeWorldChunkIntoState(createInitialState(INITIAL_WORLD), "level-three", await loadWorldChunk("level-three"));
    return { ...state, player: { ...state.player, roomId: "Kitchen" }, rng: () => 0 };
  }

  it("restores idle eligibility, refusal, repeatable entry and an active sample", async () => {
    let state = addInventoryItems(await savableFixture(), ["CarvingKnife"]);
    state = applyStatusEffectToPlayer(state, "syndrome x", 1, 2000);
    state = await runCommands(state, ["west", "cut sample from chef", "save"]);
    expect(entryCount(state)).toBe(1);
    state = await runCommands(state, ["east", "wait", "wait", "wait", "restore"]);
    expect(state.player.roomId).toBe("WalkIn");
    expect(state.worldState.chefSample?.remainingWarmTurns).toBe(4);
    expect(entryCount(state)).toBe(1);
    const original = chef(state).idleActions!;
    expect(selectedIdlePool(state, original.length + 2)).toEqual([...original, ...INFECTED]);
    state = await runCommand({ ...state, rng: () => 0 }, "cut off man's head with knife");
    expect(getLastLogEntry(state)).toContain(REFUSAL);
    state = await runCommands(state, ["east", "west"]);
    expect(entryCount(state)).toBe(2);
    expect(state.worldState.chefSample?.remainingWarmTurns).toBe(3);
  });

  it("resumes older snapshots with the original idle array and no effect or new state", async () => {
    const initial = await savableFixture();
    expect(saveResumeSnapshot(initial)).toBe(true);
    // Older snapshots have the authored strings but no function-valued provider.
    const saved = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    const savedChef = saved.worldItems.find((item: { id: string }) => item.id === "DoomedChef");
    expect(savedChef.getIdleActions).toBeUndefined();
    let state = (await restoreResumeSnapshot())!;
    expect(chef(state).getIdleActions).toBeTypeOf("function");
    expect(selectedIdlePool({ ...state, player: { ...state.player, roomId: "WalkIn" } }, chef(state).idleActions!.length)).toEqual(chef(state).idleActions);
    state = await runCommand({ ...state, rng: () => 0 }, "west");
    expect(entryCount(state)).toBe(1);
  });
});
