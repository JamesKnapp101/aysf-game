import { describe, expect, it } from "vitest";
import { createInitialState, mergeWorldChunkIntoState } from "@game/gameInit";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { getItemPlacementContext, stashItemInContainer } from "@game/helpers/itemPlacement";
import { canPlayerSeeInRoom } from "@game/helpers/visibilityHelpers";
import { restoreResumeSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { updateItemLocation } from "@game/rules/items";
import { resolveItemByNoun } from "@game/rules/scope";
import { inventoryHas } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import { getInventoryItemLabel } from "@game/text/inventoryPresentation";
import type { GameState } from "@game/types/gameTypes";
import { INITIAL_WORLD, loadWorldChunk } from "src/world/World";
import { getChefSampleEnvironment, tickChefSampleLifetime } from "src/world/maps/levelThree/Park/Restaurant/chefSample";
import {
  addInventoryItems, createTestState, getLastLogEntry, patchRoomDarkness,
  runCommand, runCommands, setPlayerRoom,
} from "./helpers/gameTestHelpers";

const SAMPLE = "ChefSample";
// These are the specification's literal responses, independent of production constants.
const EXTRACTION = `You use the carving knife to slice off the smallest possible sample, but the chef doesn't even flinch.\n\n"Take as much as you need..." he says.\n\nThe corrupted slice of flesh quivers in your hand for a moment before going still.`;
const DUPLICATE = "Give the poor guy a break, at least only take one at a time.";
const EXPIRATION = "The sample from the poor chef twitches, quivers for a moment, then dissolves into nothing.";
const RAW = "It's a small slice of raw flesh, webbed through with dark red lines.";
const SCULPTURE = "It's deep red and hard, like glass. The shape seems random, covered with intricate ripples and grooves.";

function fixture(items = ["CarvingKnife"]): GameState {
  return addInventoryItems(createTestState({ roomId: "WalkIn" }), items);
}

async function extracted(items?: string[]): Promise<GameState> {
  return runCommand(fixture(items), "carve sample from chef");
}

function remaining(state: GameState): number | undefined {
  return state.worldState.chefSample?.remainingWarmTurns;
}

function expectGone(state: GameState) {
  expect(state.worldState.chefSample).toBeUndefined();
  expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(false);
  expect(state.itemState.itemRoomId[SAMPLE]).toBe("seeded");
  expect(state.itemState.attachedTo[SAMPLE]).toBeUndefined();
  for (const lists of [
    state.itemState.containerContents, state.itemState.containerFilled,
    state.itemState.surfaceContents, state.itemState.underContents, state.itemState.searchableContents,
  ]) expect(Object.values(lists).flat()).not.toContain(SAMPLE);
  expect(resolveItemByNoun(state, "sample")).toBeUndefined();
  expect(state.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
}

describe("chef sample extraction", () => {
  const phrases = [
    "carve sample from chef", "slice sample from chef", "cut sample from chef",
    "take sample from chef", "cut off piece of chef",
  ];
  it.each(phrases.flatMap((phrase) => [phrase, `${phrase} with carving knife`]))(
    "extracts exactly one sample with '%s'", async (command) => {
      const initial = fixture();
      const state = await runCommand(initial, command);
      expect(getLastLogEntry(state).trim()).toBe(`> ${command}\n${EXTRACTION}`);
      expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
      expect(remaining(state)).toBe(4);
      expect(state.moves).toBe(initial.moves + 1);
      expect(state.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
    },
  );

  it.each([
    "cut the sample from the chef with the carving knife",
    "cut off a piece of the chef with the knife",
    "  SLICE   SAMPLE FROM CHEF WITH CARVING KNIFE  ",
    "get sample from chef", "cut chef with carving knife",
  ])("supports ordinary noun and verb normalization: %s", async (command) => {
    const state = await runCommand(fixture(), command);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(state.log.join("\n")).toContain(EXTRACTION);
  });

  it.each([
    ["carve sample from chef", "You can't reach the carving knife."],
    ["slice sample from chef with carving knife", "You can't reach the carving knife."],
    ["take sample from chef with dart", "You need the carving knife"],
    ["cut off piece of chef with spoon", "You need the carving knife"],
  ])("rejects missing or incorrect equipment: %s", async (command, message) => {
    const initial = fixture(["Dart"]);
    const state = await runCommand(initial, command);
    expect(getLastLogEntry(state)).toContain(message);
    expectGone(state);
    expect(state.moves).toBe(initial.moves + 1);
  });

  it("rejects an explicit incorrect tool even when the carving knife is available", async () => {
    const state = await runCommand(fixture(["CarvingKnife", "Dart"]), "cut sample from chef with dart");
    expectGone(state);
    expect(getLastLogEntry(state)).toContain("You need the carving knife");
  });

  it("allows access to a knife in the room without silently fetching one from elsewhere", async () => {
    let state = updateItemLocation(fixture([]), "CarvingKnife", "WalkIn");
    state = await runCommand(state, "take sample from chef");
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(inventoryHas(state.player.inventory, "CarvingKnife")).toBe(false);
    const remoteChef = await runCommand(setPlayerRoom(fixture(), "Kitchen"), "carve sample from chef");
    expectGone(remoteChef);
    expect(getLastLogEntry(remoteChef)).toContain("You don't see the chef here.");
  });

  it("requires every nested container around the knife to be open", async () => {
    let state = fixture(["CarvingKnife", "Cooler", "saunacorpsepurse"]);
    state = stashItemInContainer(state, "CarvingKnife", "saunacorpsepurse");
    state = stashItemInContainer(state, "saunacorpsepurse", "Cooler");
    state = await runCommand(state, "carve sample from chef with carving knife");
    expectGone(state);
    state = await runCommand(state, "open cooler");
    state = await runCommand(state, "carve sample from chef");
    expectGone(state);
    state = await runCommand(state, "open purse");
    state = await runCommand(state, "carve sample from chef with carving knife");
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
  });

  it.each(["carried", "dropped", "contained", "nested", "remote"])(
    "rejects another extraction while the first sample is %s", async (placement) => {
      let state = await extracted(["CarvingKnife", "Cooler", "saunacorpsepurse"]);
      if (placement === "dropped" || placement === "remote") state = await runCommand(state, "drop sample");
      if (placement === "contained") state = await runCommands(state, ["open cooler", "put sample in cooler", "close cooler"]);
      if (placement === "nested") {
        state = await runCommand(state, "put sample in purse");
        state = await runCommands(state, ["open cooler", "put purse in cooler", "close cooler"]);
      }
      if (placement === "remote") state = updateItemLocation(state, SAMPLE, "Kitchen");
      const next = await runCommand(state, "slice sample from chef");
      expect(next.log.join("\n")).toContain(DUPLICATE);
      expect(next.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
      expect(remaining(next)).toBe(placement === "remote" ? 3 : 4);
    },
  );
});

describe("chef sample presentation and lifetime", () => {
  it("keeps a sample visible in an ordinary container that is always open", async () => {
    let state = await extracted(["CarvingKnife", "FISHBOWL"]);
    state = await runCommands(state, ["put sample in fishbowl", "east", "examine sample"]);
    expect(getLastLogEntry(state)).toContain(SCULPTURE);
    expect(remaining(state)).toBe(2);
    expect(resolveItemByNoun(state, "sample")?.id).toBe(SAMPLE);
  });

  it("uses exact descriptions and dynamic inventory names on the same item", async () => {
    let state = await extracted();
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state).trim()).toBe(`> examine sample\n${RAW}`);
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a corrupted flesh sample");
    state = await runCommand(state, "east");
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a small sculpture");
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state).trim()).toBe(`> examine sample\n${SCULPTURE}`);
    state = await runCommand(state, "west");
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a corrupted flesh sample");
    expect(state.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
  });

  it("counts the exit as warm turn one and expires before the fifth move reaches Spa", async () => {
    let state = await extracted();
    const start = state.moves;
    for (const [direction, destination, turns] of [
      ["east", "Kitchen", 3], ["east", "Restaurant", 2],
      ["northeast", "RestaurantEntrance", 1], ["northwest", "ParkWest", undefined],
      ["west", "Spa", undefined],
    ] as const) {
      state = await runCommand(state, direction);
      expect(state.player.roomId).toBe(destination);
      expect(remaining(state)).toBe(turns);
      if (destination === "ParkWest") expect(getLastLogEntry(state).trim()).toBe(EXPIRATION);
    }
    expect(state.moves - start).toBe(5);
    expectGone(state);
    expect(state.log.join("\n").split(EXPIRATION)).toHaveLength(2);
  });

  it("preserves the sample indefinitely in the WalkIn, including in darkness", async () => {
    let state = patchRoomDarkness(await extracted(), "WalkIn", true);
    state = await runCommands(state, Array(12).fill("wait"));
    expect(remaining(state)).toBe(4);
    expect(state.worldState.playerDeaths.WalkIn).toBeUndefined();
    expect(useUIEffectsStore.getState().organismDeath).toBeNull();
  });

  it("pauses an already used budget on returning to the WalkIn without replenishing it", async () => {
    let state = await runCommands(await extracted(), ["east", "west", "wait", "wait"]);
    expect(remaining(state)).toBe(3);
    state = await runCommand(state, "east");
    expect(remaining(state)).toBe(2);
  });

  it("preserves a sample left in the WalkIn while its owner travels elsewhere", async () => {
    let state = await runCommands(await extracted(), ["drop sample", "east", "wait", "wait", "wait", "wait"]);
    expect(remaining(state)).toBe(4);
    state = await runCommands(state, ["west", "take sample"]);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
  });

  it("continues remote decay while the player returns to cold without the sample", async () => {
    let state = await runCommands(await extracted(), ["east", "drop sculpture", "west"]);
    expect(state.player.roomId).toBe("WalkIn");
    expect(remaining(state)).toBe(1);
    state = await runCommand(state, "wait");
    expectGone(state);
    expect(getLastLogEntry(state).trim()).toBe(EXPIRATION);
  });

  it("preserves free-command and unsuccessful-action turn conventions", async () => {
    let state = await runCommand(await extracted(), "east");
    const moves = state.moves;
    state = await runCommands(state, ["inventory", "help", "diagnose", "nonsense"]);
    expect(state.moves).toBe(moves);
    expect(remaining(state)).toBe(3);
    state = await runCommand(state, "take nonexistent spoon");
    expect(state.moves).toBe(moves + 1);
    expect(remaining(state)).toBe(2);
  });

  it("lets an item action use the last viable turn before retirement", async () => {
    let state = await runCommands(await extracted(), ["east", "drop sculpture", "wait"]);
    expect(remaining(state)).toBe(1);
    state = await runCommand(state, "take sculpture");
    expect(state.log.join("\n")).toContain("> take sculpture\nTaken.");
    expectGone(state);
    expect(getLastLogEntry(state).trim()).toBe(EXPIRATION);
  });

  it("derives exposure through nested open, closed, and transparent containers", async () => {
    let state = await extracted(["CarvingKnife", "Cooler", "saunacorpsepurse"]);
    state = await runCommands(state, ["open cooler", "open purse", "put sample in purse", "put purse in cooler", "east"]);
    expect(getChefSampleEnvironment(state).roomId).toBe("Kitchen");
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a small sculpture");
    expect(resolveItemByNoun(state, "sample")?.id).toBe(SAMPLE);
    state = await runCommand(state, "examine sample");
    expect(getLastLogEntry(state)).toContain(SCULPTURE);
    state = await runCommand(state, "close cooler");
    expect(getChefSampleEnvironment(state).sculpture).toBe(false);
    expect(resolveItemByNoun(state, "sample")).toBeUndefined();
    const transparent = {
      ...state,
      world: { ...state.world, items: state.world.items.map((item) => item.id === "Cooler"
        ? { ...item, meta: { ...item.meta, transparentContainer: true } } : item) },
    };
    expect(getChefSampleEnvironment(transparent).sculpture).toBe(true);
    expect(remaining(state)).toBe(1);
  });

  it.each(["floor", "inventory", "container", "nested", "surface", "under", "searchable"])(
    "removes every placement reference when a sample expires from %s", async (placement) => {
      let state = await extracted(["CarvingKnife", "Cooler", "saunacorpsepurse"]);
      if (placement === "floor") state = await runCommand(state, "drop sample");
      if (placement === "container") state = await runCommands(state, ["open cooler", "put sample in cooler", "close cooler"]);
      if (placement === "nested") state = await runCommands(state, ["open cooler", "put sample in purse", "put purse in cooler", "close cooler"]);
      if (["surface", "under", "searchable"].includes(placement)) {
        state = updateItemLocation(state, SAMPLE, "WalkIn");
        state = { ...state, player: { ...state.player, inventory: {
          ...state.player.inventory, general: state.player.inventory.general.filter((id) => id !== SAMPLE),
        } }, itemState: { ...state.itemState,
          [`${placement}Contents`]: { ["Cooler"]: [SAMPLE] },
        } };
      }
      state = setPlayerRoom(state, "Kitchen");
      if (placement === "floor") state = updateItemLocation(state, SAMPLE, "Kitchen");
      state = await runCommands(state, ["wait", "wait", "wait", "wait"]);
      expectGone(state);
      expect(getLastLogEntry(state).trim()).toBe(EXPIRATION);
      if (placement === "nested") expect(state.itemState.containerContents.Cooler).toContain("saunacorpsepurse");
    },
  );

  it("permits replacement after expiration and retrieves a contained sample normally", async () => {
    let state = await extracted(["CarvingKnife", "Cooler"]);
    state = await runCommands(state, ["open cooler", "put sample in cooler", "take sample from cooler"]);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(remaining(state)).toBe(4);
    state = await runCommands(state, ["east", "wait", "wait", "wait", "west", "slice sample from chef"]);
    expect(remaining(state)).toBe(4);
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(state.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
    expect(state.itemState.containerContents.Cooler).not.toContain(SAMPLE);
  });
});

describe("chef sample darkness and death", () => {
  it("rechecks a late lighting change before allowing last-turn expiration", async () => {
    let state = await runCommands(await extracted(), ["east", "wait", "wait"]);
    expect(remaining(state)).toBe(1);
    state = tickChefSampleLifetime(patchRoomDarkness(state, "Kitchen", true)).state;
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
    expect(state.log.join("\n")).not.toContain(EXPIRATION);
  });

  it("reacts to a flashlight battery running out on the entry turn", async () => {
    let state = await extracted(["CarvingKnife", "flashlight"]);
    state = { ...state, itemState: { ...state.itemState, itemSettings: {
      ...state.itemState.itemSettings,
      flashlight: { kind: "flashlight", isOn: true, currentCharge: 0.01,
        maxCharge: 100, drainRate: 0.05, rechargeRate: 10 },
    } } };
    state = await runCommand(patchRoomDarkness(state, "Kitchen", true), "east");
    expect(state.log.join("\n")).toContain("The LED flashlight dims and goes dark.");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
  });

  it.each(["carried", "closed cooler", "nested"])("uses standard organism death with a sample %s", async (placement) => {
    let state = await extracted(["CarvingKnife", "Cooler", "saunacorpsepurse"]);
    if (placement === "closed cooler") state = await runCommands(state, ["open cooler", "put sample in cooler", "close cooler"]);
    if (placement === "nested") state = await runCommands(state, ["open cooler", "put sample in purse", "put purse in cooler", "close cooler"]);
    state = patchRoomDarkness(state, "Kitchen", true);
    state = await runCommand(state, "east");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expect(state.log.join("\n")).toContain("*** You have died ***");
    expect(useUIEffectsStore.getState().organismDeath).not.toBeNull();
    expectGone(state);
    expect(state.log.join("\n")).not.toContain(EXPIRATION);
    const deaths = state.worldState.playerHuskCount;
    state = await runCommand(state, "wait");
    expect(state.worldState.playerHuskCount).toBe(deaths);
    state = setPlayerRoom(state, "WalkIn");
    state = await runCommand(state, "take sample from chef");
    expect(remaining(state)).toBe(4);
  });

  it("does not mistake night vision for physical illumination", async () => {
    let state = patchRoomDarkness(await extracted(), "Kitchen", true);
    state = setPlayerRoom(state, "Kitchen");
    state = { ...state, player: { ...state.player, statusEffects: [
      ...state.player.statusEffects, { id: "nightvision-active", intensity: 1, remainingTurns: 5 },
    ] } };
    expect(canPlayerSeeInRoom(state, "Kitchen")).toBe(true);
    state = await runCommand(state, "wait");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
  });

  it("uses a real flashlight for protection, then reacts to it being switched off", async () => {
    let state = await extracted(["CarvingKnife", "flashlight"]);
    state = await runCommand(state, "turn flashlight on");
    state = patchRoomDarkness(state, "Kitchen", true);
    state = await runCommand(state, "east");
    expect(state.worldState.playerDeaths.Kitchen).toBeUndefined();
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a small sculpture");
    state = await runCommand(state, "turn flashlight off");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expectGone(state);
  });

  it("checks darkness before expiration on the sample's last viable turn", async () => {
    let state = await runCommands(await extracted(), ["east", "wait", "wait"]);
    expect(remaining(state)).toBe(1);
    state = await runCommand(patchRoomDarkness(state, "Kitchen", true), "wait");
    expect(state.worldState.playerDeaths.Kitchen?.cause).toBe("organism");
    expect(state.log.join("\n")).not.toContain(EXPIRATION);
    expectGone(state);
  });

  it("does not illuminate a remote sample with the player's flashlight", async () => {
    let state = await extracted(["CarvingKnife", "flashlight"]);
    state = await runCommand(state, "turn flashlight on");
    state = await runCommands(state, ["east", "drop sample", "west"]);
    state = patchRoomDarkness(state, "Kitchen", true);
    expect(getChefSampleEnvironment(state).illuminated).toBe(false);
    state = await runCommand(state, "wait");
    expectGone(state);
    expect(state.worldState.playerDeaths.WalkIn).toBeUndefined();
  });

  it("keeps placement and budget intact after an unrelated ordinary respawn", async () => {
    let state = await runCommand(await extracted(), "east");
    state = triggerPlayerDeath(state, "An unrelated accident.", "test accident");
    expect(inventoryHas(state.player.inventory, SAMPLE)).toBe(true);
    expect(getItemPlacementContext(state, SAMPLE).roomId).toBe(state.player.roomId);
    expect(remaining(state)).toBe(3);
  });
});

describe("chef sample save compatibility", () => {
  async function savableFixture() {
    let state = createInitialState(INITIAL_WORLD);
    state = mergeWorldChunkIntoState(state, "level-three", await loadWorldChunk("level-three"));
    return addInventoryItems(setPlayerRoom(state, "WalkIn"), ["CarvingKnife", "Cooler", "saunacorpsepurse"]);
  }

  it("restores an active sample, its presentation and its exact remaining budget", async () => {
    let state = await runCommands(await savableFixture(), ["carve sample from chef", "east", "save"]);
    expect(remaining(state)).toBe(3);
    state = await runCommands(state, ["wait", "wait", "wait"]);
    expectGone(state);
    state = await runCommand(state, "restore");
    expect(remaining(state)).toBe(3);
    expect(getInventoryItemLabel(state, SAMPLE)).toBe("a small sculpture");
    expect(state.world.items.filter((item) => item.id === SAMPLE)).toHaveLength(1);
    state = await runCommands(state, ["west", "cut sample from chef"]);
    expect(getLastLogEntry(state)).toContain(DUPLICATE);
    expect(remaining(state)).toBe(3);
    state = await runCommands(state, ["east", "wait", "wait"]);
    expectGone(state);
  });

  it("resumes a sample inside nested closed containers without losing or duplicating it", async () => {
    let state = await runCommands(await savableFixture(), ["cut sample from chef", "open cooler", "put sample in purse", "put purse in cooler", "close cooler", "east"]);
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expect(remaining(state)).toBe(3);
    expect(getChefSampleEnvironment(state).roomId).toBe("Kitchen");
    expect(getChefSampleEnvironment(state).sculpture).toBe(false);
    expect(state.itemState.containerContents.saunacorpsepurse).toEqual([SAMPLE]);
    state = await runCommands(state, ["wait", "wait", "wait"]);
    expectGone(state);
    expect(state.itemState.containerContents.Cooler).toContain("saunacorpsepurse");
  });

  it("loads older saves without a sample and allows normal first extraction", async () => {
    const state = await savableFixture();
    expect(saveResumeSnapshot(state)).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    delete snapshot.worldState.chefSample;
    delete snapshot.itemState.itemRoomId[SAMPLE];
    snapshot.worldItems = snapshot.worldItems.filter((item: { id: string }) => item.id !== SAMPLE);
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));
    const restored = (await restoreResumeSnapshot())!;
    expectGone(restored);
    const next = await runCommand(restored, "carve sample from chef");
    expect(remaining(next)).toBe(4);
  });

  it("retires an orphaned restored sample instead of blocking extraction forever", async () => {
    let state = await runCommand(await savableFixture(), "carve sample from chef");
    state = updateItemLocation(state, SAMPLE, "MissingContainer");
    state = { ...state, player: { ...state.player, inventory: {
      ...state.player.inventory, general: state.player.inventory.general.filter((id) => id !== SAMPLE),
    } } };
    expect(saveResumeSnapshot(state)).toBe(true);
    state = (await restoreResumeSnapshot())!;
    expectGone(state);
    state = await runCommand(state, "take sample from chef");
    expect(remaining(state)).toBe(4);
  });
});
