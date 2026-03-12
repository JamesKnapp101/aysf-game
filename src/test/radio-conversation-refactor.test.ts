import { describe, expect, it } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import { getPendingConversationLogMessage } from "../game/helpers/conversationHelpers";
import { parseCommand } from "../parse/parser";
import {
  createTestState,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("conversation system refactor", () => {
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

  it("routes RangerBot through the shared NPC conversation system", async () => {
    let state = createTestState({ roomId: "ParkEntrance" });

    const askParsed = parseCommand("ask ranger about hours");
    expect(getPendingConversationLogMessage(state, askParsed)).toBe(
      "Ranger Rick considers this...",
    );

    state = await handleCommand(state, askParsed);
    const afterAskConversation = state.conversation?.npcs?.RangerBot ?? null;
    expect(
      afterAskConversation?.conversationHistory?.at(-1)?.topic === "hours" ||
        /park|pass/i.test(state.log.at(-1) ?? ""),
    ).toBe(true);

    const tellParsed = parseCommand("tell ranger about reactor");
    expect(getPendingConversationLogMessage(state, tellParsed)).toBe(
      "Ranger Rick considers this...",
    );

    state = await handleCommand(state, tellParsed);
    const afterTellConversation = state.conversation?.npcs?.RangerBot ?? null;
    expect(
      (afterTellConversation?.conversationHistory?.at(-1)?.type === "tell" &&
        afterTellConversation.conversationHistory.at(-1)?.topic ===
          "reactor") ||
        /roger that, sir!/i.test(state.log.at(-1) ?? ""),
    ).toBe(true);
  });

  it("resolves implicit ask targets for direct NPCs", async () => {
    let state = createTestState({ roomId: "ParkEntrance" });
    const parsed = parseCommand("ask robot what to do");

    expect(getPendingConversationLogMessage(state, parsed)).toBe(
      "Ranger Rick considers this...",
    );

    state = await handleCommand(state, parsed);
    const rangerConversation = state.conversation?.npcs?.RangerBot ?? null;
    const lastLog = state.log.at(-1) ?? "";

    expect(lastLog).not.toMatch(/no one answers|no response/i);
    expect(
      rangerConversation?.conversationHistory?.at(-1)?.topic === "what to do" ||
        rangerConversation?.topicsUsed?.["what to do"] === true ||
        /park|pass|relate/i.test(lastLog),
    ).toBe(true);
  });
});
