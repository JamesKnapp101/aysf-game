import { applyStatusEffectToPlayer } from "@game/rules/status";
import {
  BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE,
  BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE,
} from "@game/helpers/barBotAwareness";
import { buildRoomDescription } from "@game/text/roomDescription";
import {
  BAR_BULL_ADHESIVE_TRIGGER,
  BAR_FLOOR_HATCH_DOOR_ID,
  BAR_MEMORY_BOX_ID,
  BAR_MEMORY_BOX_MESSAGE,
  BAR_SNAP_OUT_CHEWABLE_ID,
} from "src/world/maps/levelThree/Park/Bar";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  runCommand,
  setInventory,
} from "./helpers/gameTestHelpers";

function getCommandEntry(state: { log: string[] }, command: string): string {
  for (let index = state.log.length - 1; index >= 0; index -= 1) {
    const entry = state.log[index];
    if (entry.includes(`> ${command}`)) return entry;
  }

  return "";
}

describe("bar area interactions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lets the player throw and retrieve the dart from the dartboard", async () => {
    const start = setInventory(createTestState({ roomId: "Bar" }), ["Dart"]);

    const thrown = await runCommand(start, "throw dart at dartboard");

    expect(getCommandEntry(thrown, "throw dart at dartboard")).toContain(
      "Bullseye!",
    );
    expect(thrown.itemState.surfaceContents.BarDartboard).toContain("Dart");
    expect(expectInventoryToContain(thrown, "Dart")).toBe(false);
    expect(buildRoomDescription(thrown, "Bar", { mode: "panel" })).toContain(
      "red dart stuck",
    );

    const taken = await runCommand(thrown, "take dart");

    expect(expectInventoryToContain(taken, "Dart")).toBe(true);
    expect(taken.itemState.surfaceContents.BarDartboard ?? []).not.toContain(
      "Dart",
    );
  });

  it("lets the bartender accept the missing dart", async () => {
    const start = setInventory(createTestState({ roomId: "Bar" }), ["Dart"]);

    const next = await runCommand(start, "give dart to bartender");

    expect(getCommandEntry(next, "give dart to bartender")).toContain(
      `"Hey, you found one of the darts! That's great!"`,
    );
    expect(expectInventoryToContain(next, "Dart")).toBe(false);
    expect(next.itemState.itemRoomId.Dart).toBe("Bar");
  });

  it("handles adhesive-assisted mechanical bull riding", async () => {
    const start = setInventory(createTestState({ roomId: "Bar" }), [
      "BarAdhesive",
    ]);
    const adhesive = await runCommand(start, "apply adhesive to bull");

    expect(
      adhesive.worldState.conditionalTriggers[BAR_BULL_ADHESIVE_TRIGGER],
    ).toBe(true);

    const noPants = await runCommand(adhesive, "ride bull");

    expect(getCommandEntry(noPants, "ride bull")).toContain(
      "I don't think that's such a good idea with no pants on",
    );
    expect(noPants.player.vitals.health).toBe(100);

    const clothedStart = setInventory(createTestState({ roomId: "Bar" }), [
      "GimOnePants",
      "BarAdhesive",
    ]);
    const wearing = await runCommand(clothedStart, "wear red sweatpants");
    const sticky = await runCommand(wearing, "apply adhesive to bull");
    const ridden = await runCommand(sticky, "ride bull");

    expect(ridden.itemState.wornByPlayer.legs).toBeUndefined();
    expect(expectInventoryToContain(ridden, "GimOnePants")).toBe(false);
    expect(ridden.itemState.attachedTo.GimOnePants).toBe("BarMechanicalBull");
    expect(getCommandEntry(ridden, "ride bull")).toContain("stay behind");
  });

  it("dispenses one Snap out of It chewable and clears drunk when eaten", async () => {
    const drunk = applyStatusEffectToPlayer(
      createTestState({ roomId: "BarBathroom" }),
      "drunk",
      30,
      20,
    );

    const dispensed = await runCommand(drunk, "turn crank");

    expect(expectInventoryToContain(dispensed, BAR_SNAP_OUT_CHEWABLE_ID)).toBe(
      true,
    );

    const duplicate = await runCommand(dispensed, "turn dispenser crank");

    expect(getCommandEntry(duplicate, "turn dispenser crank")).toContain(
      "You already have one",
    );

    const eaten = await runCommand(dispensed, "eat chewable");

    expect(expectInventoryToContain(eaten, BAR_SNAP_OUT_CHEWABLE_ID)).toBe(
      false,
    );
    expect(eaten.player.statusEffects.some((effect) => effect.id === "drunk"))
      .toBe(false);
  });

  it("reveals the contraband hidden under the bathroom sink", async () => {
    const start = createTestState({ roomId: "BarBathroom" });
    const looked = await runCommand(start, "look under sink");

    expect(getCommandEntry(looked, "look under sink")).toContain(
      "small wrapped package",
    );
    expect(looked.itemState.underContents.BarBathroomSink ?? []).not.toContain(
      "BarContraband",
    );
    expect(looked.itemState.itemRoomId.BarContraband).toBe("BarBathroom");

    const taken = await runCommand(looked, "take package");

    expect(expectInventoryToContain(taken, "BarContraband")).toBe(true);
  });

  it("numbers the drink menu entries", () => {
    const state = createTestState({ roomId: "Bar" });
    const menu = state.world.items.find((item) => item.id === "BarDrinkMenu");

    expect(menu?.readableText).toContain("#1 Whiskey Sweet");
    expect(menu?.readableText).toContain("#6 Gin Fizz");
  });

  it("treats the bar floor hatch as a regular unlocked door", async () => {
    const start = setInventory(createTestState({ roomId: "Bar" }), [
      "flashlight",
    ]);

    expect(start.worldState.conditionalExits.Bar).toBeUndefined();
    expect(start.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen).toBe(
      false,
    );
    expect(start.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isLocked).toBe(
      false,
    );

    const lit = await runCommand(start, "turn on flashlight");
    const opened = await runCommand(lit, "open floor hatch");

    expect(opened.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen).toBe(
      true,
    );
    expect(getCommandEntry(opened, "open floor hatch")).toContain(
      "floor hatch swings open",
    );

    const descended = await runCommand(opened, "down");

    expect(descended.player.roomId).toBe("BarBasement");

    const shorthand = await runCommand(
      createTestState({ roomId: "Bar" }),
      "open hatch",
    );

    expect(shorthand.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen).toBe(
      true,
    );
  });

  it("has the bartender react when the player dies in the cellar and regenerates in the bar", async () => {
    const opened = await runCommand(createTestState({ roomId: "Bar" }), "open hatch");
    const died = await runCommand(opened, "down");

    expect(died.player.roomId).toBe("Bar");
    expect(died.worldState.barBot).toMatchObject({
      cellarDeathAcknowledged: true,
      pendingCellarDeathAcknowledgement: undefined,
      sawPlayerDieInCellar: true,
      sawPlayerEnterCellar: true,
      sawPlayerRegenerateInBar: true,
    });
    expect(died.log.join("\n")).toContain(
      BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE,
    );
  });

  it("has the bartender react when the player returns after a cellar death", async () => {
    const start = createTestState({
      roomId: "Bar",
      visitedRooms: ["Bar", "BarLounge"],
    });
    const opened = await runCommand(start, "open hatch");
    const darkBar = {
      ...opened,
      worldState: {
        ...opened.worldState,
        darkRooms: {
          ...opened.worldState.darkRooms,
          Bar: true,
        },
        visitedRooms: {
          Bar: true,
          BarLounge: true,
        },
      },
    };

    const died = await runCommand(darkBar, "down");

    expect(died.player.roomId).toBe("BarLounge");
    expect(died.worldState.barBot).toMatchObject({
      pendingCellarDeathAcknowledgement: "returned",
      sawPlayerDieInCellar: true,
      sawPlayerEnterCellar: true,
      sawPlayerRegenerateInBar: false,
    });

    const returned = await runCommand(died, "north");

    expect(returned.player.roomId).toBe("Bar");
    expect(getCommandEntry(returned, "north")).toContain(
      BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE,
    );
    expect(
      returned.worldState.barBot.pendingCellarDeathAcknowledgement,
    ).toBeUndefined();
    expect(returned.worldState.barBot.cellarDeathAcknowledged).toBe(true);
  });

  it("passes the bartender's witnessed cellar death into AI context", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "That cellar has become a problem.",
      }),
    } as Response);
    const base = createTestState({ roomId: "Bar" });
    const aware = {
      ...base,
      worldState: {
        ...base.worldState,
        barBot: {
          ...base.worldState.barBot,
          cellarDeathAcknowledged: true,
          sawPlayerDieInCellar: true,
          sawPlayerEnterCellar: true,
          sawPlayerRegenerateInBar: true,
        },
      },
    };

    await runCommand(aware, "ask bartender about cellar");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const body = JSON.parse(String(request?.body ?? "{}"));

    expect(body.assistantContext).toContain(
      "You saw Mox go down through the floor hatch",
    );
    expect(body.assistantContext).toContain(
      "You saw Mox regenerate back in the bar",
    );
  });

  it("serves ordered drink-menu drinks and removes the empty glass", async () => {
    const ordered = await runCommand(
      createTestState({ roomId: "Bar" }),
      "order whiskey sweet",
    );

    expect(getCommandEntry(ordered, "order whiskey sweet")).toContain(
      "serves it to you",
    );
    expect(expectInventoryToContain(ordered, "BarWhiskeySweet")).toBe(true);

    const duplicate = await runCommand(ordered, "order #2");

    expect(getCommandEntry(duplicate, "order #2")).toContain(
      `"Sorry, only one drink per customer at a time!"`,
    );

    const drank = await runCommand(ordered, "drink whiskey sweet");

    expect(drank.player.statusEffects.some((effect) => effect.id === "drunk"))
      .toBe(true);
    expect(expectInventoryToContain(drank, "BarWhiskeySweet")).toBe(false);
    expect(drank.itemState.itemRoomId.BarWhiskeySweet).toBe("seeded");
    expect(getCommandEntry(drank, "drink whiskey sweet")).toContain(
      "whisks the empty glass away",
    );
    expect(
      drank.world.items.find((item) => item.id === "BarWhiskeySweet")?.doses,
    ).toBe(0);
  });

  it("lets the player ask the bartender for numbered drinks", async () => {
    const ordered = await runCommand(
      createTestState({ roomId: "Bar" }),
      "ask bartender for a #1",
    );

    expect(getCommandEntry(ordered, "ask bartender for a #1")).toContain(
      "Whiskey Sweet",
    );
    expect(expectInventoryToContain(ordered, "BarWhiskeySweet")).toBe(true);
  });

  it("has the bartender hand over the memory box once", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "That sounds serious.",
      }),
    } as Response);

    const rewarded = await runCommand(
      createTestState({ roomId: "Bar" }),
      "tell bartender about missing memories",
    );

    expect(expectInventoryToContain(rewarded, BAR_MEMORY_BOX_ID)).toBe(true);
    expect(
      getCommandEntry(rewarded, "tell bartender about missing memories"),
    ).toContain(BAR_MEMORY_BOX_MESSAGE);

    const duplicate = await runCommand(
      rewarded,
      "tell bartender about the catastrophe",
    );

    expect(
      duplicate.player.inventory.general.filter(
        (itemId) => itemId === BAR_MEMORY_BOX_ID,
      ),
    ).toHaveLength(1);
    expect(
      getCommandEntry(duplicate, "tell bartender about the catastrophe"),
    ).not.toContain(BAR_MEMORY_BOX_MESSAGE);

    const opened = await runCommand(rewarded, "open box");

    expect(getCommandEntry(opened, "open box")).toContain("but it's empty");
  });

  it("blocks leaving the bar while carrying a drink", async () => {
    const ordered = await runCommand(
      createTestState({ roomId: "Bar" }),
      "order #1",
    );
    const blocked = await runCommand(ordered, "northwest");

    expect(blocked.player.roomId).toBe("Bar");
    expect(getCommandEntry(blocked, "northwest")).toContain(
      `"Sorry, but you can't take drinks out of the bar, Mayor's orders!"`,
    );
  });

  it("rejects modern drink orders except the gin fizz", async () => {
    const denied = await runCommand(
      createTestState({ roomId: "Bar" }),
      "order martini",
    );

    expect(getCommandEntry(denied, "order martini")).toContain(
      `"Sorry, but the only recipe that survived from that era was the gin fizz"`,
    );

    const ginFizz = await runCommand(
      createTestState({ roomId: "Bar" }),
      "order gin fizz",
    );

    expect(expectInventoryToContain(ginFizz, "BarGinFizz")).toBe(true);
  });
});
