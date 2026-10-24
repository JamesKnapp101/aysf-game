import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import { createFreshGameState, FINAL_PLAYER_START_ROOM_ID } from "../game/gameInit";
import { INITIAL_OBJECTIVE, PLAYER_INSTRUCTIONS, runHeadlessAgent } from "../game/harness/agent";
import { evaluateScenario, injectInventory, prepareScenario, registerGoalPredicate, type Scenario } from "../game/harness/scenario";
import { listScenarios, loadScenario, registerScenario, resolveScenario } from "../game/harness/scenarios";
import { createHeadlessSession } from "../game/harness/session";
import type { SessionController, TranscriptEntry } from "../game/harness/types";
import { getItemPlacementContext, stashItemInContainer } from "../game/helpers/itemPlacement";
import { saveManualSnapshot, restoreResumeSnapshot, saveResumeSnapshot } from "../game/persistence/resumeStorage";
import { upsertDoorState } from "../game/rules/doors";
import { updateItemLocation } from "../game/rules/items";
import { createTestState, runCommand, setPlayerRoom } from "./helpers/gameTestHelpers";
import { useUIOverlayStore } from "../game/store/store";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { tickSpaOrganism } from "../world/maps/levelThree/Park/spaOrganism";
import { SPA_EXPLORED_ROOMS } from "../game/harness/scenarios/spa";
import { getPrimaryShipMapNodeForRoom, getShipMapNodeStatus } from "../game/map/shipMapModel";
import { getShipMapLabelLines } from "../game/map/shipMapPresentation";
import * as gameInit from "../game/gameInit";

