import { RoomDescriptionPanel } from "@game/components/RoomDescriptionPanel";
import { useUIEffectsStore } from "@game/store/store";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

function renderRoomDescriptionPanel() {
  const state = createTestState();

  return render(
    <RoomDescriptionPanel
      desc="A test room description."
      exits={[]}
      roomPanelFlexBasis="33%"
      inputRef={{ current: null }}
      activeEffects=""
      roomIsDark={false}
      roomAmbientLight={true}
      playerCanSee={true}
      playerLightMode="ambient"
      flashlightOn="false"
      isUnderwater={false}
      roomId={state.player.roomId}
      state={state}
    />,
  );
}

describe("organism death overlay", () => {
  beforeAll(() => {
    if (!("ResizeObserver" in window)) {
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }

      Object.defineProperty(window, "ResizeObserver", {
        configurable: true,
        writable: true,
        value: ResizeObserverMock,
      });
    }

    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals grouped cipher chunks in seeded random order before clearing", async () => {
    vi.useFakeTimers();

    useUIEffectsStore.getState().playOrganismDeath({
      title: "SIGNAL RECEIVED",
      cipherText: "AAAAA BBBBB CCCCC DDDDD",
      seed: 7,
      revealMode: "random-chunks",
      chunkMs: 40,
      chunkSize: 5,
    });

    const { container } = renderRoomDescriptionPanel();

    const revealedChunks = () =>
      Array.from(
        container.querySelectorAll(
          '.organismdeath-token[data-revealable="true"][data-revealed="true"]',
        ),
      ).map((node) => node.textContent);

    expect(screen.getByText("SIGNAL RECEIVED")).toBeInTheDocument();
    expect(revealedChunks()).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(119);
    });

    expect(revealedChunks()).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(revealedChunks()).toEqual(["CCCCC"]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(40);
    });

    expect(revealedChunks()).toEqual(["BBBBB", "CCCCC"]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120);
    });

    expect(revealedChunks()).toEqual(["AAAAA", "BBBBB", "CCCCC", "DDDDD"]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5080);
    });

    expect(container.querySelector(".organismdeath-layer")).toBeNull();
  });
});
