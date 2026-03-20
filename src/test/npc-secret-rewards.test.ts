import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import type { JuicyTopic } from "../game/types/gameTypes";
import { parseCommand } from "../parse/parser";
import {
  createTestState,
  expectInventoryToContain,
} from "./helpers/gameTestHelpers";

const hornyCloneGossip: JuicyTopic = {
  id: "horny clone",
  title: "Horny Clone",
  summary:
    "One of the Sanyi clones harbored a deep lust for Isosceles Onche.",
  tags: [],
  type: "gossip",
};

function mockClaudeConversation(responseText: string) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      success: true,
      response: responseText,
    }),
  } as Response);
}

describe("NPC secret rewards", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("grants NailBot's configured reward when the secret is revealed", async () => {
    mockClaudeConversation(
      "Oh, that is delicious. Here, take this whistle and go find the poor little darling in the warehouse.",
    );

    let state = createTestState({ roomId: "NailSalon" });
    state = {
      ...state,
      player: {
        ...state.player,
        spiltTea: [hornyCloneGossip],
      },
    };

    state = await handleCommand(state, parseCommand("tell robot about horny clone"));

    expect(expectInventoryToContain(state, "RobotWhistle")).toBe(true);
    expect(state.worldState.npcSecrets.NailBot).toMatchObject({
      gossipSharedIds: ["horny clone"],
      secretRevealed: true,
    });
    expect(state.uiState.notifications).toContainEqual(
      expect.objectContaining({
        kind: "system",
        text: "You have obtained a small whistle",
      }),
    );
  });

  it("only grants configured NPC secret rewards once", async () => {
    mockClaudeConversation(
      "Lovely. Here is the secret, and here is the whistle you need.",
    );

    let state = createTestState({ roomId: "NailSalon" });
    state = {
      ...state,
      player: {
        ...state.player,
        spiltTea: [hornyCloneGossip],
      },
    };

    state = await handleCommand(state, parseCommand("tell robot about horny clone"));
    state = await handleCommand(state, parseCommand("ask robot about warehouse"));

    expect(state.player.inventory.general.filter((id) => id === "RobotWhistle")).toHaveLength(1);
    expect(
      state.uiState.notifications.filter(
        (notification) => notification.text === "You have obtained a small whistle",
      ),
    ).toHaveLength(1);
  });
});
