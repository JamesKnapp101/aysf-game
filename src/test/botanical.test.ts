import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

function getCommandEntry(state: { log: string[] }, command: string): string {
  for (let index = state.log.length - 1; index >= 0; index -= 1) {
    const entry = state.log[index];
    if (entry.includes(`> ${command}`)) return entry;
  }

  return "";
}

describe("botanical garden", () => {
  it("breaks BotanicalOne into scenery that can be examined", async () => {
    const state = createTestState({ roomId: "BotanicalOne" });
    const description = buildRoomDescription(state, "BotanicalOne", {
      forceFull: true,
      mode: "panel",
    });

    expect(description).not.toContain("[[SCENERY]]");
    expect(description).toContain("stone-paved paths");
    expect(description).toContain("beautifully landscaped beds");
    expect(description).toContain("tall wooden plaque");
    expect(description).toContain("large commercial greenhouse");
    expect(description).toContain("open cave mouth");
    expect(description).toContain("SEED BANK");

    const examinedPlaques = await runCommand(state, "examine plaques");
    expect(getCommandEntry(examinedPlaques, "examine plaques")).toContain(
      "botanical name",
    );

    const examinedSeedBank = await runCommand(state, "examine seed bank");
    expect(getCommandEntry(examinedSeedBank, "examine seed bank")).toContain(
      "double doors",
    );
  });
});
