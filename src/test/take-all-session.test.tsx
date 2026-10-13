import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Game } from "../game/Game";
import * as engine from "../game/engine/handleCommand";
import { saveResumeSnapshot } from "../game/persistence/resumeStorage";
import { overlayFixture, overlayHistory, overlaySession, observationText } from "./helpers/headlessOverlayHelpers";

describe("TAKE ALL player command integration", () => {
  it.each(["take all", "get all", "pick up all"])("produces equivalent browser and headless state for %j", async (input) => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const controller = overlaySession(overlayFixture([]));
    const command = vi.spyOn(engine, "handleCommand");
    await controller.start();
    const observation = await controller.explorer.command(input);
    expect(command).toHaveBeenCalledTimes(1);
    const before = command.mock.calls[0][0];
    const expected = await command.mock.results[0].value;
    expect(saveResumeSnapshot(before)).toBe(true);

    const user = userEvent.setup();
    const { container } = render(<Game />);
    await waitFor(() => expect(container.querySelector(".game-input")).toBeTruthy());
    await user.type(container.querySelector(".game-input") as HTMLInputElement, `${input}{enter}`);
    await waitFor(() => expect(command).toHaveBeenCalledTimes(2));
    const actual = await command.mock.results[1].value;

    expect(actual.player).toEqual(expected.player);
    expect(actual.itemState).toEqual(expected.itemState);
    expect(actual.worldState).toEqual(expected.worldState);
    expect(actual.moves).toBe(1);
    expect(actual.score).toBe(expected.score);
    expect(actual.log).toEqual(expected.log);
    expect(observationText(observation)).toContain("You take mysterious note, broken flashlight, and spider-like shell.");
    expect(observationText(observation)).not.toMatch(/BombTimer|bomb timer|countdown timer/);
    expect(controller.capabilityDiagnostics!()).toEqual([]);

    const history = await overlayHistory(controller);
    expect(history.map((entry) => entry.input)).toEqual([undefined, input]);
    expect(history[1].observation).toEqual(observation);
    expect(JSON.stringify(history)).not.toMatch(/itemRoomId|BombTimer|brokenFlashlight/);
  });
});
