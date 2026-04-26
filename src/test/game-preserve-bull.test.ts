import { startGamePreserveRun } from "@game/preserve/preserveState";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { describe, expect, it } from "vitest";
import {
  addInventoryItems,
  createTestState,
  expectInventoryToContain,
  runCommand,
  runCommands,
} from "./helpers/gameTestHelpers";
import { GAME_PRESERVE_SPAWN_ROOM_ID } from "src/world/maps/levelFour/gamePreserveRules";

function createBullPreserveState(roomId = "GamePreserveEntrance"): GameState {
  return startGamePreserveRun(
    createTestState({
      roomId,
      rng: () => 0.99,
      visitedRooms: [roomId, "GamePreservePortal"],
    }),
  );
}

describe("game preserve bull", () => {
  it("keeps the entry bluff hidden while the bull patrols into earshot", async () => {
    const start = createBullPreserveState();

    const next = await runCommands(start, [
      "wait",
      "wait",
      "wait",
      "wait",
      "wait",
    ]);

    expect(next.player.roomId).toBe("GamePreserveEntrance");
    expect(next.itemState.itemRoomId.bull).not.toBe(GAME_PRESERVE_SPAWN_ROOM_ID);
    expect(next.worldState.bullEncounter.pendingCharge).toBeUndefined();
    expect(next.log.join("\n")).toContain("heavy hooves");
    expect(next.log.join("\n")).not.toContain("The bull jerks its head up");
  });

  it("can line up a straight two-room charge instead of stalling at range", async () => {
    const start = createBullPreserveState("RockyRidge");
    const primed: GameState = {
      ...start,
      itemState: {
        ...start.itemState,
        itemRoomId: {
          ...start.itemState.itemRoomId,
          bull: "OpenSavanna",
        },
      },
      worldState: {
        ...start.worldState,
        gamePreserve: {
          ...start.worldState.gamePreserve,
          run: start.worldState.gamePreserve.run
            ? {
                ...start.worldState.gamePreserve.run,
                actors: {
                  ...start.worldState.gamePreserve.run.actors,
                  bull: {
                    ...start.worldState.gamePreserve.run.actors.bull,
                    countdowns: {
                      ...start.worldState.gamePreserve.run.actors.bull
                        .countdowns,
                      chargeCooldown: 0,
                    },
                    intent: { kind: "idle" },
                    memory: {
                      ...start.worldState.gamePreserve.run.actors.bull.memory,
                      lastVisitedRoomId: "TallGrass",
                    },
                  },
                },
              }
            : null,
        },
      },
    };

    const next = await runCommand(primed, "wait");

    expect(next.itemState.itemRoomId.bull).toBe("OpenSavanna");
    expect(next.worldState.bullEncounter.pendingCharge).toEqual({
      dir: "east",
      targetRoomId: "RockyRidge",
    });
  });

  it("uses the game whistle to provoke the matching animal profile", async () => {
    const start = createBullPreserveState("RockyRidge");
    const primed: GameState = {
      ...start,
      itemState: {
        ...start.itemState,
        itemRoomId: {
          ...start.itemState.itemRoomId,
          bull: "OpenSavanna",
        },
      },
      worldState: {
        ...start.worldState,
        gamePreserve: {
          ...start.worldState.gamePreserve,
          run: start.worldState.gamePreserve.run
            ? {
                ...start.worldState.gamePreserve.run,
                actors: {
                  ...start.worldState.gamePreserve.run.actors,
                  bull: {
                    ...start.worldState.gamePreserve.run.actors.bull,
                    countdowns: {
                      ...start.worldState.gamePreserve.run.actors.bull
                        .countdowns,
                      chargeCooldown: 3,
                    },
                    intent: { kind: "idle" },
                  },
                },
              }
            : null,
        },
      },
    };

    const next = await runCommand(primed, "blow game whistle");

    expect(start.player.inventory.general).toContain("GameWhistle");
    expect(next.worldState.bullEncounter.pendingCharge).toEqual({
      dir: "east",
      targetRoomId: "RockyRidge",
    });
  });

  it("describes the game whistle's current selector setting", async () => {
    const start = createBullPreserveState();

    const initial = await runCommand(start, "examine game whistle");
    expect(initial.log.slice(start.log.length).join("\n")).toContain(
      "currently set to bull",
    );

    const setToBear = await runCommand(initial, "set game whistle to bear");
    const described = await runCommand(setToBear, "examine game whistle");

    expect(described.log.slice(setToBear.log.length).join("\n")).toContain(
      "currently set to bear",
    );
  });

  it("plays the selected game whistle call before the preserve response", async () => {
    const start = createBullPreserveState();
    const setToBadger = await runCommand(start, "set game whistle to badger");

    const next = await runCommand(setToBadger, "blow whistle");
    const blowLog = next.log.slice(setToBadger.log.length).join("\n");

    expect(blowLog).toContain(
      "You blow into the game whistle, and it emits a loud call:",
    );
    expect(blowLog).toContain('"Screech! Screeeeeech!"');
    expect(blowLog).toContain(
      "Nothing in the preserve seems impressed by that setting.",
    );
  });

  it("removes the game whistle when the player leaves the preserve", async () => {
    const start = createBullPreserveState("TrophyRoom");
    const flashBefore = useUIEffectsStore.getState().teleportFlashNonce;

    const next = await runCommand(start, "out");

    expect(start.player.inventory.general).toContain("GameWhistle");
    expect(next.player.roomId).toBe("GamePreservePortal");
    expect(next.player.inventory.general).not.toContain("GameWhistle");
    expect(next.itemState.itemRoomId.GameWhistle).toBe("GamePreserveEntrance");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      flashBefore + 1,
    );
  });

  it("returns the player empty-handed when the dais is touched", async () => {
    const touchStart = createBullPreserveState("TrophyRoom");
    const touchFlashBefore = useUIEffectsStore.getState().teleportFlashNonce;

    const touched = await runCommand(touchStart, "touch dais");
    const touchLog = touched.log.slice(touchStart.log.length).join("\n");

    expect(touched.player.roomId).toBe("GamePreservePortal");
    expect(touchLog).toContain("Leaving empty-handed");
    expect(expectInventoryToContain(touched, "GameWhistle")).toBe(false);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      touchFlashBefore + 1,
    );

    const handStart = createBullPreserveState("TrophyRoom");
    const handFlashBefore = useUIEffectsStore.getState().teleportFlashNonce;

    const handPlaced = await runCommand(handStart, "put hand on dais");
    const handLog = handPlaced.log.slice(handStart.log.length).join("\n");

    expect(handPlaced.player.roomId).toBe("GamePreservePortal");
    expect(handLog).toContain("Leaving empty-handed");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      handFlashBefore + 1,
    );
  });

  it("lets a dodged bull charge break open the ruined wall", async () => {
    const start = createBullPreserveState("RuinedWall");
    const primed: GameState = {
      ...start,
      itemState: {
        ...start.itemState,
        itemRoomId: {
          ...start.itemState.itemRoomId,
          bull: "TallGrass",
        },
      },
      worldState: {
        ...start.worldState,
        gamePreserve: {
          ...start.worldState.gamePreserve,
          run: start.worldState.gamePreserve.run
            ? {
                ...start.worldState.gamePreserve.run,
                actors: {
                  ...start.worldState.gamePreserve.run.actors,
                  bull: {
                    ...start.worldState.gamePreserve.run.actors.bull,
                    countdowns: {
                      ...start.worldState.gamePreserve.run.actors.bull
                        .countdowns,
                      chargeCooldown: 0,
                    },
                    intent: {
                      kind: "charge" as const,
                      direction: "south" as const,
                      targetRoomId: "RuinedWall",
                    },
                  },
                },
              }
            : null,
        },
      },
    };

    const next = await runCommand(primed, "northeast");

    expect(next.player.roomId).toBe("Mudflats");
    expect(next.itemState.itemRoomId.bull).toBe("RuinedWall");
    expect(next.worldState.gamePreserve.run?.structures.ruinedWallState).toBe(
      "toppled",
    );
    expect(next.itemState.itemRoomId.BrokenHorn).toBe("RuinedWall");
    expect(next.log.join("\n")).toContain("horn snaps");
    expect(next.log.join("\n")).toContain("cracked wall span");

    const bull = next.world.items.find((item) => item.id === "bull");
    expect(
      bull?.describe?.(next, bull, {
        kind: "examine",
        roomId: "RuinedWall",
      }),
    ).toContain("jagged stub");
  });

  it("accepts the broken horn on the trophy dais and returns the player after the prize is taken", async () => {
    const start = addInventoryItems(
      createBullPreserveState("TrophyRoom"),
      ["BrokenHorn"],
    );

    const submitted = await runCommand(start, "put horn on dais");
    const submitLog = submitted.log.slice(start.log.length).join("\n");

    expect(submitLog).toContain("Congratulations on your successful hunt");
    expect(submitLog).toContain("clean white flash");
    expect(submitted.itemState.itemRoomId.BrokenHorn).toBe(
      "GamePreserveStaging",
    );
    expect(submitted.itemState.itemRoomId.GamePrize).toBe("TrophyRoom");
    expect(submitted.player.inventory.general).not.toContain("BrokenHorn");

    const flashBefore = useUIEffectsStore.getState().teleportFlashNonce;
    const returned = await runCommand(submitted, "take prize");

    expect(returned.player.roomId).toBe("GamePreservePortal");
    expect(expectInventoryToContain(returned, "GamePrize")).toBe(true);
    expect(expectInventoryToContain(returned, "GameWhistle")).toBe(false);
    expect(returned.worldState.gamePreserve.completedDifficulties.moderate).toBe(
      true,
    );
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      flashBefore + 1,
    );
  });

  it("lets non-trophy items sit on the trophy dais without awarding a prize", async () => {
    const start = addInventoryItems(
      createBullPreserveState("TrophyRoom"),
      ["ProcessedAnimalTreatOne"],
    );

    const placed = await runCommand(start, "put treat on dais");
    const placeLog = placed.log.slice(start.log.length).join("\n");

    expect(placeLog).toContain("Done.");
    expect(placeLog).not.toContain("Congratulations on your successful hunt");
    expect(placed.itemState.surfaceContents.GamePreserveTrophyDais).toContain(
      "ProcessedAnimalTreatOne",
    );
    expect(placed.itemState.itemRoomId.GamePrize).toBe("GamePreserveStaging");

    const taken = await runCommand(placed, "take treat");

    expect(expectInventoryToContain(taken, "ProcessedAnimalTreatOne")).toBe(
      true,
    );
    expect(
      taken.itemState.surfaceContents.GamePreserveTrophyDais ?? [],
    ).not.toContain("ProcessedAnimalTreatOne");
  });

  it("removes carried trophies and restores the bull's horns after death", async () => {
    const base = addInventoryItems(
      createBullPreserveState("RockyRidge"),
      ["BrokenHorn"],
    );
    const start: GameState = {
      ...base,
      itemState: {
        ...base.itemState,
        itemRoomId: {
          ...base.itemState.itemRoomId,
          bull: "OpenSavanna",
        },
      },
      worldState: {
        ...base.worldState,
        gamePreserve: {
          ...base.worldState.gamePreserve,
          run: base.worldState.gamePreserve.run
            ? {
                ...base.worldState.gamePreserve.run,
                structures: {
                  ...base.worldState.gamePreserve.run.structures,
                  ruinedWallState: "toppled",
                },
                actors: {
                  ...base.worldState.gamePreserve.run.actors,
                  bull: {
                    ...base.worldState.gamePreserve.run.actors.bull,
                    countdowns: {
                      ...base.worldState.gamePreserve.run.actors.bull
                        .countdowns,
                      chargeCooldown: 0,
                    },
                    intent: {
                      kind: "charge" as const,
                      direction: "east" as const,
                      targetRoomId: "RockyRidge",
                    },
                  },
                },
              }
            : null,
        },
      },
    };
    const flashBefore = useUIEffectsStore.getState().teleportFlashNonce;

    const next = await runCommand(start, "wait");

    expect(next.player.roomId).toBe("GamePreservePortal");
    expect(expectInventoryToContain(next, "BrokenHorn")).toBe(false);
    expect(next.itemState.itemRoomId.BrokenHorn).toBe("GamePreserveStaging");
    expect(next.worldState.gamePreserve.run?.structures.ruinedWallState).toBe(
      "intact",
    );
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      flashBefore + 1,
    );

    const bull = next.world.items.find((item) => item.id === "bull");
    expect(
      bull?.describe?.(next, bull, {
        kind: "examine",
        roomId: "GamePreservePortal",
      }),
    ).not.toContain("jagged stub");
  });

  it("still lets the player break line of sight in the tall grass", async () => {
    const start = createBullPreserveState();

    const next = await runCommands(start, [
      "southwest",
      "south",
      "wait",
      "wait",
      "wait",
      "wait",
    ]);

    expect(next.player.roomId).toBe("TallGrass");
  });

  it("still lets the player escape to the waterhole", async () => {
    const start = createBullPreserveState();

    const next = await runCommands(start, [
      "southeast",
      "south",
      "wait",
      "wait",
      "wait",
      "wait",
    ]);

    expect(next.player.roomId).toBe("Waterhole");
    expect(next.itemState.itemRoomId.bull).not.toBe("Waterhole");
  });
});
