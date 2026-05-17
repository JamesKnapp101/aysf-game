import { dispatchAction } from "@game/actions/dispatchAction";
import { doExamine } from "@game/actions/examine/examine";
import {
  BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE,
  BAR_BOT_CELLAR_DEATH_RETURN_MESSAGE,
} from "@game/helpers/barBotAwareness";
import {
  BAR_VISION_QUEST_DRINK_SEQUENCE,
  BAR_VISION_QUEST_EXPERIENCE_ID,
  BAR_VISION_QUEST_TRIGGER,
} from "@game/helpers/barVisionQuest";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { buildRoomDescription } from "@game/text/roomDescription";
import {
  BAR_BULL_ADHESIVE_TRIGGER,
  BAR_BULL_RIDE_PRIZE_MESSAGE,
  BAR_BULL_RIDE_SCORE_ID,
  BAR_CONTRABAND_ID,
  BAR_FLOOR_HATCH_DOOR_ID,
  BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE,
  BAR_JUKEBOX_TRACKS,
  BAR_MEMORY_BOX_ID,
  BAR_MEMORY_BOX_MESSAGE,
  BAR_SNAP_OUT_CHEWABLE_ID,
  BAR_TRIVIA_ANSWER,
  BAR_TRIVIA_PRIZE_MESSAGE,
  BAR_TRIVIA_SCORE_ID,
  FAKE_ID_ID,
  FREE_DRINK_TICKET_ID,
  MANI_PEDI_VOUCHER_ID,
} from "src/world/maps/levelThree/Park/Bar/Bar";
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

