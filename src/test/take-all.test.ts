import { afterEach, describe, expect, it, vi } from "vitest";
import { doTake } from "../game/actions/take/take";
import { doTakeAll } from "../game/actions/take/takeAll";
import { tryTakeItem } from "../game/actions/take/tryTakeItem";
import { handleCommand } from "../game/engine/handleCommand";
import * as turn from "../game/engine/turn";
import * as takeEffects from "../game/registries/takeItemEffectRegistry";
import * as scripts from "../game/helpers/gameHelpers";
import { getFlashlightDefaults } from "../game/helpers/flashlightHelpers";
import { AQUARIUM_DROWNING_DAMAGE_PER_TURN, AQUARIUM_OXYGEN_LOSS_PER_TURN } from "../game/helpers/environmentHelpers";
import { PARK_EAST_POWER_KEY_SNATCH_EVENT_ID } from "../game/helpers/parkKeyHijack";
import { setItemOpen } from "../game/rules/containers";
import { updateItemLocation } from "../game/rules/items";
import { addToInventory, inventoryHas } from "../game/rules/state";
import { getItemsInCurrentRoom } from "../game/selectors/roomSelectors";
import type { GameState } from "../game/types/gameTypes";
import type { Item } from "../game/types/itemTypes";
import { parseCommand } from "../parse/parser";
import { createTestState, patchRoomDarkness, runCommand, setInventory } from "./helpers/gameTestHelpers";

afterEach(() => vi.restoreAllMocks());

function item(id: string, patch: Partial<Item> = {}): Item {
  return {
    id, name: id, vocab: [id], description: "A test object.",
    location: "StairWellSeven", itemCategory: "collectable", itemClass: "solid",
    itemSize: 1, itemWeight: 1, ...patch,
  };
}

function fixture(items: Item[], roomId = "StairWellSeven"): GameState {
  const base = setInventory(createTestState({ roomId, rng: () => 0.99 }), []);
  return {
    ...base, world: { ...base.world, items },
    itemState: {
      ...base.itemState, itemRoomId: {}, attachedTo: {}, openItems: {},
      containerContents: {}, surfaceContents: {}, underContents: {}, searchableContents: {},
    },
  };
}

function contents(state: GameState, host: string, ids: string[], kind: "containerContents" | "surfaceContents" = "containerContents"): GameState {
  return { ...state, itemState: { ...state.itemState, [kind]: { ...state.itemState[kind], [host]: ids } } };
}

const inventory = (state: GameState) => Object.values(state.player.inventory).flat();
const message = (state: GameState) => state.log.join("\n");

