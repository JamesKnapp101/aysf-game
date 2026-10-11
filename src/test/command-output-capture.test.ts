import { afterEach, describe, expect, it, vi } from "vitest";
import { ACTION_HANDLERS } from "../game/actions";
import { handleCommand } from "../game/engine/handleCommand";
import { appendLog } from "../game/engine/log";
import * as turn from "../game/engine/turn";
import * as helpers from "../game/helpers/gameHelpers";
import { saveManualSnapshot } from "../game/persistence/resumeStorage";
import type { GameState } from "../game/types/gameTypes";
import { parseCommand } from "../parse/parser";
import { createTestState } from "./helpers/gameTestHelpers";

afterEach(() => vi.restoreAllMocks());

function start(logLength = 0): GameState {
  const state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  return { ...state, log: Array(logLength).fill("identical old entry") };
}

async function capture(state: GameState, input: string) {
  const onOutput = vi.fn();
  const result = await handleCommand(state, parseCommand(input), { onOutput });
  expect(onOutput).toHaveBeenCalledTimes(1);
  expect(Object.getOwnPropertySymbols(result)).toEqual([]);
  return { state: result, output: onOutput.mock.calls[0][0] as readonly string[] };
}

describe("finalized command output capture", () => {
  it("captures more than 500 new entries in one command, including identical messages", async () => {
    vi.spyOn(ACTION_HANDLERS, "wait").mockImplementation(async (state) => {
      let next = state;
      for (let index = 0; index < 600; index += 1) next = appendLog(next, "identical new response");
      return { state: next, message: "Finished.", consumesTurn: false };
    });
    const original = start(500);
    const { state, output } = await capture(original, "wait");
    expect(output).toHaveLength(601);
    expect(output[0]).toBe("> wait\nFinished.\n\n");
    expect(output.slice(1)).toEqual(Array(600).fill("identical new response\n\n"));
    expect(state.log).toHaveLength(500);
    expect(state.log).toEqual(output.slice(-500));
    expect(original.log).toEqual(Array(500).fill("identical old entry"));
    expect(state.moves).toBe(0);
  });

  it("retains echo, room, script, immediate, radio and turn output ordering across pruning", async () => {
    vi.spyOn(helpers, "runScriptedEvents").mockImplementation((state, context) => {
      if (context.kind === "onEnterRoom") return appendLog(state, "Arrival event");
      if (context.kind === "onTurnEnd") return appendLog(state, "Turn-end event");
      return state;
    });
    vi.spyOn(turn, "advanceTurn").mockImplementation((state) => ({
      ...appendLog(appendLog(state, "Turn one"), "Turn two"),
      moves: state.moves + 1,
    }));
    const fixture = (length: number) => {
      const state = start(length);
      return {
        ...state,
        radio: { queuedLog: ["Radio message"] },
        worldState: {
          ...state.worldState,
          pendingNarration: { ...state.worldState.pendingNarration, afterRoomDescription: ["Scripted narration"] },
        },
      };
    };
    const baseline = await capture(fixture(0), "up");
    const capped = await capture(fixture(500), "up");
    expect(capped.output).toEqual(baseline.output);
    expect(capped.output).toHaveLength(6);
    expect(capped.output[0]).toBe("Turn-end event");
    expect(capped.output[1]).toMatch(/^> up\n\[\[ROOM_NAME\]\]Stairs Level Seven/);
    expect(capped.output[1]).toContain("Scripted narration");
    expect(capped.output.slice(2)).toEqual([
      "Arrival event\n\n", "Radio message\n\n", "Turn one\n\n", "Turn two\n\n",
    ]);
    expect(capped.state.log).toHaveLength(500);
    expect(capped.state.log.slice(-6)).toEqual(capped.output);
    expect(capped.state.moves).toBe(1);
  });

  it("captures actual creature turn narration when the log is already full", async () => {
    const fixture = (length: number) => {
      const state = start(length);
      return {
        ...state,
        moves: 3,
        player: { ...state.player, roomId: "LevelSixCorridorEnd" },
        worldState: {
          ...state.worldState,
          hydroponicsSpider: { ...state.worldState.hydroponicsSpider, isAlive: true, turnsSinceLastBreath: 3 },
        },
      };
    };
    const baseline = await capture(fixture(0), "wait");
    const capped = await capture(fixture(500), "wait");
    expect(capped.output).toEqual(baseline.output);
    expect(capped.output.length).toBeGreaterThan(1);
    expect(capped.state.log).toHaveLength(500);
  });

  it("reports only new restore/restart output rather than replaying replaced history", async () => {
    const saved = { ...start(500), moves: 7 };
    expect(saveManualSnapshot(saved)).toBe(true);
    const restored = await capture({ ...start(499), log: Array(499).fill("history from another branch") }, "restore");
    expect(restored.output).toEqual(["> restore\nProgress restored.\n\n"]);
    expect(restored.state.moves).toBe(7);
    const restarted = await capture(restored.state, "restart");
    expect(restarted.output.join("\n")).toContain("Game restarted.");
    expect(restarted.output.join("\n")).not.toMatch(/identical old entry|history from another branch/);
    expect(restarted.state.moves).toBe(0);
  });

  it("captures terminal game-over responses even with a full log", async () => {
    const state = start(500);
    state.worldState.gameOver = { message: "The journey is over." } as GameState["worldState"]["gameOver"];
    const result = await capture(state, "wait");
    expect(result.output).toEqual(["> wait\nThe journey is over.\n\n"]);
    expect(result.state.log).toHaveLength(500);
    expect(result.state.moves).toBe(0);
  });

  it("isolates concurrent commands that share the same input state", async () => {
    vi.spyOn(ACTION_HANDLERS, "examine").mockImplementation(async (state, command) => {
      if (command.type !== "action") throw new Error("Expected an action fixture");
      const next = appendLog(state, `Immediate: ${command.raw}`);
      await Promise.resolve();
      return { state: next, message: `Response: ${command.raw}`, consumesTurn: false };
    });
    const shared = start(500);
    const [first, second] = await Promise.all([
      capture(shared, "examine boxes"), capture(shared, "examine dead man"),
    ]);
    expect(first.output.join("\n")).toContain("Immediate: examine boxes");
    expect(first.output.join("\n")).not.toContain("examine dead man");
    expect(second.output.join("\n")).not.toContain("examine boxes");
  });

  it("cleans up collection after a handler throws", async () => {
    vi.spyOn(ACTION_HANDLERS, "wait").mockImplementationOnce(async (state) => {
      appendLog(state, "Unfinished output");
      throw new Error("fixture failure");
    });
    const state = start();
    const onOutput = vi.fn();
    await expect(handleCommand(state, parseCommand("wait"), { onOutput })).rejects.toThrow("fixture failure");
    expect(onOutput).not.toHaveBeenCalled();
    const next = await capture(state, "look");
    expect(next.output.join("\n")).not.toContain("Unfinished output");
  });
});
