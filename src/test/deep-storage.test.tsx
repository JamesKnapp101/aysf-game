import { DeepStorageSuitOverlay } from "@game/components/DeepStorageSuitOverlay";
import { dispatchAction } from "@game/actions/dispatchAction";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LEVEL_SEVEN } from "../world/maps/LevelSeven";
import {
  DEEP_STORAGE_GRID_ROOM_ID,
  DEEP_STORAGE_HYPOTHERMIA_CAUSE,
  DEEP_STORAGE_SUIT_ITEM_ID,
  formatDeepStorageCoord,
  getDeepStorageDockForRoom,
  getDeepStorageState,
} from "../world/maps/levelSeven/deepStorage";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

function deepStorageState(roomId = "Stasis"): GameState {
  return createTestState({ roomId, visitedRooms: [roomId, "Stasis"] });
}

async function wearSuitAtStasis(): Promise<GameState> {
  return await runCommand(deepStorageState(), "wear suit");
}

function getDangerNotificationTexts(state: GameState): string[] {
  return state.uiState.notifications
    .filter((notification) => notification.kind === "danger")
    .map((notification) => notification.text);
}

describe("Level Seven deep storage", () => {
  it("uses one virtual grid room instead of the old authored grid rooms", () => {
    const gridRooms = LEVEL_SEVEN.rooms.filter((room) =>
      /^Grid[A-Z][0-9]+$/.test(room.id),
    );
    const virtualGrid = LEVEL_SEVEN.rooms.find(
      (room) => room.id === DEEP_STORAGE_GRID_ROOM_ID,
    );

    expect(gridRooms).toHaveLength(0);
    expect(virtualGrid).toBeDefined();
  });

  it("wears the docked suit and moves through the virtual grid by coordinate", async () => {
    const suited = await wearSuitAtStasis();

    expect(suited.player.roomId).toBe(DEEP_STORAGE_GRID_ROOM_ID);
    expect(suited.itemState.wornByPlayer.body).toBe(DEEP_STORAGE_SUIT_ITEM_ID);
    expect(suited.player.vitals.oxygen).toBe(100);
    expect(formatDeepStorageCoord(getDeepStorageState(suited).coord)).toBe("A1");

    const moved = await runCommand(suited, "east");

    expect(moved.player.roomId).toBe(DEEP_STORAGE_GRID_ROOM_ID);
    expect(moved.player.vitals.oxygen).toBe(99);
    expect(formatDeepStorageCoord(getDeepStorageState(moved).coord)).toBe("B1");
    expect(getLastLogEntry(moved)).toContain("wall marker ahead reads B1");
  });

  it("blocks inventory interaction while the player is sealed in the suit", async () => {
    const start = setInventory(await wearSuitAtStasis(), ["MysteriousNote"]);
    const next = await runCommand(start, "drop note");

    expect(next.player.inventory.general).toContain("MysteriousNote");
    expect(getLastLogEntry(next)).toContain("all you can do is move");
  });

  it("only removes the suit at a dock coordinate", async () => {
    const suited = await wearSuitAtStasis();
    const moved = await runCommand(suited, "east");
    const blocked = await runCommand(moved, "remove suit");

    expect(blocked.player.roomId).toBe(DEEP_STORAGE_GRID_ROOM_ID);
    expect(blocked.itemState.wornByPlayer.body).toBe(DEEP_STORAGE_SUIT_ITEM_ID);
    expect(getLastLogEntry(blocked)).toContain("will not open away from a dock");

    const returned = await runCommand(suited, "remove suit");

    expect(returned.player.roomId).toBe("Stasis");
    expect(returned.itemState.wornByPlayer.body).toBeUndefined();
    expect(returned.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "Stasis",
    );
  });

  it("kills an unprotected player in the grid within five turns", async () => {
    const doomed = await runCommands(deepStorageState(), [
      "south",
      "wait",
      "wait",
      "wait",
      "wait",
    ]);

    expect(doomed.player.roomId).toBe("Stasis");
    expect(doomed.worldState.playerDeaths[DEEP_STORAGE_GRID_ROOM_ID]?.cause).toBe(
      DEEP_STORAGE_HYPOTHERMIA_CAUSE,
    );
    expect(doomed.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "Stasis",
    );
    expect(doomed.player.vitals.temperature).toBe(98.6);
  });

  it("describes hidden docks at their grid coordinates and exits into regular rooms", async () => {
    const serviceDock = getDeepStorageDockForRoom("DeepStorageMedVault")!;
    const routeToDock = [
      "wear suit",
      ...Array(serviceDock.coord.x).fill("east"),
      ...Array(serviceDock.coord.y).fill("south"),
    ];
    const suitedAtDock = await runCommands(deepStorageState(), routeToDock);
    const atDock = await runCommand(suitedAtDock, "remove suit");
    const description = buildRoomDescription(atDock, atDock.player.roomId, {
      mode: "panel",
      forceFull: true,
    });
    const recordsBay = await runCommand(atDock, "east");

    expect(suitedAtDock.player.vitals.oxygen).toBe(100);
    expect(atDock.player.roomId).toBe("DeepStorageMedVault");
    expect(atDock.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "DeepStorageMedVault",
    );
    expect(description).toContain(
      `coordinate ${formatDeepStorageCoord(serviceDock.coord)}`,
    );
    expect(recordsBay.player.roomId).toBe("DeepStorageRecordsBay");
  });

  it("emergency recalls the suit after two empty oxygen grace turns", async () => {
    const suited = await wearSuitAtStasis();
    const nearlyEmpty: GameState = {
      ...suited,
      player: {
        ...suited.player,
        vitals: {
          ...suited.player.vitals,
          oxygen: 1,
        },
      },
      worldState: {
        ...suited.worldState,
        deepStorage: {
          ...getDeepStorageState(suited),
          coord: { x: 1, y: 0 },
          oxygenGraceTurns: 0,
        },
      },
    };

    const empty = await runCommand(nearlyEmpty, "east");
    const firstGasp = await runCommand(empty, "south");
    const secondGasp = await runCommand(firstGasp, "south");
    const recalled = await runCommand(secondGasp, "south");

    expect(empty.player.roomId).toBe(DEEP_STORAGE_GRID_ROOM_ID);
    expect(empty.player.vitals.oxygen).toBe(0);
    expect(getDangerNotificationTexts(empty)).toContain(
      "The suit oxygen reserve hits 0%. The next breath is thin, sour, and not enough.",
    );
    expect(getDeepStorageState(firstGasp).oxygenGraceTurns).toBe(1);
    expect(
      getDangerNotificationTexts(firstGasp).some((text) =>
        text.includes("stale pressure"),
      ),
    ).toBe(true);
    expect(getDeepStorageState(secondGasp).oxygenGraceTurns).toBe(2);
    expect(recalled.player.roomId).toBe("Stasis");
    expect(recalled.player.vitals.oxygen).toBe(100);
    expect(recalled.itemState.wornByPlayer.body).toBeUndefined();
    expect(recalled.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "Stasis",
    );
    expect(
      getDangerNotificationTexts(recalled).some((text) =>
        text.includes("Emergency recall fires"),
      ),
    ).toBe(true);
  });

  it("returns home through the registered suit HOME action", async () => {
    const suited = await runCommand(await wearSuitAtStasis(), "east");
    const result = await dispatchAction(suited, {
      payload: {},
      verb: "deepStorageHome",
    });

    expect(result.state.player.roomId).toBe("Stasis");
    expect(result.state.player.vitals.oxygen).toBe(100);
    expect(result.state.itemState.wornByPlayer.body).toBeUndefined();
    expect(result.state.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "Stasis",
    );
    expect(result.message).toContain("You hit HOME");
  });

  it("respawns hidden-area deaths at the nearest suit dock", async () => {
    const base = deepStorageState("DeepStorageRecordsBay");
    const start: GameState = {
      ...base,
      itemState: {
        ...base.itemState,
        itemRoomId: {
          ...base.itemState.itemRoomId,
          [DEEP_STORAGE_SUIT_ITEM_ID]: "DeepStorageMedVault",
        },
      },
    };

    const next = triggerPlayerDeath(
      start,
      "The records bay gets you.",
      "test hidden deep storage death",
    );

    expect(next.player.roomId).toBe("DeepStorageMedVault");
    expect(next.itemState.itemRoomId[DEEP_STORAGE_SUIT_ITEM_ID]).toBe(
      "DeepStorageMedVault",
    );
    expect(next.itemState.wornByPlayer.body).toBeUndefined();
  });

  it("renders the suit visor with dock-aware controls", async () => {
    const user = userEvent.setup();
    const onCommand = vi.fn();
    const onHome = vi.fn();
    const suited = await wearSuitAtStasis();

    render(
      <DeepStorageSuitOverlay
        state={suited}
        onCommand={onCommand}
        onHome={onHome}
      />,
    );

    expect(screen.getAllByText("A1").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Cryogenic Deep Storage Grid - A1"),
    ).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move north/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /remove suit/i }),
    ).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /home/i }));
    expect(onHome).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /move east/i }));
    expect(onCommand).toHaveBeenCalledWith("east");

    onCommand.mockClear();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onCommand).toHaveBeenCalledWith("east");

    onCommand.mockClear();
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(onCommand).not.toHaveBeenCalled();
  });
});