async function orderAndDrinkBarSpecial(
  state: ReturnType<typeof createTestState>,
  drinkName: string,
) {
  const ordered = await runCommand(state, `order ${drinkName}`);
  return runCommand(ordered, `drink ${drinkName}`);
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
      "AllPurposeAdhesive",
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
      "AllPurposeAdhesive",
    ]);
    const wearing = await runCommand(clothedStart, "wear red sweatpants");
    const sticky = await runCommand(wearing, "apply adhesive to bull");
    const ridden = await runCommand(sticky, "ride bull");

    expect(ridden.itemState.wornByPlayer.legs).toBeUndefined();
    expect(expectInventoryToContain(ridden, "GimOnePants")).toBe(false);
    expect(ridden.itemState.attachedTo.GimOnePants).toBe("BarMechanicalBull");
    expect(expectInventoryToContain(ridden, FREE_DRINK_TICKET_ID)).toBe(true);
    expect(ridden.itemState.itemRoomId[FREE_DRINK_TICKET_ID]).toBe("INVENTORY");
    expect(ridden.worldState.scoresTriggered[BAR_BULL_RIDE_SCORE_ID]).toBe(
      true,
    );
    expect(ridden.score).toBe(3);
    expect(getCommandEntry(ridden, "ride bull")).toContain("stay behind");
    expect(getCommandEntry(ridden, "ride bull")).toContain(
      BAR_BULL_RIDE_PRIZE_MESSAGE,
    );
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
    expect(
      eaten.player.statusEffects.some((effect) => effect.id === "drunk"),
    ).toBe(false);
  });

  it("reveals the contraband hidden under the bathroom sink", async () => {
    const start = createTestState({ roomId: "BarBathroom" });
    const looked = await runCommand(start, "look under sink");

    expect(getCommandEntry(looked, "look under sink")).toContain(
      "small wrapped package",
    );
    expect(looked.itemState.underContents.BarBathroomSink ?? []).not.toContain(
      BAR_CONTRABAND_ID,
    );
    expect(looked.itemState.itemRoomId[BAR_CONTRABAND_ID]).toBe("BarBathroom");

    const taken = await runCommand(looked, "take package");

    expect(expectInventoryToContain(taken, BAR_CONTRABAND_ID)).toBe(true);

    const opened = await runCommand(taken, "open package");

    expect(getCommandEntry(opened, "open package")).toContain(
      "You unwrap the package, and discard the paper",
    );
    expect(expectInventoryToContain(opened, BAR_CONTRABAND_ID)).toBe(false);
    expect(opened.itemState.itemRoomId[BAR_CONTRABAND_ID]).toBe("NOWHERE");
    expect(expectInventoryToContain(opened, FAKE_ID_ID)).toBe(true);
    expect(opened.itemState.itemRoomId[FAKE_ID_ID]).toBe("INVENTORY");
  });

  it("numbers the drink menu entries", () => {
    const state = createTestState({ roomId: "Bar" });
    const menu = state.world.items.find((item) => item.id === "BarDrinkMenu");

    expect(menu?.readableText).toContain("#1 Whiskey Sweet");
    expect(menu?.readableText).toContain("#6 Gin Fizz");
  });

  it("opens the jukebox console and plays a selected track", async () => {
    const track = BAR_JUKEBOX_TRACKS[0];
    const state = createTestState({ roomId: "BarLounge", rng: () => 0 });

    const examined = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "jukebox",
      raw: "examine jukebox",
    });

    expect(examined.overlay).toMatchObject({ kind: "bar-jukebox" });

    const played = await dispatchAction(examined.state, {
      verb: "playJukeboxTrack",
      payload: { trackId: track.trackId },
    });

    expect(played.message).toBe(
      `The song ${track.trackName} by ${track.trackArtist} begins to play ${track.trackOpen}`,
    );
    expect(played.state.worldState.barJukebox.activeTrack).toMatchObject({
      trackId: track.trackId,
      turnsRemaining: track.trackLength,
    });

    const ticked = await runCommand(played.state, "wait");

    expect(ticked.log.join("\n")).toContain(
      `${track.trackName} continues playing`,
    );
    expect(
      ticked.worldState.barJukebox.activeTrack?.remainingClips,
    ).toHaveLength(track.trackClips.length - 1);
  });

  it("handles missing jukebox tracks and closes tracks when they expire", async () => {
    const track = BAR_JUKEBOX_TRACKS[0];
    const state = createTestState({ roomId: "BarLounge", rng: () => 1 });
    const played = await dispatchAction(state, {
      verb: "playJukeboxTrack",
      payload: { trackId: track.trackId },
    });

    const incomplete = await dispatchAction(played.state, {
      verb: "playJukeboxTrack",
      payload: { trackId: track.trackId.slice(0, 3) },
    });

    expect(incomplete.message).toBe(BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE);
    expect(incomplete.state.worldState.barJukebox.activeTrack?.trackId).toBe(
      track.trackId,
    );

    let ticking = incomplete.state;
    for (let index = 0; index < track.trackLength; index += 1) {
      ticking = await runCommand(ticking, "wait");
    }

    expect(ticking.log.join("\n")).toContain(track.trackClose);
    expect(ticking.worldState.barJukebox.activeTrack).toBeUndefined();

    const missing = await dispatchAction(ticking, {
      verb: "playJukeboxTrack",
      payload: { trackId: "X999" },
    });

    expect(missing.message).toBe(BAR_JUKEBOX_TRACK_NOT_FOUND_MESSAGE);
  });

  it("treats the bar floor hatch as a regular unlocked door", async () => {
    const start = setInventory(createTestState({ roomId: "Bar" }), [
      "flashlight",
    ]);

    expect(start.worldState.conditionalExits.Bar).toBeUndefined();
    expect(start.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen).toBe(false);
    expect(start.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isLocked).toBe(
      false,
    );

    const lit = await runCommand(start, "turn on flashlight");
    const opened = await runCommand(lit, "open floor hatch");

    expect(opened.worldState.doors[BAR_FLOOR_HATCH_DOOR_ID]?.isOpen).toBe(true);
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
    const opened = await runCommand(
      createTestState({ roomId: "Bar" }),
      "open hatch",
    );
    const died = await runCommand(opened, "down");

    expect(died.player.roomId).toBe("Bar");
    expect(died.worldState.barBot).toMatchObject({
      cellarDeathAcknowledged: true,
      pendingCellarDeathAcknowledgement: undefined,
      sawPlayerDieInCellar: true,
      sawPlayerEnterCellar: true,
      sawPlayerRegenerateInBar: true,
    });
    expect(died.log.join("\n")).toContain(BAR_BOT_CELLAR_DEATH_REGEN_MESSAGE);
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

    expect(
      drank.player.statusEffects.some((effect) => effect.id === "drunk"),
    ).toBe(true);
    expect(expectInventoryToContain(drank, "BarWhiskeySweet")).toBe(false);
    expect(drank.itemState.itemRoomId.BarWhiskeySweet).toBe("seeded");
    expect(getCommandEntry(drank, "drink whiskey sweet")).toContain(
      "whisks the empty glass away",
    );
    expect(
      drank.world.items.find((item) => item.id === "BarWhiskeySweet")?.doses,
    ).toBe(0);
  });

  it("starts the vision quest after the zine drink sequence", async () => {
    let state = createTestState({ roomId: "Bar" });

    for (const drinkName of [
      "bangalore sling",
      "whiskey sweet",
      "hand-stuff on the beach",
      "gin fizz",
      "durian colada",
      "fischermeister shot",
    ]) {
      state = await orderAndDrinkBarSpecial(state, drinkName);
    }

    expect(state.player.roomId).toBe("BarVisionQuest");
    expect(state.player.recentDrinkItemIds).toEqual([
      ...BAR_VISION_QUEST_DRINK_SEQUENCE,
    ]);
    expect(state.worldState.conditionalTriggers[BAR_VISION_QUEST_TRIGGER]).toBe(
      true,
    );
    expect(state.worldState.activeExperience).toMatchObject({
      experienceId: BAR_VISION_QUEST_EXPERIENCE_ID,
      kind: "vision",
      returnRoomId: "Bar",
    });
    expect(
      state.player.statusEffects.some((effect) => effect.id === "drunk"),
    ).toBe(false);
    expect(state.player.vitals.drunkenness).toBe(0);
    expect(getCommandEntry(state, "drink fischermeister shot")).toContain(
      "the world around you twists into something else entirely",
    );
  });

  it("awards score and silently grants the prize shirt when the vision quest ends", async () => {
    let state = createTestState({ roomId: "Bar" });

    for (const drinkName of [
      "bangalore sling",
      "whiskey sweet",
      "hand-stuff on the beach",
      "gin fizz",
      "durian colada",
      "fischermeister shot",
    ]) {
      state = await orderAndDrinkBarSpecial(state, drinkName);
    }

    while (state.worldState.activeExperience) {
      state = await runCommand(state, "wait");
    }

    const finalWaitEntry = getCommandEntry(state, "wait");

    expect(state.player.roomId).toBe("Bar");
    expect(state.worldState.scoresTriggered.completed_vision_quest).toBe(true);
    expect(state.score).toBe(2);
    expect(expectInventoryToContain(state, "TShirtPrize")).toBe(true);
    expect(state.itemState.itemRoomId.TShirtPrize).toBe("INVENTORY");
    expect(finalWaitEntry).toContain("leaving you back in the bar");
    expect(finalWaitEntry).not.toContain("t-shirt");
    expect(state.uiState?.notifications).toContainEqual(
      expect.objectContaining({
        kind: "score",
        text: "Your score has just went up by 2 points!",
      }),
    );
  });

  it("counts any other consumed drink against the zine sequence", async () => {
    let state = setInventory(createTestState({ roomId: "Bar" }), [
      "BottleOfScotch",
    ]);

    state = await orderAndDrinkBarSpecial(state, "bangalore sling");
    state = await runCommand(state, "drink scotch");

    for (const drinkName of [
      "whiskey sweet",
      "hand-stuff on the beach",
      "gin fizz",
      "durian colada",
      "fischermeister shot",
    ]) {
      state = await orderAndDrinkBarSpecial(state, drinkName);
    }

    expect(state.player.roomId).toBe("Bar");
    expect(state.worldState.activeExperience).toBeUndefined();
    expect(state.worldState.conditionalTriggers[BAR_VISION_QUEST_TRIGGER]).toBe(
      false,
    );
    expect(state.player.recentDrinkItemIds).toEqual([
      "BottleOfScotch",
      "BarWhiskeySweet",
      "BarHandStuffOnTheBeach",
      "BarGinFizz",
      "BarDurianColada",
      "BarFischermeisterShot",
    ]);
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

  it("awards the bar trivia point and voucher for the correct answer once", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "That's a confident answer.",
      }),
    } as Response);

    const command = `tell bartender the answer to the trivia question is '${BAR_TRIVIA_ANSWER}'`;
    const rewarded = await runCommand(
      createTestState({ roomId: "Bar" }),
      command,
    );

    expect(expectInventoryToContain(rewarded, MANI_PEDI_VOUCHER_ID)).toBe(true);
    expect(rewarded.itemState.itemRoomId[MANI_PEDI_VOUCHER_ID]).toBe(
      "INVENTORY",
    );
    expect(rewarded.worldState.scoresTriggered[BAR_TRIVIA_SCORE_ID]).toBe(true);
    expect(rewarded.score).toBe(1);
    expect(getCommandEntry(rewarded, command)).toContain(
      BAR_TRIVIA_PRIZE_MESSAGE,
    );

    const duplicate = await runCommand(rewarded, command);

    expect(
      duplicate.player.inventory.general.filter(
        (itemId) => itemId === MANI_PEDI_VOUCHER_ID,
      ),
    ).toHaveLength(1);
    expect(duplicate.score).toBe(1);
    expect(getCommandEntry(duplicate, command)).not.toContain(
      BAR_TRIVIA_PRIZE_MESSAGE,
    );
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
