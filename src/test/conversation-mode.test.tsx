import { CometTerminal } from "@game/components/CometTerminal";
import { SettingsTab } from "@game/components/SettingsTab";
import { handleCommand } from "@game/engine/handleCommand";
import { getPendingConversationLogMessage } from "@game/helpers/conversationHelpers";
import type { CometEntry } from "@game/components/comet-index";
import type {
  ConversationMode,
  GameState,
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
