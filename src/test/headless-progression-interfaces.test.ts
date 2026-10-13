import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import { describe, expect, it, vi } from "vitest";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { runHeadlessAgent } from "../game/harness/agent";
import { useUIEffectsStore, useUIOverlayStore } from "../game/store/store";
import { updateItemLocation } from "../game/rules/items";
import { setReactorLobeStatus } from "../world/maps/levelFive/reactorConsensus";
import { installReplacementLobe } from "../world/maps/levelFive/reactorSystems";
import * as world from "../world/World";
import { setInventory } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

function fixture() {
  let state = setInventory(overlayFixture(["Radio", "MensLockers", "ReactorControlTerminal", "PowerStationMonitor", "TelepadTerminal"]), ["MensLockerKey1", "EngineRoomKey", "ReplacementReactorLobe", "bluebadge"]);
  state.worldState.powerRestoredSections["power-initialized"] = true;
  state.worldState.powerRestoredSections["teleport-pads-blue"] = true;
  state = installReplacementLobe(setReactorLobeStatus(state, "reactor-lobe-13", "missing")).state;
  return state;
}

describe("progression interface regression boundary", () => {
  it("cannot open or operate any of the new systems from an inaccessible location", async () => {
    let initial = fixture();
    for (const id of ["Radio", "MensLockers", "ReactorControlTerminal", "PowerStationMonitor", "TelepadTerminal"]) initial = updateItemLocation(initial, id, "Kitchen");
    const controller = overlaySession(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    for (const input of ["set radio", "examine lockers", "examine reactor terminal", "examine monitor", "use teleportation terminal", "tune 150", "open 1", "authenticate 3thiC4L", "select 4"]) {
      await controller.explorer.command(input);
      expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    }
    expect(controller.capabilityDiagnostics!()).toEqual([]);
    expect(spy).toHaveBeenCalledTimes(9);
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(0);
  });

  it("runs all five systems through unchanged agent tools with explanation/history and JSONL ordering", async () => {
    const controller = overlaySession(fixture());
    const commands = [
      "set radio", "tune 150", "close", "examine lockers", "open 1", "ok", "close",
      "examine reactor terminal", "authenticate wrong", "authenticate 3thiC4L", "insert", "turn", "restart", "close",
      "examine monitor", "select 6", "select 2", "back", "close", "use teleportation terminal", "select 4", "inventory",
    ];
    const requests: MessageCreateParamsNonStreaming[] = [];
    let turn = 0;
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const command = commands[turn++];
        return {
          content: [
            { type: "text", text: `Action explanation ${turn}.`, citations: null },
            { type: "tool_use", id: `tool_${turn}`, name: "game_command", input: { command } },
          ], stop_reason: "tool_use",
          usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: commands.length } });
    expect(run.reason).toBe("action_limit");
    expect(run.events.map(event => event.request)).toEqual(commands);
    expect(run.events.at(-1)!.text.join("\n")).toContain("Moves: 5");
    expect(run.events[12].text.join("\n")).toContain("REACTOR CORE ONLINE");
    expect(run.capabilityDiagnostics).toEqual([]);
    expect(JSON.stringify(requests[1].messages)).toContain("Action explanation 1.");
    const records = await overlayHistory(controller);
    expect(records.filter(entry => entry.kind === "command").map(entry => entry.observation.text)).toEqual(run.events.map(event => event.text));
    expect(records.at(-1)!.kind).toBe("end");
    const playerData = JSON.stringify(records) + JSON.stringify(requests);
    expect(playerData).not.toMatch(/reactor-control-terminal|power-station-terminal|teleportation-terminal|mensLockerContents|itemRoomId|powerRestoredSections/);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it.each([1, 2])("keeps action budget %s during a free mounted control batch", async maxActions => {
    const controller = overlaySession(fixture());
    const spy = vi.spyOn(engine, "handleCommand");
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async () => ({
        content: ["examine monitor", "select 6", "select 2", "close"].map((command, index) => ({ type: "tool_use", id: `tool_${index}`, name: "game_command", input: { command } })),
        stop_reason: "tool_use",
        usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
      } as Message)),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(maxActions);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(run.events.map(event => event.request)).toEqual(["examine monitor", "select 6"].slice(0, maxActions));
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it("serializes async travel before reset and applies deferred close effects exactly once", async () => {
    const initial = fixture();
    initial.world.rooms = initial.world.rooms.filter(room => room.id !== "Lab");
    const controller = overlaySession(initial);
    const realLoad = world.loadWorldChunk;
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    let entered!: () => void;
    const entry = new Promise<void>(resolve => { entered = resolve; });
    const loader = vi.spyOn(world, "loadWorldChunk").mockImplementationOnce(async chunkId => {
      entered();
      await barrier;
      return realLoad(chunkId);
    });
    await controller.start();
    await controller.explorer.command("use teleportation terminal");
    const overlay = useUIOverlayStore.getState().overlay;
    if (overlay.kind !== "teleportation-terminal") throw new Error("Missing authored terminal.");
    useUIOverlayStore.getState().openOverlay({ ...overlay, postCloseMessage: "Deferred terminal message.", postCloseNotifications: [{ kind: "gossip", text: "Deferred terminal notification." }] });
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(fixture());
    const travel = controller.explorer.command("select 4");
    const reset = controller.reset();
    await entry;
    expect(loader).toHaveBeenCalledTimes(1);
    release();
    const moved = text(await travel);
    expect(moved.split("Deferred terminal message.")).toHaveLength(2);
    expect(moved.split("Deferred terminal notification.")).toHaveLength(2);
    expect(moved).toContain("Lab");
    expect(text(await reset)).toContain("Bottom of Stairwell");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(useUIEffectsStore.getState().teleportFlashNonce).toBe(0);
    expect((await overlayHistory(controller)).map(entry => entry.kind)).toEqual(["start", "command", "command", "reset"]);
  });
});
