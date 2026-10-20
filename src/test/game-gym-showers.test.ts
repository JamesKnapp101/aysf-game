import { ACTION_HANDLERS } from "@game/actions";
import { resolveItemByNoun } from "@game/rules/scope";
import { useUIOverlayStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { normalizeCommandAliases } from "../parse/commandAliases";
import { parseCommand } from "../parse/parser";
import { gymShowerItems } from "../world/maps/levelThree/Park/Gym/gymShowerItems";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

const faucetCommands = ["turn faucet", "turn on faucet", "turn on water"];
const dryResponse = "Nothing happens. Not even a drip.";
const interactions: [string, string][] = [
  ...["shower", "showers"].map((noun): [string, string] => [
    `examine ${noun}`,
    "It's a tiled communal shower with a series of showerheads and faucets at regular intervals. Everything is totally dry at the minute.",
  ]),
  ...["showerhead", "showerheads"].map((noun): [string, string] => [
    `examine ${noun}`,
    "The showerheads are adjustable, with multi-spray settings.",
  ]),
  ...["faucet", "faucets"].map((noun): [string, string] => [
    `examine ${noun}`,
    "Standard hot and cold.",
  ]),
  ...["bench", "benches"].map((noun): [string, string] => [
    `examine ${noun}`,
    "The wooden surface is well worn.",
  ]),
  ...faucetCommands.map((command): [string, string] => [command, dryResponse]),
];

describe.each([
  ["MensShower", "southeast"],
  ["WomensShower", "southwest"],
])("Gym shower scenery in %s", (roomId, exitDirection) => {
  it.each(interactions)("responds exactly to %s", async (command, response) => {
    const state = createTestState({ roomId });
    const next = await runCommand(state, command);

    expect(getLastLogEntry(next).trim()).toBe(`> ${command}\n${response}`);
  });

  it.each(faucetCommands)("keeps %s stateless on repeated attempts", async (command) => {
    let state = createTestState({ roomId });

    for (let attempt = 0; attempt < 2; attempt++) {
      const normalized = normalizeCommandAliases(state, parseCommand(command));
      expect(normalized).toMatchObject({ type: "action", verb: "turn" });
      // Check the action itself separately from the engine's normal turn ticks.
      const action = await ACTION_HANDLERS.turn(state, normalized);
      expect(action.state).toBe(state);
      expect(action.message).toBe(dryResponse);

      const waited = await runCommand(state, "wait");
      const next = await runCommand(state, command);
      expect(getLastLogEntry(next).trim()).toBe(`> ${command}\n${dryResponse}`);
      expect(next.itemState).toEqual(waited.itemState);
      expect(next.worldState).toEqual(waited.worldState);
      expect(next.player.inventory).toEqual(state.player.inventory);
      expect(next.player.roomId).toBe(roomId);
      state = next;
    }
  });

  it.each([false, true])("preserves room rendering (SCENERY placeholder: %s)", (withPlaceholder) => {
    const state = createTestState({ roomId });
    if (withPlaceholder) {
      state.world = {
        ...state.world,
        rooms: state.world.rooms.map((room) =>
          room.id === roomId
            ? { ...room, description: `${room.description} [[SCENERY]]` }
            : room,
        ),
      };
    }
    const withoutNewScenery = {
      ...state,
      world: {
        ...state.world,
        items: state.world.items.filter((item) =>
          !gymShowerItems.some((scenery) => scenery.id === item.id),
        ),
      },
    };

    for (const mode of ["log", "panel"] as const) {
      const options = { mode, forceFull: true };
      expect(buildRoomDescription(state, roomId, options)).toBe(
        buildRoomDescription(withoutNewScenery, roomId, options),
      );
      expect(buildRoomDescription(state, roomId, options)).toContain(
        "Against the far wall is a grid of small lockers, four across and four down.",
      );
    }
  });

  it("preserves existing lockers and the exit back to the gym", async () => {
    const state = createTestState({ roomId });
    const examined = await runCommand(state, "examine lockers");
    expect(useUIOverlayStore.getState().overlay).toMatchObject({
      kind: roomId === "MensShower" ? "mens-lockers" : "womens-lockers",
    });
    useUIOverlayStore.getState().closeOverlay();
    expect(state.world.rooms.find((room) => room.id === roomId)?.exits).toEqual([
      { direction: exitDirection, toRoomId: "Gym" },
    ]);
    const exited = await runCommand(examined, exitDirection);
    expect(exited.player.roomId).toBe("Gym");
  });
});

it("registers room-scoped scenery without description contributions or ordering", () => {
  const state = createTestState({ roomId: "GymEntrance" });
  expect(gymShowerItems).toHaveLength(8);
  for (const item of gymShowerItems) {
    expect(state.world.items.filter((candidate) => candidate.id === item.id)).toHaveLength(1);
    expect(item.itemCategory).toBe("scenery");
    expect(item).not.toHaveProperty("sceneryDescription");
    expect(item.meta).toBeUndefined();
    for (const noun of item.vocab) {
      expect(resolveItemByNoun(state, noun)).toBeUndefined();
      const inRoom = createTestState({ roomId: item.location });
      expect(resolveItemByNoun(inRoom, noun)?.id).toBe(item.id);
    }
  }
});
