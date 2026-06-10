import { describe, expect, it } from "vitest";
import { resolveItemByNoun } from "@game/rules/scope";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("restaurant", () => {
  it("keeps the men's room stall corpse hidden until the stall is inspected", async () => {
    const state = createTestState({ roomId: "MensRoom" });

    expect(resolveItemByNoun(state, "washlet")).toBeUndefined();

    const inspected = await runCommand(state, "look under stall");

    expect(getLastLogEntry(inspected)).toContain(
      "The boots are attached to a body",
    );
    expect(resolveItemByNoun(inspected, "washlet")?.id).toBe(
      "RestaurantMensStallToilet",
    );
  });
});
