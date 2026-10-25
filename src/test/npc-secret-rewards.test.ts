import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "@game/engine/handleCommand";
import { parseCommand } from "../parse/parser";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

async function completeExchange() {
  let state = await handleCommand(nailBotFixture(), parseCommand("use voucher"));
  for (const id of ["horny clone", "nursery mishap", "steam room coverup"]) {
    state = await handleCommand(state, parseCommand(`share ${id} with nailbot`));
  }
  return state;
}

afterEach(() => vi.restoreAllMocks());

describe("NPC secret rewards", () => {
  it("grants NailBot's configured reward through scripted exchanges without AI", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const state = await completeExchange();
    expect(fetch).not.toHaveBeenCalled();
    expect(state.player.inventory.general).toContain("RobotWhistle");
    expect(state.worldState.npcSecrets.NailBot).toEqual({ secretRevealed: true });
    expect(state.uiState.notifications).toContainEqual(expect.objectContaining({ kind: "system", text: "You have obtained a small whistle" }));
  });

  it("only grants configured NPC secret rewards once", async () => {
    let state = await completeExchange();
    state.uiState.conversationMode = "authored";
    state = await handleCommand(state, parseCommand("tell robot about horny clone"));
    state = await handleCommand(state, parseCommand("ask robot about warehouse"));
    expect(state.player.inventory.general.filter(id => id === "RobotWhistle")).toHaveLength(1);
    expect(state.uiState.notifications.filter(n => n.text === "You have obtained a small whistle")).toHaveLength(1);
  });
});
