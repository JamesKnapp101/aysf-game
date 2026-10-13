import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import { updateItemLocation } from "../game/rules/items";
import type { GameState } from "../game/types/gameTypes";
import type { Item } from "../game/types/itemTypes";
import { normalizeObjectReferences } from "../parse/objectReferences";
import { parseCommand } from "../parse/parser";
import { createTestState, setInventory } from "./helpers/gameTestHelpers";

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(123456789);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});
afterEach(() => {
  expect(globalThis.fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

async function equivalent(state: GameState, plain: string, articles: string) {
  const expected = await handleCommand(state, parseCommand(plain), { skipEcho: true });
  const actual = await handleCommand(state, parseCommand(articles), { skipEcho: true });
  // Includes narration, inventory, scoring, objectives, turn costs and NPC ticks.
  expect(actual).toEqual(expected);
  return actual;
}

function deviceFixture() {
  return updateItemLocation(setInventory(createTestState({ roomId: "StairWellSeven", rng: () => 0.99 }),
    ["MindGun", "MindCap", "DNAReader", "flashlight"]), "HalvedCorpse", "StairWellSeven");
}

function withItems(items: Partial<Item>[], state = createTestState()) {
  return {
    ...state,
    world: { ...state.world, items: [...state.world.items, ...items.map((item, index): Item => ({
      id: `article-test-${index}`, name: "control panel", vocab: [],
      description: `Test object ${index}`, location: state.player.roomId,
      itemClass: "solid", itemCategory: "scenery", itemSize: 1, itemWeight: 1,
      ...item,
    }))] },
  };
}

describe("optional articles in native object references", () => {
  it.each(["the", "a", "an"])("examines the same object with %s", async article => {
    const state = createTestState({ roomId: "LevelSixCorridorEnd" });
    const result = await equivalent(state, "examine gap", `examine ${article} gap`);
    expect(result.log.join("\n")).toContain("The damaged door has warped");
    expect(result.moves).toBe(state.moves + 1);
  });

  it.each(["take", "get", "pick up"])("keeps %s and its multiword noun", async verb => {
    const state = setInventory(createTestState({ roomId: "ThreeWestBed" }), []);
    const result = await equivalent(state, `${verb} research notes`, `${verb} the research notes`);
    expect(result.player.inventory.general).toContain("ResearchNotes");
    expect(result.moves).toBe(state.moves + 1);
  });

  it("takes the existing flashlight", async () => {
    const state = updateItemLocation(setInventory(createTestState({ roomId: "StairSix" }), []), "flashlight", "StairSix");
    const result = await equivalent(state, "take flashlight", "take the flashlight");
    expect(result.player.inventory.general).toContain("flashlight");
  });

  it("drops a carried item using the existing inventory resolver", async () => {
    const state = setInventory(createTestState({ roomId: "ThreeWestBed" }), ["ResearchNotes"]);
    const result = await equivalent(state, "drop research notes", "drop the research notes");
    expect(result.player.inventory.general).not.toContain("ResearchNotes");
    expect(result.itemState.itemRoomId.ResearchNotes).toBe("ThreeWestBed");
  });

  it.each(["examine", "x", "inspect", "check", "look at"])("keeps %s multiword resolution", async verb => {
    const state = createTestState({ roomId: "PreserveControl" });
    // Use the real control panel's location rather than assuming its room name.
    const panel = state.world.items.find(item => item.id === "GamePreserveControlPanel")!;
    const fixture = createTestState({ roomId: panel.location! });
    const result = await equivalent(fixture, `${verb} control panel`, `${verb} the control panel`);
    expect(result.log.join("\n")).not.toContain("don't see that");
  });

  it("opens and closes the same real door", async () => {
    const state = setInventory(createTestState({ roomId: "InsideTheShed" }), ["ShedCellarKey"]);
    const opened = await equivalent(state, "open hatch", "open the hatch");
    expect(opened.worldState.doors.ShedCellarDoor.isOpen).toBe(true);
    const closed = await equivalent(opened, "close hatch", "close the hatch");
    expect(closed.worldState.doors.ShedCellarDoor.isOpen).toBe(false);
  });

  it.each([
    "put the key in keyhole", "put key in the keyhole", "put the key in the keyhole",
    "insert the key into the keyhole",
  ])("keeps both object roles for %s", async input => {
    const state = setInventory(createTestState({ roomId: "PowerGrid" }), ["PowerStationKey"]);
    const result = await equivalent(state, "put key in keyhole", input);
    expect(result.itemState.containerContents.PowerStationKeyhole).toContain("PowerStationKey");
  });

  it.each([
    ["use scanner on woman", "use the scanner on woman"],
    ["use scanner on woman", "use scanner on the woman"],
    ["use scanner on woman", "use the scanner on the woman"],
    ["point scanner at woman", "point the scanner at the woman"],
    ["use wand on woman", "use the wand on the woman"],
    ["sample woman with wand", "sample the woman with the wand"],
    ["swab woman with wand", "swab the woman with the wand"],
    ["touch woman with wand", "touch the woman with the wand"],
  ])("keeps device aliases: %s", async (plain, input) => {
    const state = deviceFixture();
    state.itemState.wornByPlayer.head = "MindCap";
    await equivalent(state, plain, input);
  });

  it.each(["turn on", "switch on"])("runs %s exactly once", async verb => {
    const state = deviceFixture();
    const result = await equivalent(state, `${verb} flashlight`, `${verb} the flashlight`);
    expect(result.moves).toBe(state.moves + 1);
    expect(result.itemState.itemSettings.flashlight).toMatchObject({ isOn: true, currentCharge: 99.95 });
  });

  it.each([
    ["examine missing object", "examine the missing object"],
    ["use scanner on missing object", "use the scanner on the missing object"],
    ["use scanner on", "use the scanner on"],
    ["look through", "look through"],
    ["take", "take"],
    ["take research notes", "take the research notes"],
  ])("preserves missing/invalid object failures: %s", async (plain, input) => {
    await equivalent(deviceFixture(), plain, input);
  });

  it("preserves inventory prerequisites", async () => {
    const state = createTestState({ roomId: "PowerGrid" });
    await equivalent(state, "put key in keyhole", "put the key in the keyhole");
  });

  it("preserves reachability and closed-container visibility", async () => {
    let state = withItems([{ id: "article-box", name: "box", isContainer: true, isOpenable: true }], deviceFixture());
    state = updateItemLocation(state, "HalvedCorpse", "article-box");
    const result = await equivalent(state, "sample woman with wand", "sample the woman with the wand");
    expect(result.player.dnaBank).toHaveLength(0);
    await equivalent(setInventory(createTestState({ roomId: "HydroponicsPlatform" }), ["DNAReader"]),
      "sample spider with wand", "sample the spider with the wand");
  });

  it("prefers existing article-containing names and aliases", async () => {
    const state = withItems([
      { name: "panel" }, { name: "The Panel" },
      { name: "novel", vocab: ["a tale"] }, { name: "tale" },
      { name: "an instrument" }, { name: "instrument" },
      { name: "portrait of the captain" },
    ]);
    for (const noun of ["the panel", "a tale", "an instrument", "portrait of the captain"]) {
      const parsed = parseCommand(`examine ${noun}`);
      expect(normalizeObjectReferences(state, parsed).command).toBe(parsed);
    }
    const next = await handleCommand(state, parseCommand("examine the panel"));
    expect(next.log.at(-1)).toContain("Test object 1");
    const interior = await handleCommand(state, parseCommand("examine the portrait of the captain"));
    expect(interior.log.at(-1)).toContain("Test object 6");
  });

  it("does not choose an object from ambiguous fallback matches", async () => {
    const state = withItems([{ name: "red control panel", vocab: ["panel"] }, { name: "blue control panel", vocab: ["panel"] }]);
    const next = await handleCommand(state, parseCommand("examine the panel"));
    expect(next.log.at(-1)).toContain('Which object do you mean by "the panel"?');
    expect(next.log.at(-1)).not.toContain("Test object");
    expect(next.moves).toBe(state.moves);
    expect(next.itemState).toEqual(state.itemState);
    const specific = await equivalent(state, "examine red control panel", "examine the red control panel");
    expect(specific.log.at(-1)).toContain("Test object 0");
  });

  it("does not open an arbitrary door when the fallback is ambiguous", async () => {
    const state = createTestState({ roomId: "InsideTheShed" });
    const doors = ["red", "blue"].map(color => ({
      id: `${color}-hatch`, name: `${color} hatch`, vocab: ["hatch"],
      kind: "standard" as const,
      connects: { roomAId: state.player.roomId, roomBId: "StairWellSeven" },
    }));
    state.world = { ...state.world, doors: [...state.world.doors, ...doors],
      rooms: state.world.rooms.map(room => room.id !== state.player.roomId ? room : { ...room,
        exits: [{ direction: "north", doorId: "red-hatch" }, { direction: "south", doorId: "blue-hatch" }],
      }),
    };
    state.worldState.doors = { ...state.worldState.doors,
      ...Object.fromEntries(doors.map(door => [door.id, { id: door.id, isOpen: false, isLocked: false }])),
    };
    const next = await handleCommand(state, parseCommand("open the hatch"));
    expect(next.log.at(-1)).toContain('Which object do you mean by "the hatch"?');
    expect(next.worldState.doors).toEqual(state.worldState.doors);
    expect(next.moves).toBe(state.moves);
    const opened = await equivalent(state, "open red hatch", "open the red hatch");
    expect(opened.worldState.doors["red-hatch"].isOpen).toBe(true);
    expect(opened.worldState.doors["blue-hatch"].isOpen).toBe(false);
  });

  it.each([
    'say "the captain is a liar"', 'tell robot about the captain',
    'ask robot about an instrument', 'tell robot the man is dead',
    'authenticate the secret', 'submit an apple', 'password a tale',
    'order a drink', 'help the player', 'go the north',
    'examine "the panel"', 'take the all', 'examine the',
  ])("leaves free text, quotations and selectors unchanged: %s", input => {
    const parsed = parseCommand(input);
    expect(normalizeObjectReferences(deviceFixture(), parsed).command).toBe(parsed);
    if (parsed.type === "action") expect(parsed.raw).toBe(input);
  });

  it("preserves SET values and raw input for exact-text overrides", async () => {
    const override = vi.fn(({ state }: { state: GameState }) => ({ state, message: "Set once." }));
    const state = withItems([{ name: "control panel", isSettable: true, overrides: { set: override } }]);
    const input = "  SET the control panel TO the Secret  ";
    const next = await handleCommand(state, parseCommand(input));
    expect(override).toHaveBeenCalledTimes(1);
    expect(override.mock.calls[0][0]).toMatchObject({ cmd: {
      direct: "control panel", indirect: "the secret", preposition: "to", raw: input,
    } });
    expect(next.log.join("\n")).toContain(`> ${input}`);
  });
});

describe("damaged-door article regression", () => {
  it.each(["gap", "the gap", "hole", "the hole"])("preserves the full acid puzzle with %s", async noun => {
    const initial = createTestState({ roomId: "LevelSixCorridorEnd" });
    const gap = initial.world.items.find(item => item.id === "LevelSixCorridorEndDoorGap")!;
    const lookThrough = vi.spyOn(gap.overrides!, "lookthrough");
    const blocked = await equivalent(initial, "south", "south");
    expect(blocked.player.roomId).toBe("LevelSixCorridorEnd");

    let actual = initial;
    let reference = initial;
    const inputs = [`look through ${noun}`, `look through ${noun}`, `look through ${noun}`, "wait",
      `look through ${noun}`, "wait", `look through ${noun}`, "wait"];
    let sprays = 0;
    for (const input of inputs) {
      const before = actual.worldState.hydroponicsSpider;
      reference = await handleCommand(reference, parseCommand(input.startsWith("look") ? "look through gap" : input), { skipEcho: true });
      lookThrough.mockClear();
      actual = await handleCommand(actual, parseCommand(input), { skipEcho: true });
      expect(lookThrough).toHaveBeenCalledTimes(input.startsWith("look") ? 1 : 0);
      expect(actual).toEqual(reference);
      expect(actual.player.roomId).toBe("LevelSixCorridorEnd");
      expect(actual.worldState.gameOver).toBeFalsy();
      const after = actual.worldState.hydroponicsSpider;
      if (input === "wait") {
        sprays++;
        expect(after.doorHealth).toBe(before.doorHealth - 1);
        expect(after.pendingAcidTarget).toBe("none");
        expect(actual.log.join("\n")).toMatch(/acid|blast/);
      } else {
        expect(after.doorHealth).toBe(before.doorHealth);
        expect(actual.moves).toBe(reference.moves);
      }
      if (after.doorHealth > 0) {
        const premature = await handleCommand(actual, parseCommand("south"));
        expect(premature.player.roomId).toBe("LevelSixCorridorEnd");
      }
    }
    expect(sprays).toBe(3);
    expect(actual.moves).toBe(initial.moves + 3);
    expect(actual.worldState.hydroponicsSpider.doorHealth).toBe(0);
    expect(actual.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(true);
    const entered = await handleCommand(actual, parseCommand("south"));
    expect(entered.player.roomId).toBe("HydroponicsPlatform");
  });
});
