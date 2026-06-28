import type { GameState } from "@game/types/gameTypes";
import { describe, expect, it } from "vitest";
import {
  LEVEL_SIX_BREACH_SEALED_TRIGGER,
  LEVEL_SIX_SPACE_SUIT_ID,
} from "../world/maps/levelSix/airlockAndStorageConstants";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  runCommands,
} from "./helpers/gameTestHelpers";

function levelSixAirlockState(roomId = "LevelSixCorridorBend"): GameState {
  return createTestState({
    roomId,
    visitedRooms: [
      "LevelSixCorridorBend",
      "LevelSixCorridor",
      "StorageQuadOne",
      "PowerGrid",
    ],
  });
}

function levelSixSuitedMovementState(roomId: string): GameState {
  const state = levelSixAirlockState(roomId);

  return {
    ...state,
    itemState: {
      ...state.itemState,
      wornByPlayer: {
        ...state.itemState.wornByPlayer,
        body: LEVEL_SIX_SPACE_SUIT_ID,
      },
    },
  };
}

async function enterSealedAirlock(wearSuit = false): Promise<GameState> {
  const commands = [
    ...(wearSuit ? ["wear suit"] : []),
    "set outer door override to close",
    "open inner door",
    "south",
    "close inner door",
  ];

  return runCommands(levelSixAirlockState(), commands);
}

const greenStorageMoves = [
  ["StorageQuadOne", "south", "StorageQuadThree"],
  ["StorageQuadThree", "north", "StorageQuadOne"],
  ["StorageQuadTwo", "southwest", "StorageQuadThree"],
  ["StorageQuadThree", "northeast", "StorageQuadTwo"],
  ["StorageQuadTwo", "up", "StorageQuadTwoMid"],
  ["StorageQuadTwoMid", "down", "StorageQuadTwo"],
  ["StorageQuadFour", "up", "StorageQuadFourMid"],
  ["StorageQuadFourMid", "down", "StorageQuadFour"],
  ["StorageQuadOneMid", "south", "StorageQuadThreeMid"],
  ["StorageQuadThreeMid", "north", "StorageQuadOneMid"],
  ["StorageQuadOneMid", "east", "StorageQuadTwoMid"],
  ["StorageQuadTwoMid", "west", "StorageQuadOneMid"],
  ["StorageQuadOneMid", "up", "StorageQuadOneTop"],
  ["StorageQuadOneTop", "down", "StorageQuadOneMid"],
  ["StorageQuadThreeMid", "up", "StorageQuadThreeTop"],
  ["StorageQuadThreeTop", "down", "StorageQuadThreeMid"],
  ["StorageQuadFourMid", "up", "StorageQuadFourTop"],
  ["StorageQuadFourTop", "down", "StorageQuadFourMid"],
  ["StorageQuadOneTop", "south", "StorageQuadThreeTop"],
  ["StorageQuadThreeTop", "north", "StorageQuadOneTop"],
  ["StorageQuadOneTop", "southeast", "StorageQuadFourTop"],
  ["StorageQuadFourTop", "northwest", "StorageQuadOneTop"],
  ["StorageQuadFourTop", "east", "3DPrintingFacility"],
  ["3DPrintingFacility", "west", "StorageQuadFourTop"],
] as const;

const redStorageMoves = [
  ["StorageQuadOne", "east", "StorageQuadTwo"],
  ["StorageQuadTwo", "west", "StorageQuadOne"],
  ["StorageQuadOne", "southeast", "StorageQuadFour"],
  ["StorageQuadFour", "northwest", "StorageQuadOne"],
  ["StorageQuadOne", "up", "StorageQuadOneMid"],
  ["StorageQuadOneMid", "down", "StorageQuadOne"],
  ["StorageQuadTwo", "south", "StorageQuadFour"],
  ["StorageQuadFour", "north", "StorageQuadTwo"],
  ["StorageQuadThree", "east", "StorageQuadFour"],
  ["StorageQuadFour", "west", "StorageQuadThree"],
  ["StorageQuadThree", "up", "StorageQuadThreeMid"],
  ["StorageQuadThreeMid", "down", "StorageQuadThree"],
  ["StorageQuadOneMid", "southeast", "StorageQuadFourMid"],
  ["StorageQuadFourMid", "northwest", "StorageQuadOneMid"],
  ["StorageQuadTwoMid", "south", "StorageQuadFourMid"],
  ["StorageQuadFourMid", "north", "StorageQuadTwoMid"],
  ["StorageQuadTwoMid", "southwest", "StorageQuadThreeMid"],
  ["StorageQuadThreeMid", "northeast", "StorageQuadTwoMid"],
  ["StorageQuadTwoMid", "up", "StorageQuadTwoTop"],
  ["StorageQuadTwoTop", "down", "StorageQuadTwoMid"],
  ["StorageQuadThreeMid", "east", "StorageQuadFourMid"],
  ["StorageQuadFourMid", "west", "StorageQuadThreeMid"],
  ["StorageQuadOneTop", "east", "StorageQuadTwoTop"],
  ["StorageQuadTwoTop", "west", "StorageQuadOneTop"],
  ["StorageQuadTwoTop", "south", "StorageQuadFourTop"],
  ["StorageQuadFourTop", "north", "StorageQuadTwoTop"],
  ["StorageQuadTwoTop", "southwest", "StorageQuadThreeTop"],
  ["StorageQuadThreeTop", "northeast", "StorageQuadTwoTop"],
  ["StorageQuadThreeTop", "east", "StorageQuadFourTop"],
  ["StorageQuadFourTop", "west", "StorageQuadThreeTop"],
] as const;

