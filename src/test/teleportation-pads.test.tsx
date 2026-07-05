import { createInitialState } from "@game/gameInit";
import { TeleportationTerminalModal } from "@game/components/TeleportationTerminalModal";
import { useUIEffectsStore, useUIOverlayStore } from "@game/store/store";
import type { GameState, World } from "@game/types/gameTypes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { INITIAL_WORLD, mergeWorldChunks } from "../world/World";
import { LEVEL_THREE } from "../world/maps/levelThree/LevelThree";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  setInventory,
} from "./helpers/gameTestHelpers";

function setPlayerRoom(state: GameState, roomId: string): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      roomId,
    },
    worldState: {
      ...state.worldState,
      visitedRooms: {
        ...state.worldState.visitedRooms,
        [roomId]: true,
      },
    },
  };
}

function withPoweredTeleportPads(state: GameState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      powerRestoredSections: {
        ...state.worldState.powerRestoredSections,
        "teleport-pads-blue": true,
        "teleport-pads-green": true,
      },
    },
  };
}

function createLevelThreeLoadedWorld(): World {
  return {
    ...mergeWorldChunks(INITIAL_WORLD, LEVEL_THREE),
    meta: {
      loadedChunkIds: ["level-six", "stairwell", "level-three"],
    },
  };
}

describe("teleportation pads", () => {
  it("denies terminal destinations without an authorized badge", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    let state = setPlayerRoom(createInitialState(INITIAL_WORLD), "TPADTerminal");
    const setGameState: React.Dispatch<React.SetStateAction<GameState>> = (
      updater,
    ) => {
      state = typeof updater === "function" ? updater(state) : updater;
    };

    render(
      <TeleportationTerminalModal
        state={state}
        setGameState={setGameState}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: /medical lab/i }));

    expect(state.player.roomId).toBe("TPADTerminal");
    expect(getLastLogEntry(state)).toContain("Unauthorized");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("allows terminal destinations with an authorized badge", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    let state = setInventory(
      setPlayerRoom(createInitialState(INITIAL_WORLD), "TPADTerminal"),
      ["bluebadge"],
    );
    const setGameState: React.Dispatch<React.SetStateAction<GameState>> = (
      updater,
    ) => {
      state = typeof updater === "function" ? updater(state) : updater;
    };

    render(
      <TeleportationTerminalModal
        state={state}
        setGameState={setGameState}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: /medical lab/i }));

    await waitFor(() => {
      expect(state.player.roomId).toBe("Lab");
    });
    expect(getLastLogEntry(state)).toContain("Lab");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("loads a missing destination chunk before moving from a disk", async () => {
    const base = createInitialState(INITIAL_WORLD);
    const start = setInventory(
      withPoweredTeleportPads(setPlayerRoom(base, "TPADTerminal")),
      ["greenbadge"],
    );

    expect(start.world.rooms.some((room) => room.id === "ParkCenter")).toBe(
      false,
    );

    const next = await runCommand(start, "stand on green disk");

    expect(next.player.roomId).toBe("ParkCenter");
    expect(next.world.rooms.some((room) => room.id === "ParkCenter")).toBe(
      true,
    );
    expect(getLastLogEntry(next)).toContain("You stand on the disk");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(1);
  });

  it("normalizes legacy HydroponicsOne pad destinations to the real room", async () => {
    const base = createInitialState(createLevelThreeLoadedWorld());
    const legacyState = setInventory(
      withPoweredTeleportPads(setPlayerRoom(base, "ParkCenter")),
      ["greenbadge"],
    );
    const start: GameState = {
      ...legacyState,
      world: {
        ...legacyState.world,
        items: legacyState.world.items.map((item) =>
          item.id === "GreenTPADHydroponicsOne"
            ? { ...item, location: "HydroponicsOne" }
            : item,
        ),
      },
      itemState: {
        ...legacyState.itemState,
        itemRoomId: {
          ...legacyState.itemState.itemRoomId,
          GreenTPADHydroponicsOne: "HydroponicsOne",
        },
      },
    };

    const next = await runCommand(start, "stand on disk");

    expect(next.player.roomId).toBe("UnderWebOne");
    expect(getLastLogEntry(next)).toContain("Web Underhang");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(1);
  });

  it("moves from the Medical Lab blue disk to the next medical endpoint", async () => {
    const start = setInventory(
      withPoweredTeleportPads(createTestState({ roomId: "Lab" })),
      ["bluebadge"],
    );

    const next = await runCommand(start, "stand on disk");

    expect(next.player.roomId).toBe("RemoteMedicalOne");
    expect(getLastLogEntry(next)).toContain("You stand on the disk");
    expect(getLastLogEntry(next)).toContain("Emergency Medical Facility");
  });

  it("opens the translocation overlay with use terminal", async () => {
    const start = createTestState({ roomId: "TPADTerminal" });

    const next = await runCommand(start, "use terminal");

    expect(useUIOverlayStore.getState().overlay.kind).toBe(
      "teleportation-terminal",
    );
    expect(getLastLogEntry(next)).toContain(
      "You open the translocation terminal.",
    );
  });
});
