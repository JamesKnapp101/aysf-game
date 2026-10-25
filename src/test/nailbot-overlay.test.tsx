import { useEffect, useState } from "react";
import { act, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { OverlayHost } from "@game/components/OverlayHost";
import { NotificationHost } from "@game/components/NotificationHost";
import { LogTab } from "@game/components/LogTab";
import { handleCommand } from "@game/engine/handleCommand";
import { NPCS } from "@game/npcRegistry";
import { NPC_SECRETS } from "@game/npcSecrets";
import { exchangeTranscript } from "@game/rules/informationExchange";
import { useUIOverlayStore } from "@game/store/store";
import { parseCommand } from "../parse/parser";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

afterEach(() => useUIOverlayStore.getState().closeOverlay());

async function mountExchange(empty = false, input = "share gossip") {
  let latest = await handleCommand(nailBotFixture(), parseCommand("use voucher"));
  latest.uiState.conversationMode = "authored";
  if (empty) latest.player.spiltTea = [];
  const topics = [...latest.player.spiltTea];
  const opening = document.createElement("button");
  opening.textContent = "Open exchange";
  document.body.appendChild(opening);
  opening.focus();
  latest = await handleCommand(latest, parseCommand(input));
  function Harness() {
    const [state, setState] = useState(latest);
    useEffect(() => { latest = state; }, [state]);
    return <><OverlayHost state={state} setGameState={setState} runAction={(_verb, args) => {
      void handleCommand(state, parseCommand(String(args?.input))).then(setState);
    }} /><LogTab gameState={state} /><NotificationHost state={state} setGameState={setState} /></>;
  }
  const view = render(<Harness />);
  return { ...view, topics, opening, state: () => latest };
}

describe("information exchange overlay", () => {
  it("shows collected gossip and keeps the complete conversation visible until deliberately closed", async () => {
    const user = userEvent.setup();
    const view = await mountExchange(false, "tell robot about horny clone");
    const dialog = screen.getByRole("dialog", { name: "Gossip with NailBot" });
    const log = within(dialog).getByRole("log");
    expect(log).toBeEmptyDOMElement();
    expect(view.state().player.log).toEqual([]);
    expect(within(dialog).getByRole("heading", { name: "GOSSIPOPOLIS" })).toBeInTheDocument();
    expect(within(dialog).getByText("COMMUNICATIONS")).toBeInTheDocument();
    expect(within(dialog).getByRole("status")).toBeEmptyDOMElement();
    const gossip = within(dialog).getByRole("region", { name: "Collected gossip" });
    for (const topic of view.topics) {
      expect(within(gossip).getByRole("heading", { name: topic.title })).toBeInTheDocument();
      expect(within(gossip).getByTitle(topic.summary)).toHaveTextContent(topic.summary);
    }
    expect(dialog).not.toHaveTextContent(/required|remaining|3 rumors|three rumors|\/3/i);
    expect(dialog).not.toHaveTextContent(/Topic ID/i);
    for (const topic of view.topics) expect(within(dialog).queryByText(topic.id, { exact: true })).not.toBeInTheDocument();
    const order = [view.topics[1], view.topics[0], view.topics[2]];
    for (const topic of order) {
      const button = within(dialog).getByRole("button", { name: `Share ${topic.title}` });
      await user.click(button);
      await waitFor(() => expect(button).toBeDisabled());
      expect(log).toHaveTextContent(topic.summary);
      expect(log).toHaveTextContent(NPCS.NailBot.informationExchange!.responses[topic.id]);
      expect(button.closest("article")).toHaveClass("is-unavailable");
      expect(dialog).toBeInTheDocument();
    }
    expect(log).toHaveTextContent(NPC_SECRETS.nailbot_secret.text);
    const lines = exchangeTranscript(view.state(), "NailBot");
    const text = log.textContent!;
    for (let index = 1; index < lines.length; index++) expect(text.indexOf(lines[index].text)).toBeGreaterThan(text.indexOf(lines[index - 1].text));
    expect(within(dialog).getByRole("button", { name: "Share The Hiding Robot" })).toBeDisabled();
    expect(view.state().player.inventory.general).toContain("RobotWhistle");
    expect(view.state().player.log).toHaveLength(1);
    expect(view.state().player.log[0].body).toContain(NPC_SECRETS.nailbot_secret.text);
    expect(view.state().log.join("\n")).not.toContain(NPC_SECRETS.nailbot_secret.text);
    expect(view.state().uiState.notifications.filter(notification => notification.kind === "log")).toHaveLength(1);
    const notifications = [...view.state().uiState.notifications];
    await user.click(within(dialog).getByRole("button", { name: "That's All!" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => useUIOverlayStore.getState().openOverlay({ kind: "information-exchange", npcId: "NailBot" }));
    expect(screen.getByRole("log")).toHaveTextContent(NPC_SECRETS.nailbot_secret.text);
    expect(view.state().uiState.notifications).toEqual(notifications);
    expect(exchangeTranscript(view.state(), "NailBot")).toEqual(lines);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("tab", { name: /^gossip/i }));
    expect(screen.getByText("The Hiding Robot")).toBeInTheDocument();
    expect(screen.getByText(NPC_SECRETS.nailbot_secret.text)).toBeInTheDocument();
    expect(screen.getByText("Source: NailBot")).toBeInTheDocument();
    expect(screen.queryByText(/Topic ID/i)).not.toBeInTheDocument();
    view.opening.remove();
  });

  it("logs a partial conversation immediately, closes quietly, and opens it through the existing journal reader", async () => {
    const user = userEvent.setup();
    const view = await mountExchange();
    expect(view.state().player.log).toEqual([]);
    expect(view.state().uiState.notifications.filter(notification => notification.kind === "log")).toEqual([]);
    const topic = view.topics[1];
    const share = screen.getByRole("button", { name: `Share ${topic.title}` });
    await user.click(share);
    await waitFor(() => expect(share).toBeDisabled());
    const entry = view.state().player.log[0];
    expect(screen.getByText("You log the message for future reference.")).toHaveClass("game-notification--log");
    expect(entry.body).toContain(topic.summary);
    expect(entry.body).toContain(NPCS.NailBot.informationExchange!.responses[topic.id]);
    const mainLog = [...view.state().log];
    expect(mainLog.join("\n")).not.toContain(NPCS.NailBot.informationExchange!.secretTransition);
    await user.click(screen.getByRole("button", { name: "That's All!" }));
    expect(view.state().log).toEqual(mainLog);
    expect(view.state().player.log).toEqual([entry]);
    act(() => useUIOverlayStore.getState().openOverlay({ kind: "information-exchange", npcId: "NailBot" }));
    expect(screen.getByRole("log")).toHaveTextContent(NPCS.NailBot.informationExchange!.responses[topic.id]);
    expect(screen.getByRole("button", { name: `Share ${topic.title}` })).toBeDisabled();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: `Open log entry: ${entry.title}` }));
    expect(screen.getByRole("dialog", { name: entry.title }).textContent).toContain(entry.body);
    expect(view.state().uiState.notifications.filter(notification => notification.kind === "log")).toHaveLength(1);
    expect(view.state().log).toEqual(mainLog);
    view.opening.remove();
  });

  it("supports an empty, closable dialog with focus trapping, Escape dismissal, and focus restoration", async () => {
    const user = userEvent.setup();
    const view = await mountExchange(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("nothing interesting to share yet");
    expect(within(dialog).queryByRole("button", { name: /^Share / })).not.toBeInTheDocument();
    const close = dialog.querySelector<HTMLButtonElement>(".crt-modal-close")!;
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "That's All!" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("button", { name: "That's All!" }), { key: "Tab" });
    expect(close).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(view.opening).toHaveFocus();
    view.opening.remove();
  });
});