describe("Level Six airlock and storage quad", () => {
  it("uses override panels and door interlocks to cycle the airlock", async () => {
    const blockedInner = await runCommand(
      levelSixAirlockState(),
      "open inner door",
    );

    expect(blockedInner.worldState.doors.InnerDoor.isOpen).toBe(false);
    expect(getLastLogEntry(blockedInner)).toContain("won't budge");

    let state = await runCommand(
      levelSixAirlockState(),
      "set outer door override to close",
    );

    expect(state.worldState.doors.OuterDoor.isOpen).toBe(false);
    expect(state.worldState.roomAirQuality.LevelSixCorridor).toBe("clean");

    state = await runCommand(state, "open inner door");
    expect(state.worldState.doors.InnerDoor.isOpen).toBe(true);

    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("LevelSixCorridor");

    const blockedOuter = await runCommand(state, "open outer door");
    expect(blockedOuter.worldState.doors.OuterDoor.isOpen).toBe(false);
    expect(getLastLogEntry(blockedOuter)).toContain("refuses to open");

    const sealed = await runCommand(state, "close inner door");
    expect(sealed.worldState.doors.InnerDoor.isOpen).toBe(false);
    expect(getLastLogEntry(sealed)).toContain("pressure adjusts");
  });

  it("lets the inner airlock door be closed by its northern direction", async () => {
    let state = await runCommand(
      levelSixAirlockState(),
      "set outer door override to close",
    );

    state = await runCommand(state, "open inner door");
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("LevelSixCorridor");
    expect(state.worldState.doors.InnerDoor.isOpen).toBe(true);

    const sealed = await runCommand(state, "close northern door");
    expect(sealed.worldState.doors.InnerDoor.isOpen).toBe(false);
    expect(getLastLogEntry(sealed)).toContain("pressure adjusts");
  });

  it("kills an unsuited player who opens the outer door from the sealed airlock", async () => {
    const sealed = await enterSealedAirlock();
    const doomed = await runCommand(sealed, "open outer door");

    expect(doomed.worldState.doors.OuterDoor.isOpen).toBe(true);
    expect(doomed.worldState.playerDeaths.LevelSixCorridor?.cause).toBe(
      "level six vacuum exposure",
    );
    expect(doomed.player.roomId).not.toBe("LevelSixCorridor");
  });

  it("lets a suited player enter storage, drains oxygen, blocks drifting container shortcuts, and refills in air", async () => {
    let state = await enterSealedAirlock(true);

    expect(state.itemState.wornByPlayer.body).toBe(LEVEL_SIX_SPACE_SUIT_ID);

    state = await runCommand(state, "open outer door");
    expect(state.player.roomId).toBe("LevelSixCorridor");
    expect(state.player.vitals.oxygen).toBe(99);

    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("StorageQuadOne");
    expect(state.player.vitals.oxygen).toBe(98);

    const blockedShortcut = await runCommand(state, "southeast");
    expect(blockedShortcut.player.roomId).toBe("StorageQuadOne");
    expect(getLastLogEntry(blockedShortcut)).toContain(
      "weightless containers",
    );

    state = await runCommand(state, "north");
    expect(state.player.roomId).toBe("LevelSixCorridor");
    expect(state.player.vitals.oxygen).toBe(97);

    const pressurized = await runCommand(state, "close outer door");
    expect(pressurized.player.vitals.oxygen).toBe(100);
    expect(getLastLogEntry(pressurized)).toContain("refills with a crisp hiss");
  });

  it.each(greenStorageMoves)(
    "allows green storage path %s %s",
    async (fromRoomId, direction, destinationRoomId) => {
      const next = await runCommand(
        levelSixSuitedMovementState(fromRoomId),
        direction,
      );

      expect(next.player.roomId).toBe(destinationRoomId);
    },
  );

  it.each(redStorageMoves)(
    "blocks red storage path %s %s",
    async (fromRoomId, direction) => {
      const next = await runCommand(
        levelSixSuitedMovementState(fromRoomId),
        direction,
      );

      expect(next.player.roomId).toBe(fromRoomId);
      expect(getLastLogEntry(next)).toContain("weightless containers");
    },
  );

  it("seals the hull breach with Flex-Plug and awards eight points once", async () => {
    let state = levelSixAirlockState("RIFT");
    state = await runCommand(state, "wear suit");

    const patched = await runCommand(state, "put adhesive over breach");
    expect(
      patched.worldState.conditionalTriggers[LEVEL_SIX_BREACH_SEALED_TRIGGER],
    ).toBe(true);
    expect(patched.worldState.scoresTriggered.sealed_level_six_breach).toBe(
      true,
    );
    expect(patched.score).toBe(8);
    expect(getLastLogEntry(patched)).toContain("peel the backing");

    const repeated = await runCommand(patched, "seal breach with adhesive");
    expect(repeated.score).toBe(8);
    expect(getLastLogEntry(repeated)).toContain("already sealed");
  });
});
