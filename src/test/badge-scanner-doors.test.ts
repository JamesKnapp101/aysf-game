import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACTION_HANDLERS } from "../game/actions";
import { handleCommand } from "../game/engine/handleCommand";
import { updateItemLocation } from "../game/rules/items";
import { canMoveThroughExit, tryCloseDoor, tryOpenDoor } from "../game/rules/doors";
import type { GameState } from "../game/types/gameTypes";
import type { Item } from "../game/types/itemTypes";
import { parseCommand } from "../parse/parser";
import { badgeScannerDoors } from "../world/doors/badgeScannerDoors";
import { badgeItems } from "../world/Items/badges";
import { createTestState, setInventory } from "./helpers/gameTestHelpers";

const READER = "It's some kind of electronic scanner that requires the correct badge before the door will open.";
const STRIPE = "It's a colored strip extending horizontally across the door at head height, indicating the security level of the door. You'll need to find a corresponding badge.";
const SWIPE = "You don't need to swipe the card, the scanner will detect any badges in your inventory.";
const SHOW = "The scanner will detect it automatically, there's no need to show it.";

async function command(state: GameState, input: string) {
  return handleCommand(state, parseCommand(input), { skipEcho: true });
}

function fixture(roomId = "LevelFourCorridorTwo") {
  return setInventory(createTestState({ roomId, rng: () => 0.99 }), ["bluebadge"]);
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});

