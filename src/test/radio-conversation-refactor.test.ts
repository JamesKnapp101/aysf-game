import { describe, expect, it } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import { parseCommand } from "../parse/parser";
import {
  createTestState,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("radio conversation refactor", () => {
  it("keeps Kevin's radio call state separate from NPC conversation state", async () => {
    let state = setInventory(createTestState({ roomId: "StairSix" }), [
      "Radio",
    ]);

    state = await handleCommand(state, parseCommand("push radio"));
    expect(state.radio?.activeNpcId).toBe("kevin_1st_contact");
    expect(state.conversation?.npcs?.kevin_1st_contact?.topicsUsed).toEqual({});

    state = await handleCommand(state, parseCommand("ask kevin about power"));
    const afterAskConversation =
      state.conversation?.npcs?.kevin_1st_contact ?? null;
    expect(
      afterAskConversation?.topicsUsed?.power === true ||
        afterAskConversation?.conversationHistory?.at(-1)?.topic === "power",
    ).toBe(true);
    expect(state.log.at(-1)).toMatch(/reset key/i);

    state = await handleCommand(state, parseCommand("tell kevin about bug"));
    const afterTellConversation =
      state.conversation?.npcs?.kevin_1st_contact ?? null;
    expect(
      afterTellConversation?.topicsUsed?.["tell:bug"] === true ||
        afterTellConversation?.conversationHistory?.at(-1)?.topic === "bug",
    ).toBe(true);
    expect(state.log.at(-1)).toMatch(/found one when i woke up/i);
  });
});
