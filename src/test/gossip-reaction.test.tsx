import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InformationExchangeModal } from "@game/components/InformationExchangeModal";
import { GOSSIP_REACTIONS, GOSSIP_SPINNER_DURATION_MS } from "@game/components/gossipReactions";
import { shareGossip } from "@game/rules/informationExchange";
import { nailBotFixture } from "./helpers/nailBotTestHelpers";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

function fixture() {
  const state = nailBotFixture();
  state.worldState.conditionalTriggers.NailBotVoucherRedeemed = true;
  state.uiState.visualEffectsMode = "full";
  state.rng = vi.fn(() => 0);
  return state;
}

describe("gossip reaction display", () => {
  it("waits for an accepted new ID, decodes left to right, and leaves the final reaction visible", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let state = fixture();
    const topic = state.player.spiltTea[0];
    const onShare = vi.fn();
    const random = vi.spyOn(Math, "random").mockReturnValue(.5);
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={onShare} onClose={() => {}} />);
    const reaction = () => view.container.querySelector(".information-exchange-reaction")!;
    const word = () => reaction().querySelector('[aria-hidden="true"]')!.textContent!;
    expect(word()).toBe("");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: `Share ${topic.title}` }));
    expect(onShare).toHaveBeenCalledExactlyOnceWith(topic.id);
    // The callback alone can fail or be delayed; only accepted state starts the visual.
    view.rerender(<InformationExchangeModal state={{ ...state }} npcId="NailBot" onShare={onShare} onClose={() => {}} />);
    expect(reaction()).toHaveAttribute("data-spinning", "false");
    expect(word()).toBe("");
    expect(random).not.toHaveBeenCalled();

    state = shareGossip(state, "NailBot", topic.id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={onShare} onClose={() => {}} />);
    expect(reaction()).toHaveAttribute("data-spinning", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Receiving gossip");
    const initialScramble = word();
    act(() => vi.advanceTimersByTime(450));
    expect(word()).not.toBe(initialScramble);
    expect(word()).toMatch(/^OUT/);
    act(() => vi.advanceTimersByTime(GOSSIP_SPINNER_DURATION_MS));
    expect(reaction()).toHaveAttribute("data-spinning", "false");
    expect(word()).toBe("OUTRAGEOUS!");
    expect(GOSSIP_REACTIONS).toContain(word());
    expect(screen.getByRole("status")).toHaveTextContent(word());
    expect(vi.getTimerCount()).toBe(0);
    const randomCalls = random.mock.calls.length;
    state = shareGossip(state, "NailBot", topic.id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={onShare} onClose={() => {}} />);
    const share = screen.getByRole("button", { name: `Share ${topic.title}` });
    expect(share).toBeDisabled();
    fireEvent.click(share);
    expect(onShare).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(5000));
    expect(word()).toBe("OUTRAGEOUS!");
    expect(random).toHaveBeenCalledTimes(randomCalls);
    expect(state.rng).not.toHaveBeenCalled();
  });

  it("replaces an active spinner on another accepted share and clears timers on unmount", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let state = fixture();
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    for (const topic of state.player.spiltTea.slice(0, 2)) {
      state = shareGossip(state, "NailBot", topic.id).state;
      view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
      expect(view.container.querySelector(".information-exchange-reaction")).toHaveAttribute("data-spinning", "true");
      expect(vi.getTimerCount()).toBe(1);
      act(() => vi.advanceTimersByTime(100));
    }
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["system", "reduced", "off"] as const)("shows a final reaction immediately with %s reduced motion", setting => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let state = fixture();
    if (setting === "system") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      vi.spyOn(window, "matchMedia").mockReturnValue({ ...media, matches: true });
    } else state.uiState.visualEffectsMode = setting;
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    state = shareGossip(state, "NailBot", state.player.spiltTea[0].id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(view.container.querySelector(".information-exchange-reaction")).toHaveAttribute("data-spinning", "false");
    expect(GOSSIP_REACTIONS).toContain(screen.getByRole("status").textContent);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the reaction blank when reopening with previously shared gossip", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let state = fixture();
    state = shareGossip(state, "NailBot", state.player.spiltTea[0].id).state;
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(view.container.querySelector(".information-exchange-reaction")).toHaveAttribute("data-spinning", "false");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not animate when the existing game logic refuses an unpaid share", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const state = fixture();
    state.worldState.conditionalTriggers.NailBotVoucherRedeemed = false;
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    const refused = shareGossip(state, "NailBot", state.player.spiltTea[0].id);
    expect(refused.state).toBe(state);
    expect(refused.message).toMatch(/voucher/);
    view.rerender(<InformationExchangeModal state={refused.state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("settles an active animation when system reduced motion changes and removes its listener", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let reduced = false;
    const media = new EventTarget() as MediaQueryList;
    Object.defineProperty(media, "matches", { get: () => reduced });
    const removeListener = vi.spyOn(media, "removeEventListener");
    vi.spyOn(window, "matchMedia").mockReturnValue(media);
    let state = fixture();
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    state = shareGossip(state, "NailBot", state.player.spiltTea[0].id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(vi.getTimerCount()).toBe(1);
    act(() => { reduced = true; media.dispatchEvent(new Event("change")); });
    const word = screen.getByRole("status").textContent;
    expect(GOSSIP_REACTIONS).toContain(word);
    expect(vi.getTimerCount()).toBe(0);
    act(() => { reduced = false; media.dispatchEvent(new Event("change")); });
    expect(screen.getByRole("status")).toHaveTextContent(word!);
    expect(vi.getTimerCount()).toBe(0);
    view.unmount();
    expect(removeListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("scrolls on new exchanges while leaving transcript review undisturbed by spinner frames", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let state = fixture();
    const view = render(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 1000 });
    state = shareGossip(state, "NailBot", state.player.spiltTea[0].id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(log.scrollTop).toBe(1000);
    log.scrollTop = 150;
    act(() => vi.advanceTimersByTime(450));
    expect(log.scrollTop).toBe(150);
    state = shareGossip(state, "NailBot", state.player.spiltTea[1].id).state;
    view.rerender(<InformationExchangeModal state={state} npcId="NailBot" onShare={() => {}} onClose={() => {}} />);
    expect(log.scrollTop).toBe(1000);
  });
});
