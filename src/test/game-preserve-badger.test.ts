import {
  getAnimalStatusRemainingTurns,
  setAnimalStatus,
} from "@game/preserve/animalStatus";
import { startGamePreserveRun } from "@game/preserve/preserveState";
import { buildDamageNotification } from "@game/rules/notifications";
import type { GameState } from "@game/types/gameTypes";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  runCommand,
  runCommands,
} from "./helpers/gameTestHelpers";

function createBadgerPreserveState(roomId = "GamePreserveEntrance"): GameState {
  const base = createTestState({
    roomId,
    rng: () => 0.99,
    visitedRooms: [roomId, "GamePreservePortal"],
  });

  return startGamePreserveRun({
    ...base,
    worldState: {
      ...base.worldState,
      gamePreserve: {
        ...base.worldState.gamePreserve,
        selectedDifficulty: "very-easy",
      },
    },
  });
}

function attachBadgerToPlayer(state: GameState): GameState {
  const withAttachment = setAnimalStatus(state, "badger", {
    id: "attached",
    source: "test",
  });

  return {
    ...withAttachment,
    itemState: {
      ...withAttachment.itemState,
      attachedTo: {
        ...withAttachment.itemState.attachedTo,
        badger: "PLAYER",
      },
      itemRoomId: {
        ...withAttachment.itemState.itemRoomId,
        badger: withAttachment.player.roomId,
      },
    },
  };
}

describe("game preserve badger", () => {
  it("beelines to the player and attaches within a few turns", async () => {
    const start = createBadgerPreserveState();

    const next = await runCommands(start, [
      "southwest",
      "wait",
      "wait",
      "wait",
    ]);

    expect(next.itemState.attachedTo.badger).toBe("PLAYER");
    expect(next.itemState.itemRoomId.badger).toBe("OpenSavanna");
    expect(next.log.join("\n")).toContain("clamps onto your face");
  });

  it("also reaches the rocky ridge entry path inside the intended window", async () => {
    const start = createBadgerPreserveState();

    const next = await runCommands(start, [
      "southeast",
      "wait",
      "wait",
      "wait",
      "wait",
    ]);

    expect(next.player.roomId).toBe("RockyRidge");
    expect(next.itemState.attachedTo.badger).toBe("PLAYER");
  });

  it("obscures the room description and deals low damage while attached", async () => {
    const start = attachBadgerToPlayer(
      createBadgerPreserveState("OpenSavanna"),
    );

    const looked = await runCommand(start, "look");
    expect(looked.log.slice(start.log.length).join("\n")).toContain(
      "All you can see is angry, snapping badger!",
    );

    const waited = await runCommand(looked, "wait");

    expect(waited.player.vitals.health).toBe(97);
    expect(waited.uiState.notifications).toContainEqual(
      expect.objectContaining({
        id: 1,
        ...buildDamageNotification(3),
      }),
    );
    expect(waited.log.slice(looked.log.length).join("\n")).toContain(
      "continues to hold onto your face",
    );
  });

  it("lets the player hit or punch the attached badger loose", async () => {
    const start = attachBadgerToPlayer(
      createBadgerPreserveState("OpenSavanna"),
    );

    const next = await runCommand(start, "punch badger");

    expect(next.itemState.attachedTo.badger).toBeUndefined();
    expect(next.itemState.itemRoomId.badger).toBe("OpenSavanna");
    expect(getAnimalStatusRemainingTurns(next, "badger", "stunned")).toBe(2);
    expect(next.log.slice(start.log.length).join("\n")).toContain(
      "tears loose from your face",
    );
  });

  it("turns the attached badger into a claw trophy when submerged at the waterhole", async () => {
    const start = attachBadgerToPlayer(createBadgerPreserveState("Waterhole"));

    const next = await runCommand(start, "submerge badger");

    expect(next.itemState.attachedTo.badger).toBeUndefined();
    expect(next.itemState.itemRoomId.badger).toBe("Mudflats");
    expect(expectInventoryToContain(next, "BadgerClaw")).toBe(true);
    expect(getAnimalStatusRemainingTurns(next, "badger", "stunned")).toBe(3);
    expect(next.log.slice(start.log.length).join("\n")).toContain(
      "stays lodged in your scalp",
    );
  });

  it("refuses to enter the waterhole while pursuing the player", async () => {
    const base = createBadgerPreserveState("Waterhole");
    const start: GameState = {
      ...base,
      itemState: {
        ...base.itemState,
        itemRoomId: {
          ...base.itemState.itemRoomId,
          badger: "Mudflats",
        },
      },
      worldState: {
        ...base.worldState,
        gamePreserve: {
          ...base.worldState.gamePreserve,
          run: base.worldState.gamePreserve.run
            ? {
                ...base.worldState.gamePreserve.run,
                actors: {
                  ...base.worldState.gamePreserve.run.actors,
                  badger: {
                    ...base.worldState.gamePreserve.run.actors.badger,
                    flags: {
                      ...base.worldState.gamePreserve.run.actors.badger.flags,
                      following: true,
                    },
                    memory: {
                      ...base.worldState.gamePreserve.run.actors.badger.memory,
                      lastKnownPlayerRoomId: "Waterhole",
                    },
                  },
                },
              }
            : null,
        },
      },
    };

    const next = await runCommand(start, "wait");

    expect(next.itemState.itemRoomId.badger).toBe("Mudflats");
    expect(next.log.slice(start.log.length).join("\n")).toContain(
      "edge of the water",
    );
  });

  it("makes the badger move two rooms after the matching whistle call", async () => {
    const base = createBadgerPreserveState("OpenSavanna");
    const start: GameState = {
      ...base,
      itemState: {
        ...base.itemState,
        itemSettings: {
          ...base.itemState.itemSettings,
          GameWhistle: { kind: "game-whistle", mode: "badger" },
        },
      },
    };

    const next = await runCommand(start, "blow game whistle");

    expect(next.itemState.itemRoomId.badger).toBe("TallGrass");
    expect(
      next.worldState.gamePreserve.run?.actors.badger.countdowns
        .whistleRageTurns,
    ).toBe(2);
  });

  it("does not let an attached badger follow through the empty-hand return", async () => {
    const start = attachBadgerToPlayer(createBadgerPreserveState("TrophyRoom"));

    const next = await runCommand(start, "touch dais");

    expect(next.player.roomId).toBe("GamePreservePortal");
    expect(next.itemState.attachedTo.badger).toBeUndefined();
    expect(next.itemState.itemRoomId.badger).toBe("GamePreserveStaging");
  });
});
