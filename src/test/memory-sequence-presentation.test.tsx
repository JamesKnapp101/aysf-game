import { createRef } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoomDescriptionPanel } from "../game/components/RoomDescriptionPanel";
import { computeLingerMs, MIND_FLASH_TIMINGS, splitMemory as browserSplitMemory } from "../game/components/roomDescriptionEffects";
import * as engine from "../game/engine/handleCommand";
import * as dispatcher from "../game/actions/dispatchAction";
import { useGameSession } from "../game/hooks/useGameSession";
import { useUIEffectsStore } from "../game/store/store";
import { splitMemory } from "../game/text/memorySequence";
import { createTestState } from "./helpers/gameTestHelpers";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe("shared memory presentation", () => {
  it("keeps the existing React timings, fragment text/order and single completion callback", async () => {
    vi.useFakeTimers();
    expect(browserSplitMemory).toBe(splitMemory);
    const ended = vi.fn();
    const memory = "First fragment. Second fragment.";
    const { container, getByText } = render(<RoomDescriptionPanel
      desc="Ordinary surroundings." inputRef={createRef()} activeEffects="" roomIsDark={false}
      roomAmbientLight playerCanSee playerLightMode="" flashlightOn="off" isUnderwater={false}
      state={createTestState()}
    />);
    act(() => useUIEffectsStore.getState().playMindFlash({ memory, seed: 1, onEnd: ended }));
    await act(() => vi.advanceTimersByTimeAsync(MIND_FLASH_TIMINGS.START_DELAY_MS));
    expect(getByText("First fragment.")).toBeDefined();
    expect(container.querySelector(".game-room-desc")?.classList.contains("is-hijacked")).toBe(true);
    const interval = (fragment: string) => MIND_FLASH_TIMINGS.FADE_IN_MS + computeLingerMs(fragment) + MIND_FLASH_TIMINGS.FADE_OUT_MS + MIND_FLASH_TIMINGS.GAP_MS;
    await act(() => vi.advanceTimersByTimeAsync(interval("First fragment.")));
    expect(getByText("Second fragment.")).toBeDefined();
    expect(ended).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(interval("Second fragment.") + MIND_FLASH_TIMINGS.WIND_DOWN_MS));
    expect(ended).toHaveBeenCalledTimes(1);
    expect(useUIEffectsStore.getState().mindFlash).toBeNull();
    expect(container.querySelector(".game-room-desc")?.classList.contains("is-hijacked")).toBe(false);
    expect(getByText("Ordinary surroundings.")).toBeDefined();
  });

  it("blocks browser commands and UI actions until automatic presentation completes", async () => {
    const { result } = renderHook(() => useGameSession({ onCometCommand: vi.fn(), onInventoryCommand: vi.fn(), onDiagnoseCommand: vi.fn() }));
    await waitFor(() => expect(result.current.isSessionReady).toBe(true));
    const execute = vi.spyOn(engine, "handleCommand").mockImplementation(async state => state);
    const dispatch = vi.spyOn(dispatcher, "dispatchAction");
    act(() => useUIEffectsStore.getState().playMindFlash({ memory: "A fragment." }));
    await act(async () => {
      result.current.enqueueCommand("wait");
      result.current.runAction({ verb: "markMessagePlayed", payload: { messageId: "not-authorized-during-memory" } });
      await Promise.resolve();
    });
    expect(execute).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    act(() => useUIEffectsStore.getState().clearMindFlash());
    await act(async () => { result.current.enqueueCommand("wait"); await Promise.resolve(); });
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
