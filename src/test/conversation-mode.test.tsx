import { CometTerminal } from "@game/components/CometTerminal";
import { SettingsTab } from "@game/components/SettingsTab";
import { handleCommand } from "@game/engine/handleCommand";
import { getPendingConversationLogMessage } from "@game/helpers/conversationHelpers";
import { NPC_DIALOG, resolveAskTopic } from "@game/npcDialog";
import { COMMON_ASK } from "@game/npcDialogs/common";
import { NPCS } from "@game/npcRegistry";
import type { CometEntry } from "@game/components/comet-index";
import type {
  ConversationMode,
  GameState,
  JuicyTopic,
} from "@game/types/gameTypes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseCommand } from "../parse/parser";
import { createTestState, getLastLogEntry } from "./helpers/gameTestHelpers";

const sampleCometEntries: CometEntry[] = [
  {
    id: "nexicorp",
    terms: ["nexicorp"],
    body: "NexiCorp is a medical technology company.",
  },
  {
    id: "comet_terminal",
    terms: ["comet", "terminal"],
    body: "Comet is a portable Central Library access terminal.",
  },
];

const hornyCloneGossip: JuicyTopic = {
  id: "horny clone",
  summary:
    "One of the Sanyi clones harbored a deep lust for Isosceles Onche.",
  tags: [],
  title: "Horny Clone",
  type: "gossip",
};

function withConversationMode(
  state: GameState,
  conversationMode: ConversationMode,
): GameState {
  return {
    ...state,
    uiState: {
      ...state.uiState,
      conversationMode,
    },
  };
}

describe("conversation mode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses authored NPC dialog without calling the generated response service", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "Generated response should not be used.",
      }),
    } as Response);
    const state = withConversationMode(
      createTestState({ roomId: "ParkEntrance" }),
      "authored",
    );
    const parsed = parseCommand("ask ranger about hours");

    expect(getPendingConversationLogMessage(state, parsed)).toBeUndefined();

    const next = await handleCommand(state, parsed);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(getLastLogEntry(next)).toMatch(/around the clock|valid park pass/i);
  });

  it("provides authored dialog coverage and forgiving topic resolution for registered NPCs", () => {
    const missingDialogIds = Object.keys(NPCS).filter(
      (npcId) => !NPC_DIALOG[npcId],
    );

    expect(missingDialogIds).toEqual([]);

    const missingCommonAskTopics = Object.entries(NPC_DIALOG).flatMap(
      ([npcId, dialog]) =>
        Object.keys(COMMON_ASK)
          .filter((topic) => !(topic in dialog.ask))
          .map((topic) => `${npcId}:${topic}`),
    );

    expect(missingCommonAskTopics).toEqual([]);
    expect(resolveAskTopic("what is the badge for")).toBe("badge");
    expect(resolveAskTopic("what can you tell me about rotations")).toBe(
      "rotations",
    );
    expect(resolveAskTopic("where is the new home")).toBe("journey");
  });

  it("keeps NailBot's secret reward solvable in authored mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "Generated response should not be used.",
      }),
    } as Response);
    const baseState = createTestState({ roomId: "NailSalon" });
    const state = withConversationMode(
      {
        ...baseState,
        player: {
          ...baseState.player,
          spiltTea: [hornyCloneGossip],
        },
      },
      "authored",
    );

    const next = await handleCommand(
      state,
      parseCommand("tell robot about horny clone"),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(next.player.inventory.general).toContain("RobotWhistle");
    expect(next.worldState.npcSecrets.NailBot).toMatchObject({
      gossipSharedIds: ["horny clone"],
      secretRevealed: true,
    });
  });

  it("uses Sibyl's indexed fallback and library branding in authored mode", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        response: "Generated response should not be used.",
      }),
    } as Response);

    function Harness() {
      const [state, setState] = React.useState(
        withConversationMode(createTestState(), "authored"),
      );

      return (
        <CometTerminal
          entries={sampleCometEntries}
          forceLink
          forceOnline
          setGameState={setState}
          state={state}
        />
      );
    }

    const { container } = render(<Harness />);

    expect(screen.getAllByText("SIBYL").length).toBeGreaterThan(0);
    expect(screen.getByText("YOUR LIBRARY PAL")).toBeInTheDocument();
    expect(screen.getByText(/Sibyl has Answers/i)).toBeInTheDocument();
    expect(screen.queryByText("COMET")).not.toBeInTheDocument();
    expect(container.querySelector(".comet-brandIcon--book")).toBeInTheDocument();
    expect(
      container.querySelector(".comet-brandIcon--binary"),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("CHAT"), "NexiCorp{enter}");

    expect(
      await screen.findByText("NexiCorp is a medical technology company."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/direct edits/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("CHAT"), "Tell me about Comet{enter}");

    expect(
      await screen.findByText(
        "Sibyl is a portable Central Library access terminal.",
      ),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses the binary terminal icon in AI mode", () => {
    const { container } = render(
      <CometTerminal
        entries={sampleCometEntries}
        forceLink
        forceOnline
        setGameState={() => undefined}
        state={withConversationMode(createTestState(), "ai")}
      />,
    );

    expect(container.querySelector(".comet-brandIcon--binary")).toBeInTheDocument();
    expect(container.querySelector(".comet-brandIcon--book")).not.toBeInTheDocument();
  });

  it("renders the Settings conversation switch before CRT color", async () => {
    const user = userEvent.setup();
    const onConversationModeChange = vi.fn();
    const { container } = render(
      <SettingsTab
        cometPersonality="default"
        cometTextSize="smaller"
        conversationMode="ai"
        crtColor="#00ff00"
        onCometPersonalityChange={() => undefined}
        onCometTextSizeChange={() => undefined}
        onConversationModeChange={onConversationModeChange}
        onVisualEffectsModeChange={() => undefined}
        setCrtColor={() => undefined}
        visualEffectsMode="full"
      />,
    );

    const headers = Array.from(
      container.querySelectorAll(".settings-section-header"),
    ).map((header) => header.textContent?.trim());
    const modeSwitch = screen.getByRole("switch", {
      name: /conversation mode/i,
    });

    expect(headers[0]).toBe("Conversation Mode");
    expect(headers[1]).toBe("CRT Color");
    expect(modeSwitch).toBeChecked();

    await user.click(modeSwitch);

    expect(onConversationModeChange).toHaveBeenCalledWith("authored");
  });

  it("renames Comet controls to Sibyl in authored Settings mode", () => {
    render(
      <SettingsTab
        cometPersonality="default"
        cometTextSize="smaller"
        conversationMode="authored"
        crtColor="#00ff00"
        onCometPersonalityChange={() => undefined}
        onCometTextSizeChange={() => undefined}
        onConversationModeChange={() => undefined}
        onVisualEffectsModeChange={() => undefined}
        setCrtColor={() => undefined}
        visualEffectsMode="full"
      />,
    );

    expect(screen.getByText("Sibyl Settings")).toBeInTheDocument();
    expect(screen.getByText("Sibyl Text Size")).toBeInTheDocument();
    expect(screen.getByText(/Sibyl answers/i)).toBeInTheDocument();
    expect(screen.queryByText(/Comet Settings/i)).not.toBeInTheDocument();
  });
});
