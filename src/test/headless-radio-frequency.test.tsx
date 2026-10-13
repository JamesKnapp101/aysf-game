import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioFrequencyModal } from "../game/components/RadioFrequencyModal";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { getCurrentRadioFrequency, setRadioFrequency } from "../game/helpers/radioHelpers";
import { reconcileObjectives } from "../game/rules/objectives";
import { useUIOverlayStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

describe("mounted headless radio frequency", () => {
  it("opens through the actual radio command and offers only the visible tuning controls", async () => {
    const controller = overlaySession(overlayFixture(["Radio"]));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const opened = text(await controller.explorer.command("set radio"));
    expect(opened).toContain("OMNITUNE");
    expect(opened).toContain("Signal Locked");
    expect(opened).toContain("146.520 MHz");
    expect(opened).toContain("136–174 MHz");
    expect(opened).toContain("Moves: 1");
    const before = await spy.mock.results[0].value;
    for (const input of ["scan", "call", "tune NaN", "tune Infinity", "+1", "wait"]) {
      expect(text(await controller.explorer.command(input))).toContain("146.520 MHz");
    }
    expect(spy).toHaveBeenCalledTimes(1);
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(before);
  });

  it.each([[135, 136], [175, 174], [150.003, 150.005], [136, 136], [174, 174]])("normalizes tuning %s to %s through the existing setter", async (frequency, expectedFrequency) => {
    const controller = overlaySession(overlayFixture(["Radio"]));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("set radio");
    const before = await spy.mock.results[0].value;
    expect(text(await controller.explorer.command(`tune ${frequency}`))).toContain(`${expectedFrequency.toFixed(3)} MHz`);
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(reconcileObjectives(before, setRadioFrequency(before, frequency)));
    expect(spy.mock.calls[1][0].moves).toBe(1);
  });

  it("matches React slider and fine/coarse button changes, including boundary clamping", async () => {
    const controller = overlaySession(overlayFixture(["Radio"]));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("set radio");
    const before = await spy.mock.results[0].value;
    let browserState = before;
    function Browser() {
      const [state, setState] = useState(before);
      return <RadioFrequencyModal state={state} onClose={() => {}} setGameState={updater => setState((previous: GameState) => {
        browserState = reconcileObjectives(previous, typeof updater === "function" ? updater(previous) : updater);
        return browserState;
      })} />;
    }
    render(<Browser />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "174" } });
    await controller.explorer.command("tune 174");
    for (const [input, label] of [["+0.005", /tune up 0\.005/i], ["-0.050", /tune down 0\.050/i], ["-0.005", /tune down 0\.005/i], ["+0.050", /tune up 0\.050/i]] as const) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(text(await controller.explorer.command(input))).toContain(`${getCurrentRadioFrequency(browserState).toFixed(3)} MHz`);
    }
    await controller.explorer.command("close");
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[1][0]).toEqual(browserState);
    expect(text(await controller.explorer.command("set radio"))).toContain("173.995 MHz");
    const history = await overlayHistory(controller);
    expect(history.filter(entry => entry.kind === "command").map(entry => entry.input)).toEqual(["set radio", "tune 174", "+0.005", "-0.050", "-0.005", "+0.050", "close", "inventory", "set radio"]);
    expect(JSON.stringify(history)).not.toMatch(/currentFrequency|radio-frequency|itemState/);
  });

  it("uses the tuned frequency on the later ordinary call without auto-calling", async () => {
    const controller = overlaySession(overlayFixture(["Radio"]));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("set radio");
    await controller.explorer.command("tune 150");
    await controller.explorer.command("close");
    const response = text(await controller.explorer.command("push radio"));
    expect(spy.mock.calls[1][0].worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
    expect(response).toContain("150.000 MHz");
    expect(response).toContain("Moves: 2");
    expect((await spy.mock.results[1].value).worldState.conditionalTriggers.radioFirstCall).toBe(true);
  });

  it("clears the mount on reset and does not accept tuning as a remote action", async () => {
    const controller = overlaySession(overlayFixture(["Radio"]));
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.start();
    await controller.explorer.command("set radio");
    await controller.explorer.command("tune 150");
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(overlayFixture(["Radio"]));
    await controller.reset();
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    await controller.explorer.command("tune 160");
    expect(text(await controller.explorer.command("set radio"))).toContain("146.520 MHz");
    expect(getCurrentRadioFrequency(spy.mock.calls[2][0])).toBe(146.52);
  });
});