afterEach(() => {
  expect(globalThis.fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe.each(badgeScannerDoors)("$id reader and stripe feedback", (door) => {
  const color = door.badgeItemId?.replace(/badge$/, "") ?? "violet";

  it.each([
    ["examine badge reader", READER],
    ["look at scanner", READER],
    ["inspect card reader", READER],
    ["x badge scanner", READER],
    ["examine stripe", STRIPE],
    ["look at strip", STRIPE],
    ["inspect colored band", STRIPE],
    [`examine ${color} stripe`, STRIPE],
    [`look at the ${color} horizontal strip`, STRIPE],
    [`inspect ${door.id}'s badge reader`, READER],
    [`examine stripe on ${door.id}`, STRIPE],
    [`look at the colored band on the ${door.id}`, STRIPE],
  ])("recognizes %s", async (input, response) => {
    const state = fixture(door.connects.roomAId);
    const next = await command(state, input!);
    expect(next.log.join("\n")).toContain(response);
    expect(next.worldState.doors).toEqual(state.worldState.doors);
    expect(next.player.inventory).toEqual(state.player.inventory);
  });

  it.each([
    ["touch badge reader with badge", SWIPE],
    ["swipe badge on reader", SWIPE],
    ["use badge on scanner", SWIPE],
    ["show badge to scanner", SHOW],
    ["show badge to badge reader", SHOW],
    ["present badge to reader", SHOW],
  ])("responds to an accessible badge: %s", async (input, response) => {
    const state = setInventory(fixture(door.connects.roomAId), ["bluebadge", "DNAReader", "MindGun"]);
    const next = await command(state, input!);
    expect(next.log.join("\n")).toContain(response);
    expect(next.worldState.doors).toEqual(state.worldState.doors);
    expect(next.player.inventory).toEqual(state.player.inventory);
  });

  it("keeps its existing whole-door description", async () => {
    for (const roomId of [door.connects.roomAId, door.connects.roomBId]) {
      const state = fixture(roomId);
      const result = await ACTION_HANDLERS.examine(state, parseCommand(`examine ${door.id}`));
      const expected = door.describe?.(state, { kind: "door", doorId: door.id, roomId }) ??
        (roomId === door.connects.roomAId ? door.descriptionFromA : door.descriptionFromB);
      expect(result.message).toBe(expected);
    }
  });

  it("does not invent parts on the reverse side", async () => {
    const state = fixture(door.connects.roomBId);
    // Another door on this corridor may legitimately have its own reader.
    for (const input of [`examine ${door.id}'s badge reader`, `examine ${door.id}'s stripe`, `show badge to ${door.id}'s scanner`]) {
      const next = await command(state, input);
      expect(next.log.join("\n")).not.toContain(READER);
      expect(next.log.join("\n")).not.toContain(STRIPE);
      expect(next.log.join("\n")).not.toContain(SHOW);
    }
  });
});

describe("badge accessibility and command variations", () => {
  describe.each([
    ["badge only", ["whitebadge"]],
    ["DNA sampler carried", ["whitebadge", "DNAReader"]],
    ["memory scanner carried", ["whitebadge", "MindGun"]],
    ["both handheld readers carried", ["whitebadge", "DNAReader", "MindGun"]],
  ] as const)("level seven stair reader with %s", (_label, inventory) => {
    it.each([
      "touch white on reader",
      "touch white to reader",
      "touch white badge to reader",
      "swipe reader with white badge",
      "touch reader with white badge",
      "use white on scanner",
      "show white to reader",
    ])("responds to %s without changing security or handheld devices", async (input) => {
      const state = setInventory(fixture("LevelSevenStairAccess"), [...inventory]);
      const next = await command(state, input);
      expect(next.log.join("\n")).toContain(input.startsWith("show") ? SHOW : SWIPE);
      expect(next.worldState.doors).toEqual(state.worldState.doors);
      expect(next.player.inventory).toEqual(state.player.inventory);
      expect(next.player.dnaBank).toEqual(state.player.dnaBank);
      expect(next.itemState.mindGunMemoryIndex).toEqual(state.itemState.mindGunMemoryIndex);
    });
  });

  it.each(badgeItems)("recognizes an accessible $id", async (badge) => {
    const state = setInventory(fixture(), [badge.id]);
    for (const [input, response] of [["use badge on scanner", SWIPE], ["present badge to reader", SHOW]]) {
      expect((await command(state, input!)).log.join("\n")).toContain(response);
    }
  });

  it.each([
    ["examine green stripe on botanical door", STRIPE],
    ["look at the orange band on the zoological door", STRIPE],
    ["examine west door's badge reader", READER],
    ["inspect card reader on north door", READER],
  ])("resolves parts when two security doors share a room: %s", async (input, response) => {
    const next = await command(fixture("LevelFourCorridorOne"), input!);
    expect(next.log.join("\n")).toContain(response);
  });

  it("does not attach a stripe to the wrong door in a shared room", async () => {
    const next = await command(fixture("LevelFourCorridorOne"), "examine green stripe on zoological door");
    expect(next.log.join("\n")).toContain("You don't see that here.");
  });

  it.each([
    ["Touch the badge reader with the blue badge", SWIPE],
    ["Swipe the blue badge on the card reader", SWIPE],
    ["Use the blue badge on the scanner", SWIPE],
    ["touch badge on scanner", SWIPE],
    ["swipe badge at badge scanner", SWIPE],
    ["show the blue badge to the scanner", SHOW],
    ["present the blue badge to the badge reader", SHOW],
    ["look badge reader", READER],
    ["inspect the door's card reader", READER],
    ["look at the door's yellow band", STRIPE],
  ])("recognizes %s", async (input, response) => {
    const next = await command(fixture(), input!);
    expect(next.log.join("\n")).toContain(response);
  });

  it.each(["inventory", "room", "open container", "closed container", "elsewhere"])(
    "uses ordinary badge scope: %s", async (placement) => {
      let state = setInventory(fixture(), placement === "inventory" ? ["bluebadge"] : []);
      if (placement === "room") state = updateItemLocation(state, "bluebadge", state.player.roomId);
      if (placement.includes("container")) {
        const box: Item = {
          id: "test-badge-box", name: "box", vocab: ["box"], description: "A test container.",
          location: state.player.roomId, itemCategory: "scenery", itemClass: "solid",
          itemSize: 1, itemWeight: 1, isContainer: true, isOpenable: true,
        };
        state = { ...state, world: { ...state.world, items: [...state.world.items, box] } };
        state = updateItemLocation(state, "bluebadge", box.id);
        state.itemState.openItems[box.id] = placement === "open container";
      }
      if (placement === "elsewhere") state = updateItemLocation(state, "bluebadge", "Lab");
      const available = ["inventory", "room", "open container"].includes(placement);
      for (const input of [
        "touch reader with blue badge", "swipe blue badge on reader",
        "use blue badge on scanner", "show blue badge to reader", "present blue badge to reader",
      ]) {
        const next = await command(state, input);
        const expected = /^(show|present)/.test(input) ? SHOW : SWIPE;
        if (available) expect(next.log.join("\n")).toContain(expected);
        else {
          expect(next.log.join("\n")).not.toContain(expected);
          expect(next.log.join("\n")).toContain("You aren't carrying that.");
        }
        expect(next.player.inventory).toEqual(state.player.inventory);
        expect(next.worldState.doors).toEqual(state.worldState.doors);
      }
    },
  );

  it("preserves LOOK's turn cost", async () => {
    const state = fixture();
    expect((await command(state, "look at badge reader")).moves).toBe(state.moves);
    expect((await command(state, "examine stripe")).moves).toBe(state.moves + 1);
  });
});

describe("security behavior stays unchanged", () => {
  it.each(badgeScannerDoors)("preserves $id opening, closing, and passage", async (door) => {
    for (const badges of [[], ["inframaroonbadge"], door.badgeItemId ? [door.badgeItemId] : []]) {
      const state = setInventory(fixture(door.connects.roomAId), badges);
      const next = await command(state, "examine badge reader");
      const initialDoor = state.worldState.doors[door.id]!;
      const nextDoor = next.worldState.doors[door.id]!;
      const exit = state.world.rooms.find((room) => room.id === state.player.roomId)!
        .exits.find((entry) => entry.doorId === door.id)!;

      const expectedOpen = tryOpenDoor(state, door, initialDoor);
      const actualOpen = await ACTION_HANDLERS.open(next, parseCommand(`open ${door.id}`));
      expect(actualOpen.message).toBe(expectedOpen.message);
      expect(actualOpen.state.worldState.doors).toEqual(expectedOpen.state.worldState.doors);

      const expectedClose = tryCloseDoor(state, door, initialDoor);
      const actualClose = await ACTION_HANDLERS.close(next, parseCommand(`close ${door.id}`));
      expect(actualClose.message).toBe(expectedClose.message);
      expect(actualClose.state.worldState.doors).toEqual(expectedClose.state.worldState.doors);
      expect(canMoveThroughExit(next, exit, door, nextDoor, exit.direction)).toEqual(
        canMoveThroughExit(state, exit, door, initialDoor, exit.direction),
      );
      if (door.kind === "badgeScanner" && door.checkBadgeOnDir === exit.direction) {
        expect(canMoveThroughExit(next, exit, door, nextDoor, exit.direction).allowed)
          .toBe(badges.includes(door.badgeItemId!));
      }
    }
  });

  it("feedback with the wrong badge does not grant access", async () => {
    let state = fixture(); // blue badge at the yellow Power Grid door
    for (const input of ["swipe badge on scanner", "show badge to reader", "use badge on scanner"]) {
      state = await command(state, input);
    }
    const blocked = await command(state, "south");
    expect(blocked.player.roomId).toBe("LevelFourCorridorTwo");
    expect(blocked.log.join("\n")).toContain("badge scanner emits a flat buzz");
    const allowed = await command(setInventory(state, ["yellowbadge"]), "south");
    expect(allowed.player.roomId).toBe("PowerGrid");
  });

  it("does not let a visible badge replace one in inventory for automatic detection", async () => {
    const state = updateItemLocation(setInventory(fixture(), []), "yellowbadge", "LevelFourCorridorTwo");
    const shown = await command(state, "show yellow badge to reader");
    expect(shown.log.join("\n")).toContain(SHOW);
    const blocked = await command(shown, "south");
    expect(blocked.player.roomId).toBe("LevelFourCorridorTwo");
    expect(blocked.log.join("\n")).toContain("badge scanner emits a flat buzz");
  });
});

describe("unrelated objects and commands", () => {
  it("keeps explicit handheld references and examinations while next to a security reader", async () => {
    const state = setInventory(fixture("LevelSevenStairAccess"), ["whitebadge", "DNAReader", "MindGun"]);
    const reader = state.world.items.find((item) => item.id === "MindGun")!;
    expect((await command(state, "examine reader")).log.join("\n")).toContain(reader.description);
    for (const input of [
      "touch DNAReader with white badge", "touch MindGun with white badge",
      "use white on DNAReader", "show white to MindGun",
      "touch white badge with reader",
    ]) {
      const next = await command(state, input);
      expect(next.log.join("\n")).not.toContain(SWIPE);
      expect(next.log.join("\n")).not.toContain(SHOW);
    }
  });

  it("still requires an accessible badge when handheld readers share the alias", async () => {
    const state = updateItemLocation(
      setInventory(fixture("LevelSevenStairAccess"), ["DNAReader", "MindGun"]), "whitebadge", "Lab",
    );
    for (const input of [
      "touch white on reader", "touch white to reader", "touch white badge to reader",
      "swipe reader with white badge", "touch reader with white badge",
    ]) {
      const next = await command(state, input);
      expect(next.log.join("\n")).toContain("You aren't carrying that.");
      expect(next.log.join("\n")).not.toContain(SWIPE);
      expect(next.worldState.doors).toEqual(state.worldState.doors);
    }
  });

  it.each(["badge reader", "scanner", "stripe", "colored band"])(
    "gives a real scoped %s priority", async (name) => {
      const base = fixture();
      const item: Item = {
        id: "test-unrelated-object", name, vocab: [name], description: "An unrelated test object.",
        location: base.player.roomId, itemCategory: "scenery", itemClass: "solid",
        itemSize: 1, itemWeight: 1,
      };
      const state = { ...base, world: { ...base.world, items: [...base.world.items, item] } };
      const next = await command(state, `examine ${name}`);
      expect(next.log.join("\n")).toContain(item.description);
      expect(next.log.join("\n")).not.toContain(READER);
      expect(next.log.join("\n")).not.toContain(STRIPE);
      const used = await command(state, `use badge on ${name}`);
      expect(used.log.join("\n")).not.toContain(SWIPE);
    },
  );

  it("does not attach scanner parts to other striped doors", async () => {
    for (const input of ["examine badge reader", "examine blue stripe", "show badge to reader"]) {
      const next = await command(fixture("StairTwo"), input);
      expect(next.log.join("\n")).not.toContain(READER);
      expect(next.log.join("\n")).not.toContain(STRIPE);
      expect(next.log.join("\n")).not.toContain(SHOW);
    }
  });

  it.each([
    "examine red stripe", "examine stripe on hatch", "examine striped shirt",
    "look through scanner", "show badge", "swipe badge on", "use badge on striped shirt",
    "present badge to door", "touch reader with flashlight", "unlock door with badge",
  ])("does not intercept unrelated or incomplete syntax: %s", async (input) => {
    const next = await command(fixture(), input);
    for (const response of [READER, STRIPE, SWIPE, SHOW]) {
      expect(next.log.join("\n")).not.toContain(response);
    }
  });
});
