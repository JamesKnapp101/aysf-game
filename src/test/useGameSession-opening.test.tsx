import { renderHook, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameSession } from "../game/hooks/useGameSession";

const FIRST_RUN_HELP_HINT = "For instructions and other game info, type 'help'";

describe("useGameSession opening splash", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("seeds the help hint after dismissing the first-run opening splash", async () => {
    const { result } = renderHook(() =>
      useGameSession({
        onCometCommand: () => undefined,
        onDiagnoseCommand: () => undefined,
        onInventoryCommand: () => undefined,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSessionReady).toBe(true);
      expect(result.current.showOpeningSplash).toBe(true);
    });

    act(() => {
      result.current.dismissOpeningSplash();
    });

    await waitFor(() => {
      expect(result.current.showOpeningSplash).toBe(false);
    });

    expect(result.current.gs.log).toContain(FIRST_RUN_HELP_HINT);

    act(() => {
      result.current.dismissOpeningSplash();
    });

    expect(
      result.current.gs.log.filter((entry) => entry === FIRST_RUN_HELP_HINT),
    ).toHaveLength(1);
  });
});
