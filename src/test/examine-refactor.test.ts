import { doExamine } from "@game/actions/examine/examine";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

describe("examine action refactor coverage", () => {
  it("opens the teleport terminal overlay through the special examine handler registry", () => {
    const state = createTestState({ roomId: "TPADTerminal" });

    const result = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "terminal",
      raw: "examine terminal",
    });

    expect(result.overlay).toMatchObject({
      kind: "teleportation-terminal",
    });
  });

  it("returns the no-power monitor description without opening an overlay", () => {
    const state = createTestState({ roomId: "PowerGrid" });

    const result = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "view screen",
      raw: "examine view screen",
    });

    expect(result.message).toBe("The viewscreen is currently dark.");
    expect(result.overlay).toBeUndefined();
  });

  it("applies fallen corpse memory side effects before the generic examine flow", () => {
    const state = createTestState({ roomId: "StairWellSeven" });

    const result = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "corpse",
      raw: "examine corpse",
    });

    expect(result.state.player.memoriesTriggered.seen_self).toBe(true);
    expect(result.message).toMatch(/poor guy maybe slipped/i);
  });
});
