import {
  createFreshGameState,
  mergeWorldChunkIntoState,
  createInitialState,
} from "@game/gameInit";
import {
  clearResumeSnapshot,
  restoreResumeSnapshot,
  saveResumeSnapshot,
} from "@game/persistence/resumeStorage";
import { setItemDoses, updateItemLocation } from "@game/rules/items";
import type { Item } from "@game/types/itemTypes";
import { INITIAL_WORLD, loadWorldChunk } from "../world/World";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";
import { describe, expect, it } from "vitest";

describe("resume storage", () => {
  it("restores a saved session without losing runtime state", async () => {
    let state = createInitialState(INITIAL_WORLD);
    const levelThree = await loadWorldChunk("level-three");
    state = mergeWorldChunkIntoState(state, "level-three", levelThree);

    state = {
      ...state,
      log: ["Restored transcript line."],
      moves: 42,
      player: {
        ...state.player,
        roomId: "ParkEast",
      },
      rating: 3,
      score: 7,
      uiState: {
        ...state.uiState,
        cometPersonality: "snarky",
        nextNotificationId: 99,
        notifications: [
          {
            id: 98,
            kind: "system",
            text: "Transient notification",
          },
        ],
      },
      worldState: {
        ...state.worldState,
        pendingNarration: {
          afterRoomDescription: ["Should not survive resume."],
        },
      },
    };

    state = updateItemLocation(state, "PowerStationKey", "ParkCenter");
    state = setItemDoses(state, "FiveWestScotch", 9);

    const runtimeHusk: Item = {
      id: "playerRegenHusk99",
      location: "ParkEast",
      name: "a lifeless husk",
      description: "It's identical to the one you found when you first woke up.",
      initialDescription:
        "Curled up on the floor nearby you see what looks like a dead bug, or spider.",
      vocab: ["husk", "lifeless husk", "bug husk"],
      itemClass: "solid",
      itemCategory: "collectable",
      itemWeight: 0,
      itemSize: 0,
    };

    state = {
      ...state,
      world: {
        ...state.world,
        items: [...state.world.items, runtimeHusk],
      },
      itemState: {
        ...state.itemState,
        itemRoomId: {
          ...state.itemState.itemRoomId,
          [runtimeHusk.id]: runtimeHusk.location,
        },
      },
    };

    saveResumeSnapshot(state);

    const restored = await restoreResumeSnapshot();

    expect(restored).not.toBeNull();
    const next = restored!;

    expect(next.player.roomId).toBe("ParkEast");
    expect(next.moves).toBe(42);
    expect(next.score).toBe(7);
    expect(next.rating).toBe(3);
    expect(next.log).toEqual(["Restored transcript line."]);
    expect(next.uiState.cometPersonality).toBe("snarky");
    expect(next.uiState.notifications).toEqual([]);
    expect(next.uiState.nextNotificationId).toBe(1);
    expect(next.worldState.pendingNarration).toBeUndefined();
    expect(next.world.meta?.loadedChunkIds).toEqual(
      expect.arrayContaining(["level-six", "stairwell", "level-three"]),
    );
    expect(next.itemState.itemRoomId.PowerStationKey).toBe("ParkCenter");
    expect(next.world.items.find((item) => item.id === "PowerStationKey")?.location).toBe(
      "ParkCenter",
    );
    expect(next.world.items.find((item) => item.id === "FiveWestScotch")?.doses).toBe(
      9,
    );
    expect(next.world.items.find((item) => item.id === runtimeHusk.id)?.name).toBe(
      runtimeHusk.name,
    );
    expect(
      typeof next.world.items.find((item) => item.id === "TrashBotBin")
        ?.describeLookThrough,
    ).toBe("function");
    expect(typeof next.rng).toBe("function");

    clearResumeSnapshot();
  });

  it("lets the player save and restore a manual snapshot in-game", async () => {
    const baseState = createTestState();
    const start = {
      ...baseState,
      moves: 7,
      uiState: {
        ...baseState.uiState,
        cometPersonality: "default" as const,
      },
    };

    const saved = await runCommand(start, "save");
    const changed = {
      ...saved,
      moves: 99,
      uiState: {
        ...saved.uiState,
        cometPersonality: "snarky" as const,
      },
    };

    const restored = await runCommand(changed, "restore");

    expect(getLastLogEntry(saved)).toContain("Progress saved.");
    expect(restored.moves).toBe(7);
    expect(restored.uiState.cometPersonality).toBe("default");
    expect(restored.log).toEqual(["> restore\nProgress restored.\n\n"]);
  });

  it("reports when restore is requested without a manual save", async () => {
    const start = createTestState();

    const restored = await runCommand(start, "restore");

    expect(restored.player.roomId).toBe(start.player.roomId);
    expect(restored.moves).toBe(start.moves);
    expect(getLastLogEntry(restored)).toContain(
      "You don't have a saved game to restore.",
    );
  });

  it("restarts into a fresh session and clears saved progress", async () => {
    const fresh = await createFreshGameState();
    const changed = {
      ...fresh,
      log: ["Old transcript line."],
      moves: 12,
      score: 5,
      rating: 2,
      uiState: {
        ...fresh.uiState,
        cometPersonality: "snarky" as const,
      },
    };

    const saved = await runCommand(changed, "save");
    const restarted = await runCommand(saved, "restart");

    expect(restarted.player.roomId).toBe(fresh.player.roomId);
    expect(restarted.moves).toBe(fresh.moves);
    expect(restarted.score).toBe(fresh.score);
    expect(restarted.rating).toBe(fresh.rating);
    expect(restarted.uiState.cometPersonality).toBe(
      fresh.uiState.cometPersonality,
    );
    expect(getLastLogEntry(restarted)).toContain("Game restarted.");

    const restoreAttempt = await runCommand(restarted, "restore");

    expect(getLastLogEntry(restoreAttempt)).toContain(
      "You don't have a saved game to restore.",
    );
  });
});
