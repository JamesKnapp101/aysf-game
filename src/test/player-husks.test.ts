import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import {
  getPlayerHuskMeta,
  PLAYER_HUSK_LIFESPAN_TURNS,
  tickPlayerHusks,
} from "@game/helpers/playerHuskHelpers";
import { updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import { describe, expect, it } from "vitest";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

function createDeathHusk(): GameState {
  return triggerPlayerDeath(
    createTestState({
      roomId: "LevelSixCorridorEnd",
      visitedRooms: ["LevelSixCorridorEnd", "LevelSixCorridorBend"],
      rng: () => 0,
    }),
    "Everything goes wrong.",
    "test cause",
  );
}

function tickHuskTurn(state: GameState): GameState {
  const next = tickPlayerHusks(state);
  return { ...next, moves: next.moves + 1 };
}

function finishHuskLifespan(state: GameState): GameState {
  let next = tickHuskTurn(state);
  for (let turn = 0; turn < PLAYER_HUSK_LIFESPAN_TURNS; turn += 1) {
    next = tickHuskTurn(next);
  }
  return next;
}

describe("player regeneration husks", () => {
  it("starts the running count at the numbered opening husk", () => {
    const state = createTestState();
    const openingHusk = state.world.items.find((item) => item.id === "seed")!;
    const burnedHusk = state.world.items.find((item) => item.id === "seedTwo")!;

    expect(state.worldState.playerHuskCount).toBe(8);
    expect(openingHusk.description).toContain("008");
    expect(openingHusk.vocab).toEqual(
      expect.arrayContaining(["husk 8", "husk 008"]),
    );
    expect(getPlayerHuskMeta(openingHusk)).toMatchObject({
      number: 8,
      turnsRemaining: PLAYER_HUSK_LIFESPAN_TURNS,
    });
    expect(burnedHusk.description).toContain("007");
    expect(getPlayerHuskMeta(burnedHusk)?.number).toBe(7);
  });

  it("increments the count and gives every new husk a unique plate", () => {
    const firstDeath = createDeathHusk();
    const firstHusk = firstDeath.world.items.find(
      (item) => item.id === "playerRegenHusk009",
    )!;
    const returnedToDanger = {
      ...firstDeath,
      player: { ...firstDeath.player, roomId: "LevelSixCorridorEnd" },
    };
    const secondDeath = triggerPlayerDeath(
      returnedToDanger,
      "Everything goes wrong again.",
      "test cause",
    );
    const secondHusk = secondDeath.world.items.find(
      (item) => item.id === "playerRegenHusk010",
    )!;

    expect(firstDeath.worldState.playerHuskCount).toBe(9);
    expect(firstHusk.description).toContain("009");
    expect(getPlayerHuskMeta(firstHusk)).toMatchObject({
      createdAtMove: firstDeath.moves,
      number: 9,
      turnsRemaining: PLAYER_HUSK_LIFESPAN_TURNS,
    });
    expect(secondDeath.worldState.playerHuskCount).toBe(10);
    expect(secondHusk.description).toContain("010");
  });

  it("resolves a generated husk by its natural or plate number", async () => {
    const created = createDeathHusk();

    const natural = await runCommand(created, "examine husk 9");
    const plate = await runCommand(created, "examine husk 009");

    expect(natural.log.join("\n")).toContain("number plate");
    expect(plate.log.join("\n")).toContain("number plate");
  });

  it("dissolves after twenty subsequent turns and reports it in the room", () => {
    const created = createDeathHusk();
    const huskId = "playerRegenHusk009";
    const creationTurn = tickHuskTurn(created);
    const afterCreationMeta = getPlayerHuskMeta(
      creationTurn.world.items.find((item) => item.id === huskId)!,
    );
    let aging = creationTurn;

    expect(afterCreationMeta?.turnsRemaining).toBe(
      PLAYER_HUSK_LIFESPAN_TURNS,
    );

    for (let turn = 1; turn < PLAYER_HUSK_LIFESPAN_TURNS; turn += 1) {
      aging = tickHuskTurn(aging);
    }
    expect(aging.world.items.some((item) => item.id === huskId)).toBe(true);

    const dissolved = tickHuskTurn(aging);
    expect(dissolved.world.items.some((item) => item.id === huskId)).toBe(false);
    expect(dissolved.itemState.itemRoomId[huskId]).toBeUndefined();
    expect(dissolved.log.join("\n")).toContain(
      "husk marked 009 twitches",
    );
    expect(dissolved.log.join("\n")).toContain("dissolves into nothing");
  });

  it("removes a carried husk and reports its dissolution", () => {
    const created = createDeathHusk();
    const huskId = "playerRegenHusk009";
    const located = updateItemLocation(created, huskId, "INVENTORY");
    const carried = addToInventory(located, huskId);

    const dissolved = finishHuskLifespan(carried);

    expect(inventoryHas(dissolved.player.inventory, huskId)).toBe(false);
    expect(dissolved.world.items.some((item) => item.id === huskId)).toBe(false);
    expect(dissolved.log.join("\n")).toContain("inside your inventory");
  });

  it("dissolves silently when neither carried nor in the player's room", () => {
    const created = createDeathHusk();
    const elsewhere = {
      ...created,
      player: { ...created.player, roomId: "PowerGrid" },
      log: [],
    };

    const dissolved = finishHuskLifespan(elsewhere);

    expect(
      dissolved.world.items.some((item) => item.id === "playerRegenHusk009"),
    ).toBe(false);
    expect(dissolved.log).toEqual([]);
  });
});
