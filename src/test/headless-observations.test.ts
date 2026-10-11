import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as gameInit from "../game/gameInit";
import * as engine from "../game/engine/handleCommand";
import { appendLog } from "../game/engine/log";
import { INITIAL_OBJECTIVE, runHeadlessAgent } from "../game/harness/agent";
import { informationText } from "../game/harness/information";
import { currentRoomPresentation, playerText } from "../game/harness/playerView";
import { createHeadlessSession } from "../game/harness/session";
import type { InformationView, Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import type { GameState } from "../game/types/gameTypes";
import type { Item } from "../game/types/itemTypes";
import { createTestState, patchRoomDarkness, setInventory } from "./helpers/gameTestHelpers";

const execute = engine.handleCommand;
const controllers: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");
const fixture = () => createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
function session(initial?: GameState) {
  if (initial) vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(initial);
  const directory = resolve(".headless-transcripts", `observations-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  return controller;
}
function addItems(state: GameState, items: Item[]): GameState {
  return {
    ...state, world: { ...state.world, items: [...state.world.items, ...items] },
    itemState: { ...state.itemState, itemRoomId: { ...state.itemState.itemRoomId, ...Object.fromEntries(items.map(item => [item.id, item.location])) } },
  };
}
const item = (id: string, name: string, additions: Partial<Item> = {}): Item => ({
  id, name, description: "An ordinary test object.", vocab: [name], location: "StairWellSeven",
  itemCategory: "collectable", itemClass: "solid", itemSize: 1, itemWeight: 1, ...additions,
});
afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe("context-aware headless room observations", () => {
  it("always gives full initial, look/alias, and explicit room descriptions", async () => {
    const initial = fixture();
    const controller = session(initial);
    const room = currentRoomPresentation(initial);
    expect(text(await controller.start())).toContain(room.fullText);
    for (const command of ["look", "l", "look"]) {
      const response = text(await controller.explorer.command(command));
      expect(response).toContain(room.description);
      expect(response.split(room.description)).toHaveLength(2);
    }
    const first = await controller.explorer.information("room");
    const second = await controller.explorer.information("room");
    expect(first.text).toEqual(second.text);
    expect(text(first)).toContain(room.fullText);
  });

  it.each(["inventory", "status", "help", "examine boxes", "wait", "unrecognized nonsense"])("omits unchanged snapshots after %s while retaining output and counters", async command => {
    const initial = fixture();
    const controller = session(initial);
    await controller.start();
    const output: string[] = [];
    const spy = vi.spyOn(engine, "handleCommand").mockImplementationOnce((state, parsed, options) => execute(state, parsed, {
      ...options, onOutput: entries => { output.push(...entries); options?.onOutput?.(entries); },
    }));
    const response = await controller.explorer.command(command);
    const next = await spy.mock.results[0].value;
    expect(currentRoomPresentation(next).description).toBe(currentRoomPresentation(initial).description);
    expect(text(response)).not.toContain(currentRoomPresentation(initial).description);
    expect(response.text).toContain(currentRoomPresentation(next).summary);
    expect(response.text.slice(0, output.length)).toEqual(output.map(playerText).filter(Boolean));
  });

  it("keeps information requests exact, including history's legitimately repeated narration", async () => {
    const controller = session(fixture());
    await controller.start();
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.explorer.command("look");
    const state = await spy.mock.results[0].value;
    for (const view of ["log", "gossip", "dna", "objectives", "history"] as InformationView[]) {
      expect((await controller.explorer.information(view)).text).toEqual([playerText(informationText(state, view))]);
    }
    expect(spy).toHaveBeenCalledTimes(1);
    expect(text(await controller.explorer.information("history"))).toContain(currentRoomPresentation(state).description);
  });

  it("refreshes after visible item acquisition, while keeping the whole document and notifications on read", async () => {
    const initial = fixture();
    const controller = session(initial);
    await controller.start();
    const spy = vi.spyOn(engine, "handleCommand");
    const taken = await controller.explorer.command("take paper");
    const next = await spy.mock.results[0].value;
    const room = currentRoomPresentation(next);
    expect(room.description).not.toBe(currentRoomPresentation(initial).description);
    expect(text(taken)).toContain("Taken.");
    expect(taken.text).toContain(room.fullText);
    expect(room.description).not.toContain("folded piece of paper marked");
    expect(next.moves).toBe(1);
    const read = await controller.explorer.command("read paper");
    const afterRead = await spy.mock.results[1].value;
    const note = initial.world.items.find(item => item.id === "MysteriousNote")!;
    expect(text(read)).toContain(note.readableText as string);
    expect(text(read)).toContain("You log the message");
    expect(text(read)).not.toContain(room.description);
    expect(afterRead.player.log).toHaveLength(1);
    expect(spy.mock.calls[1][0]).toEqual(next);
    expect(afterRead.moves).toBe(2);
  });

  it("supplies complete arrival descriptions even when the engine abbreviates revisits", async () => {
    const controller = session(fixture());
    const opening = await controller.start();
    const spy = vi.spyOn(engine, "handleCommand");
    const arrival = await controller.explorer.command("up");
    const upstairs = await spy.mock.results[0].value;
    expect(text(arrival)).toContain(currentRoomPresentation(upstairs).description);
    expect(text(arrival)).toContain("Stairs Level Seven");
    const returned = await controller.explorer.command("down");
    const downstairs = await spy.mock.results[1].value;
    expect(returned.text).toContain(currentRoomPresentation(downstairs).fullText);
    expect(text(opening)).toContain(currentRoomPresentation(downstairs).description);
    expect(downstairs.moves).toBe(2);
  });

  it("retains failed movement and its turn cost without claiming a new arrival", async () => {
    const controller = session(fixture());
    await controller.start();
    const spy = vi.spyOn(engine, "handleCommand");
    const response = text(await controller.explorer.command("west"));
    const state = await spy.mock.results[0].value;
    expect(response).toContain("You can't go that way.");
    expect(response).toContain("Bottom of Stairwell\nScore:");
    expect(response).not.toContain("Stairs Level Seven");
    expect(response).not.toContain(currentRoomPresentation(state).description);
    expect(state.player.roomId).toBe("StairWellSeven");
    expect(state.moves).toBe(1);
  });

  it("updates for illumination changes and never discloses objects hidden by darkness", async () => {
    const initial = patchRoomDarkness(setInventory(fixture(), ["Comet", "flashlight"]), "StairWellSeven", true);
    const controller = session(initial);
    const opening = text(await controller.start());
    expect(opening).toContain("It's pitch black in here");
    expect(opening).not.toContain("bloody thumbprint");
    const spy = vi.spyOn(engine, "handleCommand");
    const lit = await controller.explorer.command("turn on flashlight");
    const litState = await spy.mock.results[0].value;
    expect(text(lit)).toContain("bloody thumbprint");
    expect(text(lit)).toContain(currentRoomPresentation(litState).description);
    const dark = await controller.explorer.command("turn off flashlight");
    expect(text(dark)).toContain("It's pitch black in here");
    expect(text(dark)).not.toContain("bloody thumbprint");
    expect(text(await controller.explorer.command("wait"))).not.toContain("It's pitch black in here");
    for (const response of [await controller.explorer.command("look"), await controller.explorer.information("room")]) {
      expect(text(response)).toContain("It's pitch black in here");
      expect(text(response)).not.toContain("bloody thumbprint");
    }
    expect(JSON.stringify(dark)).not.toMatch(/darkRooms|itemSettings|StairWellSeven/);
  });

  it("refreshes for a newly opened container without exposing closed contents or internal IDs", async () => {
    const box = item("PrivateCaseId", "carrying case", { isContainer: true, isOpenable: true });
    const card = item("PrivateCardId", "folded card", { location: "IN:PrivateCaseId" });
    const initial = addItems(fixture(), [box, card]);
    initial.itemState.containerContents[box.id] = [card.id];
    const controller = session(initial);
    expect(text(await controller.start())).not.toContain("folded card");
    const spy = vi.spyOn(engine, "handleCommand");
    const opened = await controller.explorer.command("open carrying case");
    const state = await spy.mock.results[0].value;
    expect(opened.text).toContain(currentRoomPresentation(state).fullText);
    expect(text(opened)).toContain("Inside the carrying case you can see");
    expect(text(opened)).toContain("folded card");
    expect(text(opened)).not.toMatch(/PrivateCaseId|PrivateCardId|containerContents|openItems/);
    expect(text(await controller.explorer.command("examine boxes"))).not.toContain("Inside the carrying case");
  });

  it("detects same-room environmental changes and preserves multi-message engine ordering", async () => {
    const dial = item("PrivateDialId", "weather dial", { overrides: {
      examine: ({ state }: { state: GameState }) => ({
        state: { ...appendLog(appendLog(state, "First event."), "Second event."), worldState: {
          ...state.worldState, conditionalTriggers: { ...state.worldState.conditionalTriggers, PrivateWeatherChange: true },
        } }, message: "You adjust the dial.", consumesTurn: false,
      }),
    } });
    const initial = addItems(fixture(), [dial]);
    initial.world = { ...initial.world, rooms: initial.world.rooms.map(room => room.id === "StairWellSeven"
      ? { ...room, describe: state => state.worldState.conditionalTriggers.PrivateWeatherChange ? "Rain has stopped dripping from the ceiling." : "Rain drips steadily from the ceiling." }
      : room) };
    const controller = session(initial);
    await controller.start();
    const output: string[] = [];
    const spy = vi.spyOn(engine, "handleCommand").mockImplementationOnce((state, parsed, options) => execute(state, parsed, {
      ...options, onOutput: entries => { output.push(...entries); options?.onOutput?.(entries); },
    }));
    const response = await controller.explorer.command("examine weather dial");
    const state = await spy.mock.results[0].value;
    expect(response.text.slice(0, output.length)).toEqual(output.map(playerText).filter(Boolean));
    expect(text(response).indexOf("First event.")).toBeLessThan(text(response).indexOf("Second event."));
    expect(text(response)).toContain("Rain has stopped dripping from the ceiling.");
    expect(text(response)).not.toContain("PrivateWeatherChange");
    expect(state.moves).toBe(1);
  });

  it("ignores hidden-only changes and keeps authored room narration even when already known", async () => {
    const initial = fixture();
    const description = currentRoomPresentation(initial).description;
    const dial = item("PrivateDialId", "weather dial", { location: "INVENTORY", overrides: {
      examine: ({ state }: { state: GameState }) => ({ state: { ...state, worldState: { ...state.worldState, conditionalTriggers: {
        ...state.worldState.conditionalTriggers, PrivateUnrelatedFlag: true,
      } } }, message: "The dial clicks.", consumesTurn: false }),
      smell: description,
    } });
    const state = addItems(initial, [dial]);
    state.player.inventory.general.push(dial.id);
    const controller = session(state);
    await controller.start();
    const changed = await controller.explorer.command("examine weather dial");
    expect(text(changed)).toContain("The dial clicks.");
    expect(text(changed)).not.toContain(description);
    expect(text(changed)).not.toContain("PrivateUnrelatedFlag");
    // An authored reply that repeats room text is still engine output.
    expect(text(await controller.explorer.command("smell weather dial"))).toContain(description);
  });

  it("resets cached presentation for fresh reset/restart and then omits unchanged inventory snapshots", async () => {
    const controller = session();
    const opening = await controller.start();
    await controller.explorer.command("take paper");
    expect((await controller.reset()).text).toEqual(opening.text);
    expect(text(await controller.explorer.command("inventory"))).not.toContain("This is the dimly lit bottom");
    expect(text(await controller.explorer.command("restart"))).toContain("This is the dimly lit bottom");
    expect(text(await controller.explorer.command("inventory"))).not.toContain("This is the dimly lit bottom");
  });

  it("records exactly the smaller payloads supplied to the mocked Claude conversation", async () => {
    const controller = session(fixture());
    const commands = ["look", "inventory", "take paper", "read paper", ":log"];
    let index = 0;
    const create = vi.fn(async (request: MessageCreateParamsNonStreaming) => {
      expect(request.tools).toHaveLength(2);
      const command = commands[index++];
      return { content: command ? [{ type: "tool_use", id: `tool-${index}`, name: command === ":log" ? "game_information" : "game_command",
        input: command === ":log" ? { view: "log" } : { command }, caller: { type: "direct" } }] : [{ type: "text", text: "Finished.", citations: null }],
      stop_reason: command ? "tool_use" : "end_turn", usage: { input_tokens: 100, output_tokens: 20 },
      } as Message;
    });
    const run = await runHeadlessAgent({ client: { messages: { create, countTokens: async () => ({ input_tokens: 100 }) } }, session: controller });
    expect(run.actions).toBe(5);
    const records: TranscriptEntry[] = (await fs.readFile(run.transcriptPath, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    const messages = create.mock.calls.at(-1)![0].messages;
    expect(messages[0].content).toBe(`${INITIAL_OBJECTIVE}\n\nOpening game observation:\n${records[0].observation.text.join("\n\n")}`);
    const results = messages.filter(message => message.role === "user").slice(1).flatMap(message => typeof message.content === "string" ? [] : message.content);
    const executed = records.filter(record => record.kind === "command" || record.kind === "information");
    expect(results).toHaveLength(5);
    for (const [index, block] of results.entries()) {
      expect(block.type).toBe("tool_result");
      if (block.type === "tool_result") expect(block.content).toBe(executed[index].observation.text.join("\n\n"));
    }
    expect(results[1]).not.toEqual(expect.objectContaining({ content: expect.stringContaining("This is the dimly lit bottom") }));
    expect(records.at(-1)?.kind).toBe("end");
  });
});
