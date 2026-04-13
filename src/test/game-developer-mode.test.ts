import { describe, expect, it } from "vitest";
import { createTestState, expectInventoryToContain, runCommand } from "./helpers/gameTestHelpers";

const DEVELOPER_MODE_ITEM_IDS = [
  "inframaroonbadge",
  "ultravioletbadge",
  "maroonbadge",
  "violetbadge",
  "bluebadge",
  "orangebadge",
  "greenbadge",
  "yellowbadge",
  "whitebadge",
  "flashlight",
  "ParkPass",
] as const;

describe("Hidden developer mode command", () => {
  it("grants the developer loadout without consuming a turn", async () => {
    const start = {
      ...createTestState({ roomId: "InsideTheShed" }),
      moves: 12,
    };

    const next = await runCommand(start, "iljio");

    for (const itemId of DEVELOPER_MODE_ITEM_IDS) {
      expect(expectInventoryToContain(next, itemId)).toBe(true);
      expect(next.itemState.itemRoomId[itemId]).toBe("INVENTORY");
      expect(
        next.world.items.find((item) => item.id === itemId)?.location,
      ).toBe("INVENTORY");
    }

    expect(next.moves).toBe(12);
    expect(Object.values(next.itemState.containerContents).flat()).not.toContain(
      "ParkPass",
    );
    expect(Object.values(next.itemState.searchableContents).flat()).not.toContain(
      "ParkPass",
    );
    expect(next.log.at(-1)).toContain("> iljio");
    expect(next.log.at(-1)).toContain("Developer mode enabled. Test items granted.");
  });
});