describe("native TAKE ALL", () => {
  it.each(["take all", "get all", "pick up all", "  PICK   UP ALL  "])("parses and executes %j", async (input) => {
    expect(parseCommand(input)).toMatchObject({ type: "action", verb: "take", direct: "all" });
    const next = await runCommand(fixture([item("note"), item("radio")]), input);
    expect(inventory(next)).toEqual(["note", "radio"]);
    expect(next.moves).toBe(1);
    expect(message(next)).toContain("You take note and radio.");
  });

  it("collects the real starting-room objects without revealing or searching the corpse", async () => {
    const start = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual(expect.arrayContaining(["MysteriousNote", "brokenFlashlight", "seed"]));
    expect(inventory(next)).not.toContain("BombTimer");
    expect(getItemsInCurrentRoom(next).map((item) => item.id)).toContain("UnderTheStairwellDeadMan");
    expect(message(next)).not.toMatch(/bomb timer|countdown timer/i);
    expect(next.moves).toBe(1);
    expect(inventory(start)).toEqual(["Comet"]);
  });

  it.each([{ items: [] }, { items: [item("wall", { itemCategory: "scenery" })] }])("reports nothing collectible and still uses one turn", async ({ items }) => {
    const next = await runCommand(fixture(items), "take all");
    expect(message(next)).toContain("There's nothing here you can take.");
    expect(inventory(next)).toEqual([]);
    expect(next.moves).toBe(1);
  });

  it("excludes fixed scenery, creatures, NPCs, fluids, attachments, carried items and distant objects", async () => {
    const blocked = vi.fn(() => "Leave it alone.");
    const initial = fixture([
      item("note"), item("wall", { itemCategory: "scenery", overrides: { take: blocked } }),
      item("terminal", { itemCategory: "static" }), item("cat", { itemCategory: "animate" }),
      item("living", { meta: { isAlive: true } }), item("SpotBot"),
      item("water", { itemCategory: "fluid" }), item("attached"), item("carried"),
      item("distant", { location: "ThreeWestBed" }),
    ]);
    const start = { ...setInventory(initial, ["carried"]), itemState: { ...initial.itemState, attachedTo: { attached: "wall" } } };
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual(["carried", "note"]);
    expect(blocked).not.toHaveBeenCalled();
    expect(message(next)).toContain("You take note.");
    expect(message(next)).not.toMatch(/distant|attached|living|terminal/);
    expect(next.itemState.itemRoomId.note).toBe("INVENTORY");
    expect(next.world.items.find((item) => item.id === "note")?.location).toBe("INVENTORY");
    expect(getItemsInCurrentRoom(next).map((item) => item.id)).not.toContain("note");
  });

  it("does not open closed or transparent inaccessible containers or disclose their contents", async () => {
    const box = item("box", { itemCategory: "static", isContainer: true, isOpenable: true,
      meta: { transparentContainer: true, contentsAccessibleWhenClosed: false } });
    const start = contents(fixture([box, item("hidden jewel", { location: "box" })]), "box", ["hidden jewel"]);
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual([]);
    expect(next.itemState.openItems.box).not.toBe(true);
    expect(next.itemState.containerContents.box).toEqual(["hidden jewel"]);
    expect(message(next)).not.toContain("hidden jewel");
  });

  it("takes visible direct contents of open containers and surfaces using normal placement rules", async () => {
    const box = item("box", { itemCategory: "static", isContainer: true, isOpenable: true });
    const table = item("table", { itemCategory: "scenery", isSurface: true });
    let start = fixture([box, table, item("coin", { location: "box" }), item("letter", { location: "table" })]);
    start = setItemOpen(contents(contents(start, "box", ["coin"]), "table", ["letter"], "surfaceContents"), "box", true);
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual(["letter", "coin"]);
    expect(next.itemState.containerContents.box).toEqual([]);
    expect(next.itemState.surfaceContents.table).toEqual([]);
    for (const id of ["letter", "coin"]) expect(next.itemState.itemRoomId[id]).toBe("INVENTORY");
  });

  it("uses the real supply locker's closed and open acquisition rules", async () => {
    const start = patchRoomDarkness(createTestState({ roomId: "SupplyPlatform", rng: () => 0.99 }), "SupplyPlatform", false);
    const locker = start.world.items.find((item) => item.id === "ReactorSupplyLocker")!;
    const ids = start.itemState.containerContents[locker.id];
    expect(ids.length).toBeGreaterThan(0);
    const closed = doTakeAll(start);
    expect(inventory(closed.state)).not.toEqual(expect.arrayContaining(ids));
    expect(closed.message).not.toContain(start.world.items.find((item) => item.id === ids[0])!.name);
    const next = doTakeAll(setItemOpen(start, locker.id, true)).state;
    expect(inventory(next)).toEqual(expect.arrayContaining(ids));
    expect(next.itemState.containerContents[locker.id]).toEqual([]);
  });

  it("does not recursively empty nested containers or collect under/search contents", () => {
    const outer = item("outer", { itemCategory: "static", isContainer: true, isOpenable: true });
    const inner = item("inner", { isContainer: true, isOpenable: true });
    let start = fixture([outer, inner, item("secret", { location: "inner" }), item("under"), item("searched")]);
    start = contents(contents(start, "outer", ["inner"]), "inner", ["secret"]);
    start = setItemOpen(setItemOpen(start, "outer", true), "inner", true);
    start = { ...start, itemState: { ...start.itemState, underContents: { outer: ["under"] }, searchableContents: { outer: ["searched"] } } };
    const next = doTakeAll(start);
    expect(inventory(next.state)).toEqual(["inner"]);
    expect(next.message).not.toMatch(/secret|under|searched/);
    expect(next.state.itemState.containerContents.inner).toEqual(["secret"]);
  });

  it("keeps direct open contents reachable when their portable container is collected first", () => {
    const box = item("box", { isContainer: true, isOpenable: true });
    const start = setItemOpen(contents(fixture([box, item("coin", { location: "box" })]), "box", ["coin"]), "box", true);
    const next = doTakeAll(start).state;
    expect(inventory(next)).toEqual(["box", "coin"]);
    expect(next.itemState.containerContents.box).toEqual([]);
  });

  it("excludes every unseen item in darkness without leaking names", async () => {
    const start = patchRoomDarkness(fixture([item("secret note"), item("hidden radio")]), "StairWellSeven", true);
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual([]);
    expect(message(next)).toContain("There's nothing here you can take.");
    expect(message(next)).not.toMatch(/secret note|hidden radio/);
  });

  it("allows collection by existing flashlight visibility and drains it only once", async () => {
    const base = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
    const start = setInventory(patchRoomDarkness(base, "StairWellSeven", true), ["flashlight"]);
    start.itemState.itemSettings.flashlight = { ...getFlashlightDefaults("flashlight"), isOn: true };
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toContain("MysteriousNote");
    expect(next.itemState.itemSettings.flashlight).toMatchObject({ currentCharge: 99.95 });
    expect(next.moves).toBe(1);
  });

  it("preserves a real prerequisite failure alongside a successful acquisition", async () => {
    let start = createTestState({ roomId: "GymWeightRoom", rng: () => 0.99 });
    start = updateItemLocation(start, "MysteriousNote", "GymWeightRoom");
    const single = doTake(start, parseCommand("take yellow badge"));
    const next = await runCommand(start, "take all");
    expect(single.message).toContain("You'll need to move him first.");
    expect(message(next)).toContain(single.message!);
    expect(inventory(next)).toContain("MysteriousNote");
    expect(inventory(next)).not.toContain("yellowbadge");
    expect(next.player.objectives).toContainEqual(expect.objectContaining({ id: "obtain_yellow_badge", status: "active" }));
    expect(next.itemState.itemRoomId.yellowbadge).toBe(start.itemState.itemRoomId.yellowbadge);
  });

  it("preserves the real park key snatch override, without retrying or losing other items", async () => {
    let start = createTestState({ roomId: "ParkEast", rng: () => 0.99 });
    start = updateItemLocation(start, "MysteriousNote", "ParkEast");
    const key = start.world.items.find((item) => item.id === "PowerStationKey")!;
    const take = vi.fn(key.overrides!.take);
    start = { ...start, world: { ...start.world, items: start.world.items.map((item) => item.id === key.id ? { ...item, overrides: { ...item.overrides, take } } : item) } };
    const next = await runCommand(start, "take all");
    expect(take).toHaveBeenCalledTimes(1);
    expect(message(next)).toContain('"Trash detected."');
    expect(inventory(next)).not.toContain(key.id);
    expect(inventory(next)).toContain("MysteriousNote");
    expect(next.itemState.containerContents.TrashBotBin).toContain(key.id);
    expect(next.worldState.scriptedEventsTripped[PARK_EAST_POWER_KEY_SNATCH_EVENT_ID]).toBe(true);
  });

  it("preserves authored messages and custom acquisition state exactly once", () => {
    const take = vi.fn(({ state, item }: { state: GameState; item: Item }) => ({
      state: addToInventory(updateItemLocation(state, item.id, "INVENTORY"), item.id),
      message: "The seal breaks with a musical sigh.",
    }));
    const start = fixture([item("artifact", { overrides: { take } }), item("letter", { overrides: { take: "You fold the letter carefully." } })]);
    const result = doTakeAll(start);
    expect(inventory(result.state)).toEqual(["artifact", "letter"]);
    expect(result.message).toContain("artifact: The seal breaks with a musical sigh.");
    expect(result.message).toContain("letter: You fold the letter carefully.");
    expect(take).toHaveBeenCalledTimes(1);
    expect(doTakeAll(result.state).message).toBe("There's nothing here you can take.");
    expect(take).toHaveBeenCalledTimes(1);
  });

  it("executes registered aquarium effects once and preserves the authored danger message", () => {
    const start = createTestState({ roomId: "AqGoal", rng: () => 0.99 });
    const effects = vi.spyOn(takeEffects, "applyRegisteredTakeItemEffects");
    const result = doTakeAll(start);
    expect(inventory(result.state)).toContain("AqControlNode");
    expect(result.state.worldState.octopusState.returnChokeActive).toBe(true);
    expect(result.message).toContain("knots itself across the return run");
    expect(effects.mock.calls.filter(([, item]) => item.id === "AqControlNode")).toHaveLength(1);
    doTakeAll(result.state);
    expect(effects.mock.calls.filter(([, item]) => item.id === "AqControlNode")).toHaveLength(1);
  });

  it("uses exact targets for objects with the same name and prevents duplicate acquisitions", () => {
    const take = vi.fn(() => undefined);
    const box = item("box", { itemCategory: "static", isContainer: true, isOpenable: false });
    const start = contents(fixture([box, item("first", { name: "coin", overrides: { take } }), item("second", { name: "coin" }), item("first", { name: "coin" })]), "box", ["first", "first"]);
    const result = doTakeAll(start);
    expect(inventory(result.state)).toEqual(["second", "first"]);
    expect(take).toHaveBeenCalledTimes(1);
    expect(result.state.itemState.containerContents.box).toEqual([]);
    expect(inventory(doTakeAll(result.state).state)).toEqual(["second", "first"]);
  });

  it("preserves deterministic order, applies prerequisites to the latest state, and continues after failure", () => {
    const order: string[] = [];
    const prerequisite = ({ state, item }: { state: GameState; item: Item }) => {
      order.push(item.id);
      return inventoryHas(state.player.inventory, "key") ? undefined : { state, message: "You need the key." };
    };
    const start = fixture([item("key"), item("locked", { overrides: { take: prerequisite } }), item("blocked", { overrides: { take: ({ state }: { state: GameState }) => ({ state, message: "It won't come loose." }) } }), item("radio")]);
    const result = doTakeAll(start);
    expect(inventory(result.state)).toEqual(["key", "locked", "radio"]);
    expect(order).toEqual(["locked"]);
    expect(result.message).toBe("You take key and locked.\n\nblocked: It won't come loose.\n\nYou take radio.");
  });

  it("rechecks container access without disclosing contents that become hidden", () => {
    const box = item("box", { itemCategory: "static", isContainer: true, isOpenable: true });
    const closeBox = ({ state }: { state: GameState }) => ({ state: setItemOpen(state, "box", false), message: "The lid snaps shut." });
    const start = setItemOpen(contents(fixture([item("trigger", { overrides: { take: closeBox } }), box, item("jewel", { location: "box" })]), "box", ["jewel"]), "box", true);
    const result = doTakeAll(start);
    expect(result.message).toContain("The lid snaps shut.");
    expect(result.message).not.toContain("jewel");
    expect(inventory(result.state)).not.toContain("jewel");
  });

  it("does not take objects newly revealed by an acquisition", () => {
    const reveal = ({ state }: { state: GameState }) => ({ state: updateItemLocation(state, "secret", "StairWellSeven"), message: "Something falls out." });
    const result = doTakeAll(fixture([item("trigger", { overrides: { take: reveal } }), item("secret", { location: "NOWHERE" }), item("radio")]));
    expect(inventory(result.state)).toEqual(["radio"]);
    expect(result.message).not.toContain("secret");
    expect(inventory(doTakeAll(result.state).state)).toContain("secret");
  });

  it("does not empty a container newly opened by another item's override", () => {
    const box = item("box", { itemCategory: "static", isContainer: true, isOpenable: true });
    const openBox = ({ state }: { state: GameState }) => ({ state: setItemOpen(state, "box", true), message: "The lid springs open." });
    const start = contents(fixture([item("trigger", { overrides: { take: openBox } }), box, item("secret", { location: "box" })]), "box", ["secret"]);
    const result = doTakeAll(start);
    expect(result.state.itemState.openItems.box).toBe(true);
    expect(inventory(result.state)).not.toContain("secret");
    expect(result.message).not.toContain("secret");
    expect(inventory(doTakeAll(result.state).state)).toContain("secret");
  });

  it("skips an initial candidate already granted by an earlier acquisition effect", () => {
    const take = vi.fn(() => undefined);
    const grantBoth = ({ state }: { state: GameState }) => ({
      state: addToInventory(addToInventory(updateItemLocation(updateItemLocation(state, "gift", "INVENTORY"), "trigger", "INVENTORY"), "gift"), "trigger"),
      message: "You receive the gift as well.",
    });
    const result = doTakeAll(fixture([item("trigger", { overrides: { take: grantBoth } }), item("gift", { overrides: { take } })]));
    expect(inventory(result.state)).toEqual(["gift", "trigger"]);
    expect(take).not.toHaveBeenCalled();
  });

  it("respects the real power key's locked ownership in an accessible keyhole", () => {
    let start = createTestState({ roomId: "PowerGrid" });
    const keyhole = start.world.items.find((item) => item.id === "PowerStationKeyhole")!;
    expect(keyhole).toBeDefined();
    start = updateItemLocation(start, "PowerStationKey", keyhole.id);
    start = contents(start, keyhole.id, ["PowerStationKey"]);
    start = { ...start, worldState: { ...start.worldState, powerRestoredSections: { ...start.worldState.powerRestoredSections, "power-key-turned": true } } };
    start = patchRoomDarkness(start, "PowerGrid", false);
    const result = doTakeAll(start);
    expect(result.message).toContain("you can't pull it free again");
    expect(inventory(result.state)).not.toContain("PowerStationKey");
    expect(result.state.itemState.containerContents[keyhole.id]).toEqual(["PowerStationKey"]);
  });

  it("stops collecting when an override removes visibility, moves the player, or ends the game", () => {
    const changes = [
      (state: GameState) => patchRoomDarkness(state, "StairWellSeven", true),
      (state: GameState) => ({ ...state, player: { ...state.player, roomId: "ThreeWestBed" } }),
      (state: GameState) => ({ ...state, worldState: { ...state.worldState, gameOver: { message: "The end." } as GameState["worldState"]["gameOver"] } }),
    ];
    for (const change of changes) {
      const take = vi.fn();
      const start = fixture([item("trigger", { overrides: { take: ({ state }: { state: GameState }) => ({ state: change(state), message: "Everything changes." }) } }), item("radio", { overrides: { take } })]);
      expect(doTakeAll(start).message).not.toContain("radio");
      expect(take).not.toHaveBeenCalled();
    }
  });

  it("advances command time and turn-end scripts once, after every acquisition", async () => {
    const tick = vi.spyOn(turn, "advanceTurn");
    const events = vi.spyOn(scripts, "runScriptedEvents");
    const start = fixture([item("one"), item("two"), item("three")]);
    const next = await runCommand(start, "take all");
    expect(tick).toHaveBeenCalledTimes(1);
    expect(inventory(tick.mock.calls[0][0])).toEqual(["one", "two", "three"]);
    expect(events.mock.calls.filter(([, context]) => context.kind === "onTurnEnd")).toHaveLength(1);
    expect(next.moves).toBe(start.moves + 1);
  });

  it("advances a real status timer and NPC idle update once", async () => {
    let start = createTestState({ roomId: "GymWeightRoom", rng: () => 0.99 });
    start = updateItemLocation(updateItemLocation(start, "MysteriousNote", "GymWeightRoom"), "brokenFlashlight", "GymWeightRoom");
    start = { ...start, player: { ...start.player, statusEffects: [{ id: "stronger", intensity: 1, remainingTurns: 10 }] } };
    const next = await runCommand(start, "take all");
    expect(inventory(next)).toEqual(expect.arrayContaining(["MysteriousNote", "brokenFlashlight"]));
    expect(next.player.statusEffects.find((effect) => effect.id === "stronger")?.remainingTurns).toBe(9);
    expect(next.log.filter((line) => line.includes("The robot gives the weight bench an encouraging slap"))).toHaveLength(1);
    expect(next.moves).toBe(1);
  });

  it("charges one real underwater oxygen/hazard tick for multiple items", async () => {
    for (const oxygen of [AQUARIUM_OXYGEN_LOSS_PER_TURN * 2, 0]) {
      let start = createTestState({ roomId: "AqOpen1", rng: () => 0.99 });
      start = updateItemLocation(updateItemLocation(start, "MysteriousNote", "AqOpen1"), "brokenFlashlight", "AqOpen1");
      start = { ...start, player: { ...start.player, vitals: { ...start.player.vitals, oxygen, health: 50 } } };
      const next = await runCommand(start, "take all");
      expect(inventory(next)).toEqual(expect.arrayContaining(["MysteriousNote", "brokenFlashlight"]));
      expect(next.player.vitals.oxygen).toBe(Math.max(0, oxygen - AQUARIUM_OXYGEN_LOSS_PER_TURN));
      expect(next.player.vitals.health).toBe(oxygen === 0 ? 50 - AQUARIUM_DROWNING_DAMAGE_PER_TURN : 50);
      expect(next.moves).toBe(1);
    }
  });

  it("preserves acquisition scores, inventory buckets and objective reconciliation", async () => {
    let start = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
    start = updateItemLocation(start, "greenbadge", "StairWellSeven");
    start = updateItemLocation(start, "orangebadge", "StairWellSeven");
    const next = await runCommand(start, "take all");
    expect(next.player.inventory.badges).toContain("greenbadge");
    expect(next.worldState.scoresTriggered.obtained_green_badge).toBe(true);
    expect(next.player.objectives).toContainEqual(expect.objectContaining({ id: "find_zoologist", status: "completed" }));
    const repeated = await runCommand(next, "take all");
    expect(repeated.score).toBe(next.score);
    expect(repeated.uiState.notifications.filter((notice) => notice.kind === "score")).toHaveLength(next.uiState.notifications.filter((notice) => notice.kind === "score").length);
  });

  it("preserves single-item TAKE resolution, failure messages and transcript formatting", async () => {
    const start = fixture([item("radio"), item("wall", { itemCategory: "scenery", overrides: { take: "It is bolted down." } })]);
    expect(tryTakeItem(start, "radio").message).toBe("Taken.");
    const output = vi.fn();
    const next = await handleCommand(start, parseCommand("take radio"), { onOutput: output });
    expect(next.log).toEqual(["> take radio\nTaken.\n\n"]);
    expect(output).toHaveBeenCalledExactlyOnceWith(["> take radio\nTaken.\n\n"]);
    expect((await runCommand(start, "take wall")).log).toEqual(["> take wall\nIt is bolted down.\n\n"]);
    expect((await runCommand(start, "take distant")).log).toEqual(["> take distant\nYou don't see that here.\n\n"]);
    expect(parseCommand("pick up radio")).toMatchObject({ verb: "take", direct: "radio" });
    expect((await runCommand(start, "pick up radio")).player.inventory).toEqual(next.player.inventory);
  });

  it("keeps one command echo and output callback even with a full transcript", async () => {
    const start = { ...fixture([item("note"), item("radio")]), log: Array(500).fill("old") };
    const output = vi.fn();
    const next = await handleCommand(start, parseCommand("get all"), { onOutput: output });
    expect(output).toHaveBeenCalledExactlyOnceWith(["> get all\nYou take note and radio.\n\n"]);
    expect(next.log).toHaveLength(500);
    expect(next.log.at(-1)).toBe("> get all\nYou take note and radio.\n\n");
    expect(message(next).match(/> /g)).toHaveLength(1);
  });

  it("does not apply ALL to other verbs or unsupported qualified forms", async () => {
    const start = fixture([item("radio")]);
    for (const input of ["drop all", "take all from box", "examine all"]) {
      expect(inventory(await runCommand(start, input))).toEqual([]);
    }
  });
});
