import { describe, expect, it } from "vitest";
import { createInitialState, mergeWorldChunkIntoState } from "@game/gameInit";
import { getCharacterProfile } from "@game/npcProfiles";
import { restoreResumeSnapshot, saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { resolveItemByNoun } from "@game/rules/scope";
import { stashItemInContainer } from "@game/helpers/itemPlacement";
import { buildRoomDescription } from "@game/text/roomDescription";
import { INITIAL_WORLD, loadWorldChunk } from "src/world/World";
import { spaItems } from "src/world/maps/levelThree/Park/Spa";
import {
  addInventoryItems,
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

const WHITEBOARD_DESCRIPTION = "It looks like somebody figured out something important, was it you? You don't remember writing it, but it does look like your handwriting. There's a lot of data there, but the gist of it seems to be that there are 'organisms' that only move in the dark, and whatever they are, they are irresistibly pulled toward one another when they get close. Their connection might be brief, but they are compelled to connect. It seems that when one senses another, even just a fragment of one, it will attempt to move to where it is, wherever it is.";

describe("Spa content foundation", () => {
  it.each([
    ["Spa", "jacuzzi", "drained"],
    ["Spa", "jets", "inactive"],
    ["Spa", "tiles", "ceramic"],
    ["Spa", "check-in station", "reception"],
    ["Spa", "towels", "facecloths"],
    ["Spa", "ceiling", "echo"],
    ["Spa", "overhead light", "switch"],
    ["Spa", "lightswitch", "ON position"],
    ["Spa", "sign", "Sauna"],
    ["Spa", "glass wall", "door closed"],
    ["Sauna", "cedar", "heat is off"],
    ["Sauna", "benches", "body"],
    ["Sauna", "eucalyptus", "decomposition"],
    ["Sauna", "porthole", "cool now"],
    ["SteamRoom", "tiles", "cool and dry"],
    ["SteamRoom", "bench", "tiers"],
    ["SteamRoom", "ceiling", "arches"],
    ["SteamRoom", "glass wall", "does not shut out"],
    ["NailSalon", "mirrors", "reflections"],
    ["NailSalon", "chairs", "pedicure"],
    ["NailSalon", "basins", "empty"],
    ["NailSalon", "stools", "ankle height"],
    ["NailSalon", "nail station", "glass-topped"],
    ["NailSalon", "lights", "purple"],
    ["NailSalon", "blossoms", "silk"],
    ["NailSalon", "oils", "No bottles"],
  ])("makes %s scenery '%s' examinable", async (roomId, noun, detail) => {
    // Scenery coverage is independent of the new Sauna contact hazard.
    const state = roomId === "Sauna"
      ? await runCommand(addInventoryItems(createTestState({ roomId }), ["flashlight"]), "turn flashlight on")
      : createTestState({ roomId });
    expect(resolveItemByNoun(state, noun)).toBeDefined();
    const examined = await runCommand(state, `examine ${noun}`);
    expect(getLastLogEntry(examined)).toContain(detail);
  });

  it("keeps the removed check-in board absent and the research whiteboard local to the lab", async () => {
    let state = createTestState({ roomId: "Spa" });
    expect(state.world.items.some(item => item.id === "massagecheckin")).toBe(false);
    expect(resolveItemByNoun(state, "whiteboard")).toBeUndefined();
    state = await runCommand(state, "examine whiteboard");
    expect(getLastLogEntry(state).trim()).toBe("> examine whiteboard\nYou don't see that here.");
    expect(resolveItemByNoun(createTestState({ roomId: "SecretLab" }), "whiteboard")?.id).toBe("SecretLabWhiteboard");
  });

  it("shows the research clue in the lab and preserves it after an erase attempt", async () => {
    let state = createTestState({ roomId: "SecretLab" });
    expect(buildRoomDescription(state, "SecretLab", { forceFull: true })).toContain(
      "Against the opposite wall is a large whiteboard, covered in dense scribbles and diagrams. Among them is the word 'PROVEN' in large print and underlined.",
    );
    state = await runCommand(state, "examine whiteboard");
    expect(getLastLogEntry(state).trim()).toBe(`> examine whiteboard\n${WHITEBOARD_DESCRIPTION}`);
    state = await runCommand(state, "erase whiteboard");
    expect(getLastLogEntry(state).trim()).toBe(
      "> erase whiteboard\nI'd leave it, it could be important.",
    );
    state = await runCommand(state, "examine whiteboard");
    expect(getLastLogEntry(state)).toContain(WHITEBOARD_DESCRIPTION);
  });

  it.each([
    ["erase", "Erase what?"],
    ["erase research whiteboard", "You don't see that here."],
    ["erase whiteboard", "You don't see that here."],
    ["erase jacuzzi", "You can't erase that."],
  ])("handles '%s' without a world-specific erase handler", async (command, reply) => {
    const state = await runCommand(createTestState({ roomId: "Spa" }), command);
    expect(getLastLogEntry(state)).toContain(reply);
  });

  it("places a usable inventory item in the Kitchen", async () => {
    let state = createTestState({ roomId: "Kitchen" });
    expect(buildRoomDescription(state, "Kitchen", { forceFull: true })).toContain("A carving knife");
    state = await runCommand(state, "examine carving knife");
    expect(getLastLogEntry(state)).toContain("precise slices");
    state = await runCommand(state, "take carving knife");
    expectInventoryToContain(state, "CarvingKnife");
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("WalkIn");
    expectInventoryToContain(state, "CarvingKnife");
  });

  it.each([
    ["sample", "Carving knife. In Kitchen. Small slice. From me."],
    ["samples", "Take one."],
    ["knife", "Cut small sample. From me."],
    ["bait", "Even fragments. Must connect. Might not stay. Always try."],
    ["organism", "Only move dark. Light stops them."],
  ])("provides the chef's authored '%s' clue", async (topic, clue) => {
    const initial = createTestState({ roomId: "WalkIn" });
    const state = { ...initial, uiState: { ...initial.uiState, conversationMode: "authored" as const } };
    const asked = await runCommand(state, `ask chef about ${topic}`);
    expect(getLastLogEntry(asked)).toContain(clue);
  });

  it("gives the chef's profile the sampling and attraction facts", () => {
    const profile = getCharacterProfile("doomed_chef")!;
    if (!("goals" in profile)) throw new Error("Expected the chef's compact profile");
    expect(profile.goals.join(" ")).toContain("collect one small sample");
    expect(profile.knownFacts.join(" ")).toContain("carving knife");
    expect(profile.knownFacts.join(" ")).toContain("even a fragment attracts");
  });

  it("identifies the existing Sauna body as Freeny while retaining its injuries and purse", async () => {
    let state = await runCommand(addInventoryItems(createTestState({ roomId: "Sauna" }), ["flashlight"]), "turn flashlight on");
    expect(resolveItemByNoun(state, "Freeny Salk")?.id).toBe("saunacorpse");
    state = await runCommand(state, "examine Freeny Salk");
    expect(getLastLogEntry(state)).toContain("identifies him as Freeny Salk");
    expect(getLastLogEntry(state)).toContain("puncture wounds");
    state = await runCommand(state, "examine purse");
    expect(getLastLogEntry(state)).toContain("Freeny Salk");
    expect(resolveItemByNoun(state, "purse")?.id).toBe("saunacorpsepurse");
    expect(buildRoomDescription(state, "Sauna", { forceFull: true })).not.toContain("sauna's heat");
  });

  it("uses consistent directions for both sides of the Spa doors", async () => {
    let state = await runCommand(addInventoryItems(createTestState({ roomId: "Spa" }), ["flashlight"]), "turn flashlight on");
    const description = buildRoomDescription(state, "Spa", { forceFull: true });
    expect(description).toContain("To the west is the entrance to a nail salon.");
    expect(description).toContain("To the south is a heavy glass door");
    expect(description).not.toContain("\\n");
    state = await runCommand(state, "open steam room door");
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("SteamRoom");
    expect(buildRoomDescription(state, "SteamRoom", { forceFull: true })).toContain("To the north");
    state = await runCommand(state, "north");
    state = await runCommand(state, "open nail salon door");
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("NailSalon");
    state = await runCommand(state, "east");
    state = await runCommand(state, "open sauna door");
    state = await runCommand(state, "north");
    expect(state.player.roomId).toBe("Sauna");
    state = await runCommand(state, "south");
    expect(state.player.roomId).toBe("Spa");
  });

  it("describes the unfastened freezer consistently and opens it through its ordinary door aliases", async () => {
    let state = createTestState({ roomId: "Kitchen" });
    expect(buildRoomDescription(state, "Kitchen", { forceFull: true })).not.toContain("padlocked");
    state = await runCommand(state, "examine padlock");
    expect(getLastLogEntry(state)).toContain("shackle is unfastened");
    state = await runCommand(state, "close fridge");
    expect(state.worldState.doors.WalkInDoor.isOpen).toBe(false);
    state = await runCommand(state, "open steel door");
    expect(state.worldState.doors.WalkInDoor.isOpen).toBe(true);
    state = await runCommand(state, "west");
    expect(state.player.roomId).toBe("WalkIn");
    expect(getLastLogEntry(state)).toContain("bitterly cold");
  });

  it("makes Eegler's diagrams an explicit visual clue about fragments", async () => {
    let state = createTestState({ roomId: "SecretLab" });
    state = await runCommand(state, "examine diagrams");
    expect(getLastLogEntry(state)).toContain("M. Eegler: initial observations");
    expect(getLastLogEntry(state)).toContain("touching, then separating");
    expect(getLastLogEntry(state)).toContain("Even a fragment is bait");
    state = await runCommand(state, "erase diagrams");
    expect(getLastLogEntry(state)).toContain("I'd leave it, it could be important.");
  });

  it("takes five actual moves to travel directly from the WalkIn to Spa", async () => {
    let state = createTestState({ roomId: "WalkIn" });
    const start = state.moves;
    for (const [command, destination] of [
      ["east", "Kitchen"], ["east", "Restaurant"],
      ["northeast", "RestaurantEntrance"], ["northwest", "ParkWest"], ["west", "Spa"],
    ]) {
      state = await runCommand(state, command);
      expect(state.player.roomId).toBe(destination);
    }
    expect(state.moves - start).toBe(5);
  });

  it("keeps every content item ID unique", () => {
    const ids = createTestState().world.items.map((item) => item.id);
    expect(ids.filter((id) => id === "SecretLabWhiteboard")).toHaveLength(1);
    expect(ids.filter((id) => id === "CarvingKnife")).toHaveLength(1);
    for (const item of spaItems) expect(ids.filter((id) => id === item.id)).toHaveLength(1);
    expect(resolveItemByNoun(createTestState({ roomId: "Spa" }), "jacuzzi")?.id).toBe("JACQUZZI");
  });

  it("upgrades a pre-foundation save while preserving doors, containment, inventory and progress", async () => {
    let state = createInitialState(INITIAL_WORLD);
    state = mergeWorldChunkIntoState(state, "level-three", await loadWorldChunk("level-three"));
    state = { ...state, moves: 37, player: { ...state.player, roomId: "Kitchen" } };
    state = stashItemInContainer(state, "saunacorpsepurse", "Cooler");
    state = await runCommand(state, "take cooler");
    state.worldState.doors.SteamRoomDoor.isOpen = true;
    expect(saveResumeSnapshot(state)).toBe(true);
    const snapshot = JSON.parse(window.localStorage.getItem("aysf:resume")!);
    const addedIds = new Set([
      ...spaItems.filter((item) => item.itemCategory === "scenery").map((item) => item.id),
      "CarvingKnife", "SecretLabWhiteboard", "SecretLabOrganismDiagrams",
    ]);
    snapshot.worldItems = snapshot.worldItems.filter((item: { id: string }) => !addedIds.has(item.id));
    for (const id of addedIds) delete snapshot.itemState.itemRoomId[id];
    const corpse = snapshot.worldItems.find((item: { id: string }) => item.id === "saunacorpse");
    corpse.name = "woman";
    corpse.description = "The unnamed woman.";
    corpse.vocab = ["woman", "corpse", "body"];
    const fridge = snapshot.worldItems.find((item: { id: string }) => item.id === "FridgeDoor");
    fridge.overrides = { open: "The locked door won't budge." };
    window.localStorage.setItem("aysf:resume", JSON.stringify(snapshot));

    let restored = (await restoreResumeSnapshot())!;
    expect(restored).not.toBeNull();
    expect(restored.moves).toBe(state.moves);
    expect(restored.worldState.doors.SteamRoomDoor.isOpen).toBe(true);
    expectInventoryToContain(restored, "Cooler");
    expect(restored.itemState.containerContents.Cooler).toContain("saunacorpsepurse");
    expect(restored.itemState.itemRoomId.saunacorpsepurse).toBe("Cooler");
    expect(restored.world.items.find((item) => item.id === "saunacorpse")?.description).toContain("Freeny Salk");
    expect(restored.world.items.find((item) => item.id === "FridgeDoor")?.overrides?.open).toBeUndefined();
    restored = await runCommand(restored, "take carving knife");
    expectInventoryToContain(restored, "CarvingKnife");
    expect(restored.itemState.itemRoomId.SecretLabWhiteboard).toBe("SecretLab");

    expect(saveResumeSnapshot(restored)).toBe(true);
    const again = (await restoreResumeSnapshot())!;
    expectInventoryToContain(again, "CarvingKnife");
    expect(again.itemState.itemRoomId.CarvingKnife).toBe("INVENTORY");
    expect(again.world.items.filter((item) => item.id === "CarvingKnife")).toHaveLength(1);
  });
});
