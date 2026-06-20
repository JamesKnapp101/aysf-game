import {
  NPC_IDLE_ACTION_CHANCE,
  tickNpcIdleActions,
} from "@game/engine/ticks/npcIdleActionsTick";
import { advanceTurn } from "@game/engine/turn";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe("NPC idle actions", () => {
  it("occasionally logs a randomly selected action for an NPC in the room", () => {
    const state = createTestState({
      roomId: "GymWeightRoom",
      rng: sequenceRng([1 - NPC_IDLE_ACTION_CHANCE / 2, 0, 0.99]),
    });
    const spotBot = state.world.items.find((item) => item.id === "SpotBot")!;

    const next = tickNpcIdleActions(state);

    expect(next.log.at(-1)).toBe(spotBot.idleActions?.[4]);
  });

  it("stays quiet when the chance misses or the NPC is elsewhere", () => {
    const missed = tickNpcIdleActions(
      createTestState({ roomId: "GymWeightRoom", rng: () => 0 }),
    );
    const elsewhere = tickNpcIdleActions(
      createTestState({ roomId: "Gym", rng: () => 0 }),
    );

    expect(missed.log).toEqual([]);
    expect(elsewhere.log).toEqual([]);
  });

  it("runs as part of the normal turn cycle", () => {
    const state = createTestState({
      roomId: "GymWeightRoom",
      rng: () => 0.99,
    });

    const next = advanceTurn(state);

    expect(next.log).toContain(
      "The robot gives the weight bench an encouraging slap, as if trying to motivate it.",
    );
  });

  it("gives every robot NPC exactly five idle actions", () => {
    const state = createTestState();
    const robotIds = [
      "BarBot",
      "LonelyBot",
      "NailBot",
      "RangerBot",
      "SpotBot",
      "TrashBot",
      "UsherBot",
    ];

    for (const robotId of robotIds) {
      const robot = state.world.items.find((item) => item.id === robotId);
      expect(robot?.idleActions, robotId).toHaveLength(5);
      expect(robot?.idleActions?.every((action) => action.trim().length > 0)).toBe(
        true,
      );
    }
  });
});
