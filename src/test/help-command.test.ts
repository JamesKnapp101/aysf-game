import { useUIOverlayStore } from "@game/store/store";
import { describe, expect, it } from "vitest";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

describe("help command", () => {
  it("opens the help overlay without advancing the turn counter", async () => {
    useUIOverlayStore.getState().closeOverlay();

    const start = createTestState({ roomId: "StairWellSeven" });
    const next = await runCommand(start, "help");

    expect(next.moves).toBe(start.moves);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("help");
    expect(next.log.at(-1)).toContain("> help");
  });
});
