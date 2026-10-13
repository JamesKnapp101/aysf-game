import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../game/Game";
import * as engine from "../game/engine/handleCommand";
import { saveResumeSnapshot } from "../game/persistence/resumeStorage";
import { updateItemLocation } from "../game/rules/items";
import { setInventory } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession } from "./helpers/headlessOverlayHelpers";

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});

describe("device aliases in browser and headless sessions", () => {
  it.each([
    "look through the gap",
    "look through the hole",
    "examine the fallen corpse",
    "use the scanner on the fallen corpse",
    "sample the fallen corpse with the wand",
    "turn on the radio",
    "use scanner on fallen corpse",
    "point scanner at fallen corpse",
    "use wand on fallen corpse",
    "sample fallen corpse with wand",
    "swab fallen corpse with wand",
    "turn on radio",
    "turn on walkie-talkie",
  ])("uses the same native parser and dispatch exactly once for %s", async (input) => {
    const equipment = ["MindGun", "MindCap", "DNAReader", "Radio"];
    let initial = setInventory(overlayFixture([]), equipment);
    if (input.startsWith("look through")) {
      // The headless session requires the production starting room. Place the
      // real gap there for client parity; the zone test uses its actual room.
      initial = updateItemLocation(initial, "LevelSixCorridorEndDoorGap", initial.player.roomId);
    }
    for (const id of equipment) initial = updateItemLocation(initial, id, "INVENTORY");
    initial.itemState.wornByPlayer.head = "MindCap";
    const controller = overlaySession(initial);
    const command = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command(input);
    expect(command).toHaveBeenCalledTimes(1);
    const before = command.mock.calls[0][0];
    const expected = await command.mock.results[0].value;
    expect(saveResumeSnapshot(before)).toBe(true);

    const user = userEvent.setup();
    const { container } = render(<Game />);
    await waitFor(() => expect(container.querySelector(".game-input")).toBeTruthy());
    await user.type(container.querySelector(".game-input") as HTMLInputElement, `${input}{enter}`);
    await waitFor(() => expect(command).toHaveBeenCalledTimes(2));
    const actual = await command.mock.results[1].value;

    expect(actual.player).toEqual(expected.player);
    expect(actual.itemState).toEqual(expected.itemState);
    expect(actual.worldState).toEqual(expected.worldState);
    expect(actual.radio).toEqual(expected.radio);
    expect(actual.moves).toBe(expected.moves);
    expect(actual.score).toBe(expected.score);
    expect(actual.log).toEqual(expected.log);
    // Both clients send the original parsed syntax to the shared semantic parser.
    expect(command.mock.calls[1][1]).toEqual(command.mock.calls[0][1]);
    expect(command.mock.calls[0][1]).toMatchObject({ type: "action", raw: input });
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect((await overlayHistory(controller)).map((entry) => entry.input)).toEqual([undefined, input]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