const sessions: SessionController[] = [];
const directories: string[] = [];
function session(scenario?: Scenario) {
  const directory = resolve(".headless-transcripts", `scenario-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ scenario, transcriptDirectory: directory });
  sessions.push(controller);
  return controller;
}
function client(commands: string[], finish = false) {
  let index = 0;
  return { messages: {
    countTokens: vi.fn(async () => ({ input_tokens: 100 })),
    create: vi.fn<(params: MessageCreateParamsNonStreaming) => Promise<Message>>(async () => ({
      id: "mock", type: "message", role: "assistant", model: "mock", stop_sequence: null,
      content: finish ? [{ type: "text", text: "I succeeded!", citations: null }] :
        [{ type: "tool_use", id: `tool-${index}`, name: "game_command", input: { command: commands[index++] ?? "wait", goal: "Reach the assigned objective", reason: "Follow the visible lead." } }],
      stop_reason: finish ? "end_turn" : "tool_use",
      usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    }) as Message),
  } };
}
async function records(controller: SessionController): Promise<TranscriptEntry[]> {
  return (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
}
afterEach(async () => {
  for (const controller of sessions.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("scenario definitions and setup", () => {
  it("loads named scenarios and keeps optional properties optional", () => {
    expect(listScenarios()).toEqual(expect.arrayContaining(["spa-entry", "spa-trap", "spa-trap-informed"]));
    expect(loadScenario("spa-entry")).toMatchObject({ id: "spa-entry", startRoom: "WalkIn", inventory: ["CarvingKnife", "Cooler"] });
    expect(loadScenario("spa-trap").success).toHaveLength(5);
    expect(() => loadScenario("absent")).toThrow(/Unknown scenario.*spa-entry/);
    const original = loadScenario("spa-entry");
    Object.assign(original.success![0], { roomId: "Spa" });
    expect(loadScenario("spa-entry").success![0].roomId).toBe("Sauna");
    expect(resolveScenario()).toBeUndefined();
    expect(resolveScenario({ goal: "Investigate this room" })).toEqual({ id: "ad-hoc", objective: "Investigate this room" });
    expect(resolveScenario({ name: "spa-entry", startRoom: "Spa", inventory: ["Cooler"], goal: "Enter safely" }))
      .toMatchObject({ startRoom: "Spa", inventory: ["Cooler"], objective: "Enter safely", success: loadScenario("spa-entry").success });
    const custom = { id: `test-${randomUUID()}`, objective: "Explore" };
    registerScenario(custom);
    expect(loadScenario(custom.id)).toEqual(custom);
    expect(() => registerScenario(custom)).toThrow(/Duplicate scenario/);
  });

  it("prepares a fresh normal Spa without engine actions, events, or puzzle changes", async () => {
    const spy = vi.spyOn(engine, "handleCommand");
    const controller = session(loadScenario("spa-entry"));
    const opening = await controller.start();
    const status = controller.hostStatus!()!;
    expect(spy).not.toHaveBeenCalled();
    expect(Object.keys(opening)).toEqual(["sequence", "text"]);
    expect(status.initial).toMatchObject({ roomId: "WalkIn", moves: 0, alive: true });
    expect(status.gameTurns).toBe(0);
    expect(status.finalGameState!.itemState.itemRoomId).toMatchObject({ CarvingKnife: "INVENTORY", Cooler: "INVENTORY", SpaOrganism: "Sauna" });
    expect(status.finalGameState!.worldState.chefSample).toBeUndefined();
    expect(status.finalGameState!.worldState.conditionalTriggers.SpaOrganismLeftSauna).toBeFalsy();
    expect(status.evaluation?.verified).toBe(false);
    const normal = createTestState();
    for (const id of ["CedarDoor", "SteamRoomDoor"]) expect(status.finalGameState!.worldState.doors[id]).toEqual(normal.worldState.doors[id]);
    expect(status.finalGameState!.worldState.darkRooms).toEqual(normal.worldState.darkRooms);
    expect(JSON.stringify(opening)).not.toMatch(/success|spa-contained|ChefSample|conditionalTriggers/);
    expect((await records(controller))[0]).toMatchObject({ scenario: { id: "spa-entry", inventory: ["CarvingKnife", "Cooler"] }, initialState: { roomId: "WalkIn" } });
    await controller.reset();
    expect(controller.hostStatus!()!.initial.roomId).toBe("WalkIn");
  });

  it("removes all old placements and duplicates without pickup side effects", () => {
    let initial = createTestState();
    initial = stashItemInContainer(initial, "CarvingKnife", "Cooler");
    initial = { ...initial, player: { ...initial.player, inventory: { general: ["CarvingKnife", "CarvingKnife"], badges: ["CarvingKnife"], keys: [] } },
      worldState: { ...initial.worldState, mensLockerContents: { ...initial.worldState.mensLockerContents, menLocker1: ["CarvingKnife"] } },
      itemState: { ...initial.itemState, attachedTo: { ...initial.itemState.attachedTo, CarvingKnife: "Cooler" },
        surfaceContents: { table: ["CarvingKnife"] }, underContents: { rug: ["CarvingKnife"] },
        searchableContents: { crate: ["CarvingKnife"] }, containerFilled: { cup: ["CarvingKnife"] } } };
    const next = injectInventory(initial, ["CarvingKnife", "Cooler", "CarvingKnife"]);
    expect(Object.values(next.player.inventory).flat().filter(id => id === "CarvingKnife")).toHaveLength(1);
    expect(next.itemState.attachedTo.CarvingKnife).toBeUndefined();
    for (const lists of [next.itemState.containerContents, next.itemState.containerFilled, next.itemState.surfaceContents, next.itemState.underContents, next.itemState.searchableContents])
      expect(Object.values(lists).flat()).not.toContain("CarvingKnife");
    expect(next.world.items.filter(item => item.id === "CarvingKnife")).toHaveLength(1);
    expect(next.world.items.find(item => item.id === "CarvingKnife")!.location).toBe("INVENTORY");
    expect(next.itemState.itemRoomId.CarvingKnife).toBe("INVENTORY");
    expect(next.itemState.pickedUpByPlayer).toEqual(initial.itemState.pickedUpByPlayer);
    expect(next.worldState.mensLockerContents.menLocker1).not.toContain("CarvingKnife");
    expect(next.player.statusEffects).toEqual(initial.player.statusEffects);
    expect(next.moves).toBe(initial.moves);
    expect(initial.itemState.containerContents.Cooler).toContain("CarvingKnife");
  });

  it("supports explicit prerequisite state and isolates changes from permanent definitions", async () => {
    const initial = createTestState();
    const scenario: Scenario = { id: "prerequisite", objective: "Investigate", startRoom: "Spa", prerequisites: [{
      description: "Open cedar door and set a power flag",
      apply: state => {
        state.world.items.find(item => item.id === "CarvingKnife")!.name = "session-local";
        return { ...upsertDoorState(state, { id: "CedarDoor", isOpen: true, isLocked: false }),
          worldState: { ...state.worldState, doors: { ...state.worldState.doors, CedarDoor: { id: "CedarDoor", isOpen: true, isLocked: false } },
            powerRestoredSections: { ...state.worldState.powerRestoredSections, "lights-level-three": true } } };
      },
    }] };
    const prepared = prepareScenario(initial, scenario);
    expect(prepared.moves).toBe(initial.moves);
    expect(prepared.worldState.doors.CedarDoor.isOpen).toBe(true);
    expect(prepared.worldState.powerRestoredSections["lights-level-three"]).toBe(true);
    expect(initial.world.items.find(item => item.id === "CarvingKnife")!.name).not.toBe("session-local");
    const fresh = await createFreshGameState();
    expect(fresh.player.roomId).toBe(FINAL_PLAYER_START_ROOM_ID);
    expect(fresh.player.inventory.general).not.toContain("CarvingKnife");
    expect(fresh.worldState.doors.CedarDoor?.isOpen).not.toBe(true);
  });

  it.each([
    { id: "", objective: "Try" }, { id: "bad", objective: "" },
    { id: "bad", objective: "Try", inventory: ["Cooler", "Cooler"] },
    { id: "bad", objective: "Try", startRoom: "missing-room" },
    { id: "bad", objective: "Try", inventory: ["missing-item"] },
    { id: "bad", objective: "Try", budgets: { maxActions: 0 } },
    { id: "bad", objective: "Try", success: [{ type: "unknown" }] },
    { id: "bad", objective: "Try", success: [{ type: "player-room", roomId: "missing" }] },
    { id: "bad", objective: "Try", success: [{ type: "door", doorId: "missing", open: false }] },
    { id: "bad", objective: "Try", success: [{ type: "door", doorId: "CedarDoor", open: "false" }] },
    { id: "bad", objective: "Try", success: [{ type: "item-location", itemId: "Cooler", roomId: "WalkIn", containerId: "Cooler" }] },
    { id: "bad", objective: "Try", success: [{ type: "world-state", path: ["typo"], equals: true }] },
    { id: "bad", objective: "Try", prerequisites: [{ description: "Accidental turn", apply: state => ({ ...state, moves: state.moves + 1 }) }] },
    { id: "bad", objective: "Try", inventory: ["Cooler"], prerequisites: [{ description: "Stale placement", apply: state => updateItemLocation(state, "Cooler", "WalkIn") }] },
  ] satisfies Scenario[])("rejects invalid configuration %j", scenario => {
    expect(() => prepareScenario(createTestState(), scenario)).toThrow(/Scenario configuration:/);
  });

  it("reports missing world IDs before any paid model request", async () => {
    const sdk = client(["wait"]);
    const controller = session({ id: "bad", objective: "Try", startRoom: "typo" });
    const run = await runHeadlessAgent({ client: sdk, session: controller });
    expect(run.reason).toBe("initialization_failure");
    expect(run.configurationError).toContain("typo");
    expect(run.termination).toBe("error");
    expect(sdk.messages.create).not.toHaveBeenCalled();
    expect(await fs.readFile(run.reportPath, "utf8")).toContain("Scenario setup error");
  });

  it("keeps ordinary gameplay, the default prompt, and saved game data unchanged", async () => {
    const sdk = client(["wait"]);
    const controller = session();
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 1 } });
    expect(run.objective).toBe(INITIAL_OBJECTIVE);
    expect(run.playtest!.initial.roomId).toBe(FINAL_PLAYER_START_ROOM_ID);
    expect(run.playtest!.scenario).toBeUndefined();
    expect(sdk.messages.create.mock.calls[0][0].system).toBe(PLAYER_INSTRUCTIONS);
    expect(run.reason).toBe("action_limit");
    expect((await records(controller))[0]).not.toHaveProperty("scenario");
    const initial = createTestState();
    initial.world = { ...initial.world, meta: { ...initial.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
    const prepared = prepareScenario(initial, loadScenario("spa-entry"));
    expect(saveManualSnapshot(prepared)).toBe(true);
    expect(saveResumeSnapshot(prepared)).toBe(true);
    const saved = localStorage.getItem("aysf:resume")!;
    expect(saved).not.toMatch(/spa-entry|prerequisites|successConditions|objective.*Find a way/);
    const restored = (await restoreResumeSnapshot())!;
    expect(restored.player.roomId).toBe("WalkIn");
    expect(restored.itemState.itemRoomId.Cooler).toBe("INVENTORY");
  });
});

describe("informed Spa knowledge prerequisite", () => {
  it("inherits the blind scenario and adds only the ordinary whiteboard log record", async () => {
    const blind = loadScenario("spa-trap");
    const informed = loadScenario("spa-trap-informed");
    expect(informed).toEqual({ ...blind, id: "spa-trap-informed", prerequisites: informed.prerequisites });
    expect(blind.prerequisites).toBeUndefined();
    const initial = createTestState();
    const preparedBlind = prepareScenario(initial, blind);
    const preparedInformed = prepareScenario(initial, informed);
    const discovered = await runCommand(setPlayerRoom(preparedBlind, "SecretLab"), "read whiteboard");
    const entry = discovered.player.log.at(-1)!;
    expect(entry.body).toBe(initial.world.items.find(item => item.id === "SecretLabWhiteboard")!.readableText);
    expect(preparedInformed).toEqual({ ...preparedBlind, player: { ...preparedBlind.player, log: [...preparedBlind.player.log, entry] } });
    expect(preparedBlind.player.log).toEqual(initial.player.log);
    const examined = await runCommand(setPlayerRoom(preparedBlind, "SecretLab"), "examine whiteboard");
    expect(examined.player.log).toEqual(initial.player.log);
  });

  it.each(["spa-trap-informed", "spa-trap"])("exposes only acquired knowledge through normal log views in %s, without setup actions", async name => {
    const controller = session(loadScenario(name));
    const spy = vi.spyOn(engine, "handleCommand");
    const opening = await controller.start();
    expect(spy).not.toHaveBeenCalled();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    const status = controller.hostStatus!()!;
    expect(status.initial).toMatchObject({ roomId: "WalkIn", moves: 0 });
    expect(status.gameTurns).toBe(0);
    expect(status.finalGameState!.worldState.visitedRooms.SecretLab).toBeFalsy();
    expect(status.finalGameState!.worldState.conditionalTriggers.EeglerSecretLabOpen).toBeFalsy();
    const whiteboard = createTestState().world.items.find(item => item.id === "SecretLabWhiteboard")!;
    const listing = await controller.explorer.information("log");
    if (name === "spa-trap-informed") {
      expect(listing.text.join("\n")).toContain(whiteboard.name);
      const entries = status.finalGameState!.player.log;
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({ source: whiteboard.name, title: whiteboard.name, body: whiteboard.readableText, loggedAtTurn: 0 });
      expect((await controller.explorer.information("log", 1)).text.join("\n")).toContain(entries[0].body);
      expect(JSON.stringify(opening)).not.toContain(entries[0].body);
      await controller.reset();
      expect(controller.hostStatus!()!.finalGameState!.player.log).toEqual(entries);
    } else {
      expect(status.finalGameState!.player.log).toEqual([]);
      expect(listing.text.join("\n")).not.toContain(whiteboard.name);
      expect((await controller.explorer.information("log", 1)).text.join("\n")).toContain("Choose a record number");
    }
    expect(spy).not.toHaveBeenCalled();
    expect(controller.hostStatus!()!.gameTurns).toBe(0);
  });

  it("lets the agent retrieve the clue through its knowledge tool without injecting it into the prompt", async () => {
    const controller = session(loadScenario("spa-trap-informed"));
    const sdk = client([]);
    sdk.messages.create.mockImplementationOnce(async () => ({
      content: [{ type: "tool_use", id: "log", name: "game_information", input: { view: "log", record: 1 } }],
      stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    }) as Message);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 1 } });
    const body = run.playtest!.finalGameState!.player.log[0].body;
    const params = sdk.messages.create.mock.calls[0][0];
    expect(params.system).toContain(loadScenario("spa-trap").objective);
    expect(JSON.stringify(params)).not.toContain(body);
    expect(run.events[0]).toMatchObject({ request: ":log 1" });
    expect(run.events[0].text.join("\n")).toContain(body);
    expect(run.playtest!.gameTurns).toBe(0);
  });
});

describe("map familiarity and death recovery", () => {
  it("marks only requested map visits and preserves other state without entry events", async () => {
    const initial = createTestState({ roomId: FINAL_PLAYER_START_ROOM_ID });
    const scenario = loadScenario("spa-trap-informed");
    const familiar = prepareScenario(initial, scenario);
    const unfamiliar = prepareScenario(initial, { ...scenario, exploredRooms: [] });
    expect(familiar).toEqual({ ...unfamiliar, worldState: { ...unfamiliar.worldState, visitedRooms: {
      ...unfamiliar.worldState.visitedRooms, ...Object.fromEntries(SPA_EXPLORED_ROOMS.map(id => [id, true])),
    } } });
    expect(familiar.moves).toBe(0);
    expect(familiar.player.roomId).toBe("WalkIn");
    expect(familiar.player.log).toHaveLength(1);
    for (const id of SPA_EXPLORED_ROOMS) {
      expect(familiar.worldState.visitedRooms[id]).toBe(true);
      expect(getShipMapNodeStatus(familiar, getPrimaryShipMapNodeForRoom(id)!)).toBe("visited");
    }
    for (const id of ["Sauna", "SteamRoom", "SecretLab", "ParkMaintenanceInterior", "UpOnTheRoof", "NailSalon"]) {
      expect(familiar.worldState.visitedRooms[id]).toBeFalsy();
      const node = getPrimaryShipMapNodeForRoom(id);
      if (node) expect(getShipMapLabelLines(familiar, node)).toEqual([]);
    }
    const fresh = await createFreshGameState();
    expect(fresh.player.roomId).toBe(FINAL_PLAYER_START_ROOM_ID);
    for (const id of SPA_EXPLORED_ROOMS) expect(fresh.worldState.visitedRooms[id]).toBeFalsy();
  });

  it("exposes the familiar Park through the existing headless map tool without injecting routes into the prompt", async () => {
    const controller = session(loadScenario("spa-trap-informed"));
    const sdk = client([]);
    sdk.messages.create.mockImplementationOnce(async () => ({
      content: [{ type: "tool_use", id: "map", name: "game_information", input: { view: "map", detail: "full", level: 3 } }],
      stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    }) as Message);
    const commandSpy = vi.spyOn(engine, "handleCommand");
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 1 } });
    const map = run.events[0].text.join("\n");
    expect(map).toContain("[visited] Spa:");
    expect(map).toContain("[visited] Restaurant:");
    expect(map).toContain("Park West");
    expect(map).not.toMatch(/Sauna|Steam Room|Secret.*Lab|Inside Maintenance/);
    expect(map).toContain("Lines are drawn strokes, not confirmed passages");
    expect(JSON.stringify(sdk.messages.create.mock.calls[0][0])).not.toContain("ParkWest");
    expect(commandSpy).not.toHaveBeenCalled();
    expect(run.playtest!.gameTurns).toBe(0);
    expect((await records(controller))[0].scenario!.exploredRooms).toEqual(SPA_EXPLORED_ROOMS);
  });

  it.each([
    { exploredRooms: ["missing"] }, { exploredRooms: ["Spa", "Spa"] },
    { exploredRooms: [""] }, { maxDeaths: 0 }, { maxDeaths: 1.5 },
  ])("rejects invalid map/death configuration %j", settings => {
    expect(() => prepareScenario(createTestState(), { ...loadScenario("spa-trap"), ...settings })).toThrow(/Scenario configuration/);
  });

  it("counts repeated deaths in the same room and stops on the third without resetting items or puzzle state", async () => {
    const freshSpy = vi.spyOn(gameInit, "createFreshGameState");
    const controller = session({ ...loadScenario("spa-trap-informed"), startRoom: "Spa" });
    const sdk = client(["drop cooler", "open sauna door", "north", "inventory", "north", "look", "north", "wait"]);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxDeaths: 3 } });
    expect(run.reason).toBe("death_limit");
    expect(freshSpy).toHaveBeenCalledTimes(1);
    expect(run.termination).toBe("death");
    expect(run.actions).toBe(7);
    expect(run.playtest).toMatchObject({ deaths: 3, recoveryAttempts: 2, final: { roomId: "Spa", alive: true } });
    expect(run.playtest!.deathEvents!.map(event => event.totalDeaths)).toEqual([1, 2, 3]);
    expect(run.playtest!.deathEvents!.every(event => event.count === 1 && event.regenerated && event.deathRoomIds[0] === "Sauna")).toBe(true);
    expect(run.playtest!.finalGameState!.worldState.doors.CedarDoor.isOpen).toBe(true);
    expect(run.playtest!.finalGameState!.itemState.itemRoomId).toMatchObject({ Cooler: "Spa", SpaOrganism: "Sauna" });
    expect(run.playtest!.final.inventory.general).not.toContain("Cooler");
    expect(run.playtest!.finalGameState!.player.log).toHaveLength(1);
    expect(run.objective).toBe(loadScenario("spa-trap").objective);
    const transcript = await records(controller);
    expect(transcript.filter(record => record.kind === "start")).toHaveLength(1);
    expect(transcript.some(record => record.kind === "reset" || record.event)).toBe(false);
    expect(transcript.filter(record => record.deathEvent).map(record => record.deathEvent!.totalDeaths)).toEqual([1, 2, 3]);
    expect(transcript.filter(record => record.recoveryAttempt).map(record => record.recoveryAttempt)).toEqual([1, 2]);
    const firstDeath = transcript.find(record => record.deathEvent)!;
    expect(firstDeath.observation.text.join("\n")).toContain("You died and regenerated. You are now in Spa.");
    expect(transcript.at(-1)!.agentSummary).toMatchObject({ maxDeaths: 3, recoveryAttempts: 2, reason: "death_limit", playtest: { deaths: 3 } });
    const report = await fs.readFile(run.reportPath, "utf8");
    expect(report).toContain("deaths during run: 3");
    expect(report).toContain("Recovery attempts (first request after each regeneration): 2");
    expect(report).toContain("Maximum deaths: 3");
    expect(report).toContain("detailed reason: death\\_limit");
    expect(report).toContain("Death and regeneration events");
  });

  it("permits verified Spa success after a failed experiment and normal regeneration", async () => {
    const scenario = loadScenario("spa-trap-informed");
    const controller = session(scenario);
    const commands = [
      "east", "east", "northeast", "northwest", "west", "open sauna door", "north",
      "east", "southeast", "southwest", "west", "west",
      "open cooler", "carve sample from chef", "put sample in cooler", "set cooler", "freeze", "close",
      "east", "east", "northeast", "northwest", "west", "open steam room door", "south", "drop cooler", "set cooler", "off", "close",
      "north", "turn lights off", "turn lights on", "close steam room door", "north",
    ];
    const sdk = client([...commands, "wait"]);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxDeaths: 3, maxActions: 60, maxTurns: 70 } });
    expect(run.reason, run.events.map(event => `${event.request}: ${event.text.join(" ")}`).join("\n")).toBe("scenario_success");
    expect(run.actions).toBe(commands.length);
    expect(run.playtest).toMatchObject({ deaths: 1, recoveryAttempts: 1, evaluation: { verified: true }, final: { roomId: "Sauna", alive: true } });
    expect(run.playtest!.evaluation!.checks.every(check => check.met)).toBe(true);
    expect(run.objective).toBe(scenario.objective);
    expect(new Set(sdk.messages.create.mock.calls.map(([params]) => params.system)).size).toBe(1);
    const afterDeathMessages = sdk.messages.create.mock.calls[7][0].messages;
    expect(JSON.stringify(afterDeathMessages)).toContain("You died and regenerated");
    expect((await records(controller)).filter(record => record.kind === "start")).toHaveLength(1);
    expect((await fs.readFile(run.reportPath, "utf8"))).toContain("Verified success: yes");
  });

  it("returns the death result to the model before running any remaining preplanned tools", async () => {
    const controller = session({ ...loadScenario("spa-trap"), startRoom: "Sauna", maxDeaths: 2 });
    const sdk = client(["inventory"]);
    sdk.messages.create.mockImplementationOnce(async () => ({
      content: ["wait", "north"].map((command, index) => ({ type: "tool_use", id: `fatal-batch-${index}`, name: "game_command", input: { command } })),
      stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    }) as Message);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 2, maxDeaths: 3 } });
    expect(run.events.map(event => event.request)).toEqual(["wait", "inventory"]);
    expect(run.reason).toBe("action_limit");
    expect(run.limits.maxDeaths).toBe(3);
    expect(run.playtest).toMatchObject({ deaths: 1, recoveryAttempts: 1 });
    const continuation = sdk.messages.create.mock.calls[1][0].messages.at(-1)!.content;
    expect(continuation).toEqual(expect.arrayContaining([expect.objectContaining({ tool_use_id: "fatal-batch-1", is_error: true, content: expect.stringContaining("Not executed") })]));
  });

  it("counts multiple recorded death events in a resolved action without double-counting husks", async () => {
    const controller = session({ ...loadScenario("spa-trap"), startRoom: "Spa" });
    vi.spyOn(engine, "handleCommand").mockImplementationOnce(async state => ({
      ...state, moves: state.moves + 1,
      worldState: { ...state.worldState, playerHuskCount: state.worldState.playerHuskCount + 2,
        playerDeaths: { ...state.worldState.playerDeaths, Sauna: { cause: "organism" }, SteamRoom: { cause: "organism" } } },
    }));
    await controller.start();
    await controller.explorer.command("wait");
    expect(controller.hostStatus!()!.deaths).toBe(2);
    await controller.explorer.command("inventory");
    expect(controller.hostStatus!()!.deaths).toBe(2);
  });

  it("does not fabricate regeneration for a terminal death even with a larger death allowance", async () => {
    const controller = session(loadScenario("spa-trap"));
    vi.spyOn(engine, "handleCommand").mockImplementationOnce(async state => ({
      ...state, moves: state.moves + 1,
      player: { ...state.player, vitals: { ...state.player.vitals, health: 0 } },
      worldState: { ...state.worldState, gameOver: { atMove: state.moves + 1, cause: "test", message: "You have died." } },
    }));
    const sdk = client(["wait", "inventory"]);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxDeaths: 3 } });
    expect(run.reason).toBe("death");
    expect(run.actions).toBe(1);
    expect(run.playtest).toMatchObject({ deaths: 1, recoveryAttempts: 0, final: { alive: false } });
    expect(run.playtest!.deathEvents![0].regenerated).toBe(false);
  });

  it.each([{ maxActions: 2 }, { maxTurns: 2 }, { maxGameTurns: 2 }])("keeps other budgets active during recovery: %j", async budgets => {
    const controller = session({ ...loadScenario("spa-trap"), startRoom: "Sauna", maxDeaths: 3 });
    const run = await runHeadlessAgent({ client: client(["wait", "wait", "wait"]), session: controller, options: budgets });
    expect(run.termination).toBe("budget_exhaustion");
    expect(run.actions).toBe(2);
    expect(run.playtest!.evaluation!.verified).toBe(false);
    expect(run.playtest!.deaths).toBe(1);
  });
});

describe("machine verification and autonomous termination", () => {
  it("combines all reusable predicates with AND semantics, including room/container placement", () => {
    let state = prepareScenario(createTestState(), loadScenario("spa-entry"));
    state = stashItemInContainer(state, "CarvingKnife", "Cooler");
    const scenario: Scenario = { id: "checks", objective: "Check", success: [
      { type: "player-room", roomId: "WalkIn" }, { type: "alive" },
      { type: "inventory", itemId: "Cooler" }, { type: "item-location", itemId: "CarvingKnife", containerId: "Cooler" },
      { type: "item-location", itemId: "CarvingKnife", roomId: "WalkIn" },
      { type: "door", doorId: "SteamRoomDoor", open: false },
      { type: "world-state", path: ["visitedRooms", "WalkIn"], equals: true },
    ] };
    expect(evaluateScenario(scenario, state).verified).toBe(true);
    expect(evaluateScenario(scenario, { ...state, player: { ...state.player, roomId: "Kitchen" } }).verified).toBe(false);
    expect(evaluateScenario({ id: "none", objective: "Try", success: [] }, state).verified).toBe(false);
    const type = `test-${randomUUID()}`;
    registerGoalPredicate(type, { validate: () => {}, test: (_check, next) => next.moves === 0, describe: () => "No turns spent" });
    expect(evaluateScenario({ id: "extensible", objective: "Check", success: [{ type }] }, state).verified).toBe(true);
  });

  it("checks after hazards resolve and recognizes death even after regeneration", async () => {
    const controller = session({ ...loadScenario("spa-entry"), startRoom: "Sauna" });
    const sdk = client(["wait", "north"]);
    const run = await runHeadlessAgent({ client: sdk, session: controller });
    expect(run.actions).toBe(1);
    expect(run.playtest!.gameTurns).toBe(1);
    expect(run.playtest!.deaths).toBe(1);
    expect(run.playtest!.evaluation!.verified).toBe(false);
    expect(run.playtest!.final.roomId).not.toBe("Sauna");
    expect(run.playtest!.final.alive).toBe(true);
    expect(run.reason).toBe("death");
    expect(sdk.messages.create).toHaveBeenCalledTimes(1);
  });

  it("does not verify goals on information requests, developer rejection or blank commands", async () => {
    const controller = session({ id: "no-shortcuts", objective: "Stay here", startRoom: "WalkIn", success: [{ type: "player-room", roomId: "WalkIn" }, { type: "alive" }] });
    await controller.start();
    await controller.explorer.information("room");
    expect(controller.hostStatus!()!.evaluation!.verified).toBe(false);
    for (const input of ["iljio", ""]) {
      await controller.explorer.command(input);
      expect(controller.hostStatus!()!.evaluation!.verified).toBe(false);
    }
    await controller.explorer.command("wait");
    expect(controller.hostStatus!()!.evaluation!.verified).toBe(true);
  });

  it("counts real turns independently of free commands and restored move counters", async () => {
    const controller = session({ id: "turns", objective: "Investigate", startRoom: "WalkIn" });
    await controller.start();
    const initial = createTestState();
    initial.world = { ...initial.world, meta: { ...initial.world.meta, loadedChunkIds: [...DEFERRED_WORLD_CHUNK_IDS] } };
    const saved = { ...prepareScenario(initial, loadScenario("spa-entry")), moves: 100 };
    expect(saveManualSnapshot(saved)).toBe(true);
    await controller.explorer.command("restore");
    await controller.explorer.command("inventory");
    expect(controller.hostStatus!()!.gameTurns).toBe(0);
    await controller.explorer.command("wait");
    expect(controller.hostStatus!()!.gameTurns).toBe(1);
    expect(controller.hostStatus!()!.final.moves).toBe(101);
  });

  it.each(["spa-entry", "spa-trap", "spa-trap-informed"])("solves %s through actual commands and stops immediately after verified success", async name => {
    const scenario = loadScenario(name);
    const controller = session(scenario);
    const commands = ["open cooler", "carve sample from chef", "put sample in cooler", "set cooler", "freeze", "close",
      "east", "east", "northeast", "northwest", "west", "open sauna door", "open steam room door", "south", "drop cooler", "set cooler", "off", "close",
      "north", "turn lights off", "turn lights on", ...(name.startsWith("spa-trap") ? ["close steam room door"] : []), "north"];
    const sdk = client([...commands, "wait"]);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 50, maxTurns: 50 } });
    expect(run.reason, run.events.map(event => `${event.request}: ${event.text.join(" ")}`).join("\n")).toBe("scenario_success");
    expect(run.termination).toBe("success");
    expect(run.actions).toBe(commands.length);
    expect(sdk.messages.create).toHaveBeenCalledTimes(commands.length);
    expect(run.events.at(-1)!.request).toBe("north");
    expect(run.playtest!.final).toMatchObject({ roomId: "Sauna", alive: true });
    expect(run.playtest!.deaths).toBe(0);
    expect(run.playtest!.evaluation!.verified).toBe(true);
    expect(run.playtest!.evaluation!.checks.every(check => check.met)).toBe(true);
    expect(run.playtest!.finalGameState!.itemState.itemRoomId.SpaOrganism).toBe("SteamRoom");
    if (name.startsWith("spa-trap")) expect(run.playtest!.finalGameState!.worldState.doors.SteamRoomDoor.isOpen).toBe(false);
    const params = sdk.messages.create.mock.calls[0][0];
    expect(params.system).toContain(scenario.objective);
    expect(params.system).toContain("high priority");
    expect(JSON.stringify(params)).not.toMatch(/ChefSample|spa-contained|freezing solution|organism attraction/);
    const transcript = await records(controller);
    expect(transcript.map(entry => entry.kind)).toEqual(["start", ...commands.map(() => "command"), "end"]);
    expect(transcript[1]).toMatchObject({ goal: "Reach the assigned objective", reason: "Follow the visible lead." });
    expect(transcript.at(-1)!.agentSummary).toMatchObject({ termination: "success", actions: commands.length, playtest: { evaluation: { verified: true } } });
    const report = await fs.readFile(run.reportPath, "utf8");
    expect(report).toContain(`Scenario: ${name}`);
    expect(report).toContain("Verified success: yes");
    expect(report).toContain("Final runtime state");
    expect(report).toContain("Token categories and estimated spending");
    expect(report).toContain("**Reason:** Follow the visible lead.");
    expect(run.inputTokens).toBe(commands.length * 100);
  });

  it("requires actual containment, room placement, closed door and survival for spa-trap", () => {
    const scenario = loadScenario("spa-trap");
    let state = prepareScenario(createTestState(), { ...scenario, startRoom: "Sauna" });
    state = updateItemLocation(state, "SpaOrganism", "SteamRoom");
    state = upsertDoorState(state, { id: "SteamRoomDoor", isOpen: false, isLocked: false });
    expect(evaluateScenario(scenario, state).verified).toBe(true);
    state = { ...state, worldState: { ...state.worldState, darkRooms: { ...state.worldState.darkRooms, Spa: true } } };
    state = upsertDoorState(state, { id: "SteamRoomDoor", isOpen: true, isLocked: false });
    const result = evaluateScenario(scenario, state);
    expect(result.verified).toBe(false);
    expect(result.checks.find(check => check.condition.type === "spa-contained")!.met).toBe(false);
    expect(getItemPlacementContext(state, "SpaOrganism").roomId).toBe("SteamRoom");
    state = upsertDoorState(state, { id: "SteamRoomDoor", isOpen: false, isLocked: false });
    for (let turn = 0; turn < 3; turn += 1) {
      state = tickSpaOrganism(state);
      expect(evaluateScenario(scenario, state).verified).toBe(true);
    }
  });

  it("does not run later tools in a batch after success, even at the action limit", async () => {
    const controller = session({ id: "already-near", objective: "Stay in WalkIn", startRoom: "WalkIn", success: [{ type: "player-room", roomId: "WalkIn" }, { type: "alive" }] });
    const sdk = client([]);
    sdk.messages.create.mockImplementationOnce(async () => ({
      content: ["wait", "east"].map((command, index) => ({ type: "tool_use", id: `batch-${index}`, name: "game_command", input: { command } })),
      stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    }) as Message);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 1 } });
    expect(run.actions).toBe(1);
    expect(run.reason).toBe("scenario_success");
    expect(run.events.map(event => event.request)).toEqual(["wait"]);
  });

  it.each([{ maxActions: 1 }, { maxGameTurns: 1 }, { maxTurns: 1 }])("reports budget exhaustion without success: %j", async budgets => {
    const controller = session({ ...loadScenario("spa-entry"), budgets });
    const run = await runHeadlessAgent({ client: client(["wait"]), session: controller });
    expect(run.termination).toBe("budget_exhaustion");
    expect(run.playtest!.evaluation!.verified).toBe(false);
    expect(run.playtest!.gameTurns).toBe(1);
    expect(run.actions).toBe(1);
  });

  it("lets explicit budgets override scenario defaults and preserves subjective termination without goals", async () => {
    const controller = session({ id: "unverified", objective: "Investigate", budgets: { maxActions: 1, maxTurns: 1 } });
    const sdk = client([], true);
    const run = await runHeadlessAgent({ client: sdk, session: controller, options: { maxActions: 2, maxTurns: 3 } });
    expect(run.reason).toBe("model_finished");
    expect(run.termination).toBe("agent_termination");
    expect(run.finalAgentMessage).toBe("I succeeded!");
    expect(run.limits.maxActions).toBe(2);
    expect(run.limits.maxTurns).toBe(3);
    expect(run.playtest!.evaluation!.verified).toBe(false);
    expect(await fs.readFile(run.reportPath, "utf8")).toContain("No machine-verifiable conditions supplied");
  });

  it("preserves existing post-death termination behavior when no verifier is supplied", async () => {
    const controller = session({ id: "unverified-death", objective: "Explore", startRoom: "Sauna" });
    const run = await runHeadlessAgent({ client: client(["wait", "inventory"]), session: controller, options: { maxActions: 2 } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(2);
    expect(run.playtest!.deaths).toBe(1);
    expect(run.playtest!.evaluation!.reason).toContain("not independently verified");
  });
});
