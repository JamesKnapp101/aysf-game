import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogTab } from "@game/components/LogTab";
import { collectContacts, collectLogEntry, collectTrivia } from "@game/rules/knowledge";
import { takeDNASample } from "@game/rules/dnaReader";
import { getSidebarTabSignatures } from "@game/helpers/sidebarTabNotifications";
import { useUIOverlayStore } from "@game/store/store";
import { createTestState } from "./helpers/gameTestHelpers";

function fixture() {
  let state = collectLogEntry(createTestState(), { id: "memo", title: "Recorded memo", body: "Complete text.\n\nExact spacing.", source: "Terminal" }).state;
  state = collectTrivia(state, [{ id: "fact", title: "Recorded fact", answer: "The answer", body: "The complete explanation.", source: "Archive" }]).state;
  state = collectContacts(state, [{ extension: "X001" }, { extension: "0000", name: "Poison Control", description: "Emergency advice" }]).state;
  state.player.spiltTea = [{ id: "rumor", title: "Recorded rumor", summary: "The complete gossip summary.", sourceNpcId: "Witness", tags: ["crew"], type: "secret" }];
  return state;
}

describe("Log knowledge presentation", () => {
  it("retains multiple samples for one person and opens their complete analysis", async () => {
    let state = createTestState();
    for (const id of ["FallenCorpse", "HeadlessCorpse"]) state = takeDNASample(state, state.world.items.find(item => item.id === id)!).updatedState;
    const user = userEvent.setup();
    render(<LogTab gameState={state} />);
    await user.click(screen.getByRole("tab", { name: "DNA 2" }));
    expect(screen.getAllByText("Mox Eegler")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: `Open DNA sample: ${state.player.dnaBank[0].title}` }));
    expect(useUIOverlayStore.getState().overlay).toMatchObject({ kind: "reader", body: expect.stringContaining("Cause of Death: Blunt force head trauma") });
  });

  it("filters discoveries without mutating collections and opens exact text and trivia details", async () => {
    const state = fixture();
    const before = JSON.stringify(state);
    const user = userEvent.setup();
    render(<LogTab gameState={state} />);
    expect(screen.getAllByRole("tab").map(tab => tab.textContent?.trim())).toEqual(["Discoveries 3", "Contacts 2", "DNA 0"]);
    const titles = () => within(screen.getByRole("list", { name: "Discoveries" })).getAllByRole("listitem").map(row => row.querySelector(".logtab-rowTitle")?.textContent);
    expect(titles()).toEqual(["Recorded memo", "Recorded rumor", "Recorded fact"]);
    await user.click(screen.getByRole("button", { name: "Text" }));
    expect(titles()).toEqual(["Recorded memo"]);
    fireEvent.keyDown(screen.getByRole("button", { name: "Open log entry: Recorded memo" }), { key: "Enter" });
    expect(useUIOverlayStore.getState().overlay).toMatchObject({ kind: "reader", title: "Recorded memo", body: state.player.log[0].body });
    useUIOverlayStore.getState().closeOverlay();
    await user.click(screen.getByRole("button", { name: "Gossip" }));
    expect(titles()).toEqual(["Recorded rumor"]);
    expect(screen.getByText("The complete gossip summary.")).toBeInTheDocument();
    expect(screen.getByText("Source: Witness")).toBeInTheDocument();
    expect(screen.getByText("crew")).toBeInTheDocument();
    expect(screen.getByText("Secret")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Trivia" }));
    expect(titles()).toEqual(["Recorded fact"]);
    await user.click(screen.getByRole("button", { name: "Open trivia fact: Recorded fact" }));
    expect(useUIOverlayStore.getState().overlay).toMatchObject({ kind: "reader", body: "Answer: The answer\n\nThe complete explanation.\n\nSource: Archive" });
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(titles()).toEqual(["Recorded memo", "Recorded rumor", "Recorded fact"]);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("shows identified and unidentified string extensions without pretending to offer calls", async () => {
    const user = userEvent.setup();
    render(<LogTab gameState={fixture()} />);
    await user.click(screen.getByRole("tab", { name: "Contacts 2" }));
    expect(screen.getByText("X001")).toBeInTheDocument();
    expect(screen.getByText("Unidentified extension")).toBeInTheDocument();
    expect(screen.getByText("0000")).toBeInTheDocument();
    expect(screen.getByText("Poison Control")).toBeInTheDocument();
    expect(screen.getByText("Emergency advice")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Collected contacts" })).queryByRole("button")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "DNA 0" }));
    expect(screen.getByText("No samples collected yet.")).toBeInTheDocument();
  });

  it("handles empty categories and reacts to contact identification and journal body updates", async () => {
    const empty = createTestState();
    const user = userEvent.setup();
    render(<LogTab gameState={empty} />);
    expect(screen.getByText("No discoveries collected yet.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Trivia" }));
    expect(screen.getByText("No trivia collected yet.")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Contacts 0" }));
    expect(screen.getByText("No contacts collected yet.")).toBeInTheDocument();
    const state = fixture();
    const signature = getSidebarTabSignatures(state).log;
    expect(getSidebarTabSignatures(collectLogEntry(state, { ...state.player.log[0], body: "Expanded" }, true).state).log).not.toBe(signature);
    expect(getSidebarTabSignatures(collectContacts(state, [{ extension: "X001", name: "Identified caller" }]).state).log).not.toBe(signature);
    expect(getSidebarTabSignatures(collectTrivia(state, [{ id: "another", title: "Another fact", answer: "Another answer" }]).state).log).not.toBe(signature);
  });
});
