import { doExamine } from "@game/actions/examine/examine";
import { InventoryTree } from "@game/components/InventoryTree";
import { ThreeDPrinterModal } from "@game/components/ThreeDPrinterModal";
import { updateItemLocation } from "@game/rules/items";
import { addToInventory, removeFromInventory } from "@game/rules/state";
import { getItemsInInventory } from "@game/selectors/itemSelectors";
import { useUIEffectsStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import {
  addAtumsToInventory,
  ATUM_CARTRIDGE_ITEM_ID,
  getCurrentAtumCount,
  getThreeDPrinterRecipe,
  getAtumCartridgeDisplayName,
  printThreeDPrinterRecipe,
  PRINTED_GLUE_GUN_ITEM_ID,
  PRINTED_WRENCH_ITEM_ID,
  setAtumCartridgeCount,
  takeAtumCartridge,
  THREE_D_PRINTER_TRAY_ITEM_ID,
} from "src/world/maps/levelSix/threeDPrinter";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

function createTestAtumCartridge(id: string, count: number): Item {
  return {
    id,
    name: "cartridge of atums",
    named: getAtumCartridgeDisplayName,
    description: "A black printer atum cartridge.",
    location: "3DPrintingFacility",
    vocab: ["atum", "atums", "cartridge", "atum cartridge"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: {
      kind: "atum-cartridge",
      atumCount: count,
    },
    overrides: {
      take: takeAtumCartridge,
    },
  };
}

function withAtumCount(state: GameState, totalAtums: number): GameState {
  let next = setAtumCartridgeCount(state, totalAtums);

  if (totalAtums <= 0) {
    next = removeFromInventory(next, ATUM_CARTRIDGE_ITEM_ID);
    return updateItemLocation(next, ATUM_CARTRIDGE_ITEM_ID, "NOWHERE");
  }

  next = updateItemLocation(next, ATUM_CARTRIDGE_ITEM_ID, "INVENTORY");
  return addToInventory(next, ATUM_CARTRIDGE_ITEM_ID);
}

function renderPrinterHarness(initialState: GameState) {
  function Harness() {
    const [state, setState] = React.useState(initialState);
    const [closed, setClosed] = React.useState(false);

    return (
      <>
        {!closed && (
          <ThreeDPrinterModal
            onClose={() => setClosed(true)}
            state={state}
            setGameState={setState}
          />
        )}
        <div data-testid="closed">{String(closed)}</div>
        <div data-testid="atum-count">{getCurrentAtumCount(state)}</div>
        <div data-testid="tray-contents">
          {(state.itemState.surfaceContents[THREE_D_PRINTER_TRAY_ITEM_ID] ?? [])
            .join(",")}
        </div>
        <div data-testid="log">{state.log.join("\n")}</div>
      </>
    );
  }

  return render(<Harness />);
}

function placeAtumCartridge(
  state: GameState,
  options: { inventoryCount?: number; roomCount?: number },
): GameState {
  let next = withAtumCount(state, options.inventoryCount ?? 0);

  if (options.roomCount !== undefined) {
    next = setAtumCartridgeCount(next, options.roomCount);
    next = removeFromInventory(next, ATUM_CARTRIDGE_ITEM_ID);
    next = updateItemLocation(next, ATUM_CARTRIDGE_ITEM_ID, next.player.roomId);
  }

  return next;
}

function addFoundAtumCartridge(state: GameState, count: number): GameState {
  const found = createTestAtumCartridge("TestAtumCartridge", count);

  return {
    ...state,
    world: {
      ...state.world,
      items: [...state.world.items, found],
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [found.id]: state.player.roomId,
      },
    },
  };
}

function renderInventoryTree(state: GameState) {
  render(
    <InventoryTree state={state} inventoryItems={getItemsInInventory(state)} />,
  );
}

describe("3D printer", () => {
  it("starts the player with three atums", () => {
    const state = createTestState({ roomId: "3DPrintingFacility" });

    expect(getCurrentAtumCount(state)).toBe(3);
    expect(state.player.inventory.general).toContain(ATUM_CARTRIDGE_ITEM_ID);
    expect(
      state.player.inventory.general.filter((itemId) =>
        itemId.toLowerCase().startsWith("atum"),
      ),
    ).toEqual([ATUM_CARTRIDGE_ITEM_ID]);
  });

  it("groups atums in the room as a counted cartridge", () => {
    const state = placeAtumCartridge(
      createTestState({ roomId: "3DPrintingFacility" }),
      {
        roomCount: 2,
      },
    );

    const description = buildRoomDescription(
      state,
      "3DPrintingFacility",
      { forceFull: true },
    );

    expect(description).toContain("There is a cartridge of atums (2) here.");
    expect(description.match(/cartridge of atums/g)).toHaveLength(1);
  });

  it.each(["get atums", "get cartridge"])(
    "merges a found atum cartridge into the inventory with %s",
    async (command) => {
      const state = addFoundAtumCartridge(
        withAtumCount(createTestState({ roomId: "3DPrintingFacility" }), 1),
        2,
      );

      const next = await runCommand(state, command);

      expect(getCurrentAtumCount(next)).toBe(3);
      expect(next.player.inventory.general).toContain(ATUM_CARTRIDGE_ITEM_ID);
      expect(next.player.inventory.general).not.toContain("TestAtumCartridge");
      expect(next.itemState.itemRoomId.TestAtumCartridge).toBe("NOWHERE");

      renderInventoryTree(next);

      expect(screen.getByText("a cartridge of atums (3)")).toBeInTheDocument();
      expect(screen.getAllByText(/cartridge of atums/)).toHaveLength(1);
    },
  );

  it("keeps remaining atums grouped after the printer spends from the cartridge", () => {
    const state = withAtumCount(
      createTestState({ roomId: "3DPrintingFacility" }),
      16,
    );

    const result = printThreeDPrinterRecipe(state, "wrench");

    expect(result.printed).toBe(true);
    expect(getCurrentAtumCount(result.state)).toBe(1);

    renderInventoryTree(result.state);

    expect(screen.getByText("a cartridge of atums (1)")).toBeInTheDocument();
    expect(screen.getAllByText(/cartridge of atums/)).toHaveLength(1);
  });

  it("prints the glue gun dummy item onto the tray", () => {
    const recipe = getThreeDPrinterRecipe("glue-gun");
    expect(recipe?.itemId).toBe(PRINTED_GLUE_GUN_ITEM_ID);

    const state = withAtumCount(
      createTestState({ roomId: "3DPrintingFacility" }),
      recipe?.atumCost ?? 0,
    );

    const result = printThreeDPrinterRecipe(state, "glue-gun");

    expect(result.printed).toBe(true);
    expect(result.message).toContain("printed glue gun");
    expect(
      result.state.itemState.surfaceContents[THREE_D_PRINTER_TRAY_ITEM_ID],
    ).toContain(PRINTED_GLUE_GUN_ITEM_ID);
  });

  it("can add atums back into the cartridge after it has been spent empty", () => {
    const empty = printThreeDPrinterRecipe(
      withAtumCount(createTestState({ roomId: "3DPrintingFacility" }), 3),
      "glue-gun",
    ).state;

    expect(getCurrentAtumCount(empty)).toBe(0);
    expect(empty.player.inventory.general).not.toContain(ATUM_CARTRIDGE_ITEM_ID);

    const refilled = addAtumsToInventory(empty, 2);

    expect(getCurrentAtumCount(refilled)).toBe(2);
    expect(refilled.player.inventory.general).toContain(ATUM_CARTRIDGE_ITEM_ID);
  });

  it("opens the printer overlay when examined", () => {
    const state = createTestState({ roomId: "3DPrintingFacility" });

    const result = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "printer",
      raw: "examine printer",
    });

    expect(result.overlay).toMatchObject({ kind: "3d-printer" });
  });

  it("disables print with no selection and with insufficient atums", async () => {
    const user = userEvent.setup();
    const state = createTestState({ roomId: "3DPrintingFacility" });

    render(
      <ThreeDPrinterModal
        onClose={() => undefined}
        state={state}
        setGameState={() => undefined}
      />,
    );

    const printButton = screen.getByRole("button", { name: "PRINT" });
    expect(printButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /wrench, 15 atums/i }));

    expect(printButton).toBeDisabled();
  });

  it("spends atums, flashes, closes, logs, and moves the print to the tray", async () => {
    const user = userEvent.setup();
    const state = withAtumCount(
      createTestState({ roomId: "3DPrintingFacility" }),
      15,
    );
    const flashBefore = useUIEffectsStore.getState().teleportFlashNonce;

    renderPrinterHarness(state);

    await user.click(screen.getByRole("button", { name: /wrench, 15 atums/i }));

    const printButton = screen.getByRole("button", { name: "PRINT" });
    expect(printButton).toBeEnabled();

    await user.click(printButton);

    await waitFor(() => {
      expect(screen.getByTestId("closed")).toHaveTextContent("true");
      expect(screen.getByTestId("atum-count")).toHaveTextContent("0");
    });
    expect(screen.getByTestId("tray-contents")).toHaveTextContent(
      PRINTED_WRENCH_ITEM_ID,
    );
    expect(screen.getByTestId("log")).toHaveTextContent("printed wrench");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(
      flashBefore + 1,
    );
  });
});
