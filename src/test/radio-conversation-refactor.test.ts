import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import {
  getPendingConversationLogMessage,
  postProcessAiConversationResponse,
} from "../game/helpers/conversationHelpers";
import { parseCommand } from "../parse/parser";
import {
  createTestState,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("conversation system refactor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the first radio call state separate from NPC conversation state", async () => {
    let state = setInventory(createTestState({ roomId: "StairSix" }), [
      "Radio",
    ]);

    state = await handleCommand(state, parseCommand("push radio"));
    expect(state.radio?.activeNpcId).toBe("you_1st_contact");
    expect(state.conversation?.npcs?.you_1st_contact?.topicsUsed).toEqual({});

    state = await handleCommand(state, parseCommand("ask voice about power"));
    const afterAskConversation =
      state.conversation?.npcs?.you_1st_contact ?? null;
    expect(
      afterAskConversation?.topicsUsed?.power === true ||
        afterAskConversation?.conversationHistory?.at(-1)?.topic === "power",
    ).toBe(true);
    expect(state.log.at(-1)).toMatch(/power|reset|supervisor|key|reactor/i);

    state = await handleCommand(state, parseCommand("tell voice about bug"));
    const afterTellConversation =
      state.conversation?.npcs?.you_1st_contact ?? null;
    expect(
      afterTellConversation?.topicsUsed?.["tell:bug"] === true ||
        afterTellConversation?.conversationHistory?.at(-1)?.topic === "bug",
    ).toBe(true);
    expect(state.log.at(-1)).toMatch(/bug|mechanical|found|important/i);
  });

  it("routes RangerBot through the shared NPC conversation system", async () => {
    let state = createTestState({ roomId: "ParkEntrance" });

    const askParsed = parseCommand("ask ranger about hours");
    expect(getPendingConversationLogMessage(state, askParsed)).toBe(
      "The ranger robot considers this...",
    );

    state = await handleCommand(state, askParsed);
    const afterAskConversation = state.conversation?.npcs?.RangerBot ?? null;
    expect(
      afterAskConversation?.conversationHistory?.at(-1)?.topic === "hours" ||
        /park|pass/i.test(state.log.at(-1) ?? ""),
    ).toBe(true);

    const tellParsed = parseCommand("tell ranger about reactor");
    expect(getPendingConversationLogMessage(state, tellParsed)).toBe(
      "The ranger robot considers this...",
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

  it("replaces em dashes in AI conversation responses", async () => {
    expect(postProcessAiConversationResponse("Wait\u2014what now?")).toBe(
      "Wait, what now?",
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "The park is open\u2014assuming you have a pass.",
      }),
    } as Response);

    const state = await handleCommand(
      createTestState({ roomId: "ParkEntrance" }),
      parseCommand("ask ranger about hours"),
    );

    const response =
      state.conversation?.npcs?.RangerBot?.conversationHistory?.at(-1)
        ?.response ?? "";

    expect(response).toBe("The park is open, assuming you have a pass.");
    expect(state.log.at(-1) ?? "").toContain(
      `"The park is open, assuming you have a pass."`,
    );
    expect(state.log.at(-1) ?? "").not.toContain("\u2014");
  });

  it("strips stage directions from AI conversation responses", async () => {
    expect(
      postProcessAiConversationResponse(
        "I lean against the bar with a slight furrow in my brow. I'm afraid I don't know that one.",
      ),
    ).toBe("I'm afraid I don't know that one.");
    expect(postProcessAiConversationResponse("*chuckles* Not likely.")).toBe(
      "Not likely.",
    );
    expect(postProcessAiConversationResponse("[sighs] Not likely.")).toBe(
      "Not likely.",
    );
    expect(postProcessAiConversationResponse("(clears throat) Not likely.")).toBe(
      "Not likely.",
    );
    expect(postProcessAiConversationResponse("I don't know that one.")).toBe(
      "I don't know that one.",
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response:
          "I lean against the bar with a slight furrow in my brow. I'm afraid I'm not sure what you're referring to, Mox.",
      }),
    } as Response);

    const state = await handleCommand(
      createTestState({ roomId: "Bar" }),
      parseCommand("ask bartender about mechanical bull"),
    );

    const response =
      state.conversation?.npcs?.BarBot?.conversationHistory?.at(-1)
        ?.response ?? "";

    expect(response).toBe(
      "I'm afraid I'm not sure what you're referring to, Mox.",
    );
    const commandEntry =
      [...state.log]
        .reverse()
        .find((entry) =>
          entry.includes("> ask bartender about mechanical bull"),
        ) ?? "";

    expect(commandEntry).toContain(
      `"I'm afraid I'm not sure what you're referring to, Mox."`,
    );
    expect(commandEntry).not.toMatch(/lean|furrow/i);
  });

  it("resolves implicit ask targets for direct NPCs", async () => {
    let state = createTestState({ roomId: "ParkEntrance" });
    const parsed = parseCommand("ask robot what to do");

    expect(getPendingConversationLogMessage(state, parsed)).toBe(
      "The ranger robot considers this...",
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

  it("resolves implicit tell targets for direct NPCs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    let state = createTestState({ roomId: "GymWeightRoom" });
    const parsed = parseCommand("tell robot the man is dead");

    expect(getPendingConversationLogMessage(state, parsed)).toBe(
      "The robot gym bro considers this...",
    );

    state = await handleCommand(state, parsed);
    const spotBotConversation = state.conversation?.npcs?.SpotBot ?? null;

    expect(state.log.at(-1) ?? "").not.toMatch(/tell them about what/i);
    expect(spotBotConversation?.topicsUsed?.["tell:man is dead"]).toBe(true);
    expect(spotBotConversation?.conversationHistory?.at(-1)).toMatchObject({
      type: "tell",
      topic: "man is dead",
    });
  });

  it("tracks direct fallback conversations and suppresses repeated canned replies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    let state = createTestState({ roomId: "ParkEntrance" });

    state = await handleCommand(state, parseCommand("ask ranger about hours"));
    const afterFirstAsk = state.conversation?.npcs?.RangerBot ?? null;
    expect(afterFirstAsk?.topicsUsed?.hours).toBe(true);
    expect(afterFirstAsk?.conversationHistory?.at(-1)).toMatchObject({
      type: "ask",
      topic: "hours",
    });
    expect(afterFirstAsk?.conversationHistory?.at(-1)?.response).toMatch(
      /park|clock|pass/i,
    );

    state = await handleCommand(state, parseCommand("ask ranger about hours"));
    expect(state.log.at(-1) ?? "").toMatch(/already told you all i know/i);
    expect(
      state.conversation?.npcs?.RangerBot?.conversationHistory?.at(-1)?.response,
    ).toMatch(/already told you all i know/i);

    state = await handleCommand(state, parseCommand("tell ranger about reactor"));
    const afterFirstTell = state.conversation?.npcs?.RangerBot ?? null;
    expect(afterFirstTell?.topicsUsed?.["tell:reactor"]).toBe(true);
    expect(afterFirstTell?.conversationHistory?.at(-1)).toMatchObject({
      type: "tell",
      topic: "reactor",
    });
    expect(afterFirstTell?.conversationHistory?.at(-1)?.response).toMatch(
      /roger that, sir/i,
    );

    state = await handleCommand(state, parseCommand("tell ranger about reactor"));
    expect(state.log.at(-1) ?? "").toMatch(/already told me that/i);
    expect(
      state.conversation?.npcs?.RangerBot?.conversationHistory?.at(-1)?.response,
    ).toMatch(/already told me that/i);
  });
});
