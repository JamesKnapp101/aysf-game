import { getDisplayedFlashlightStatus } from "@game/helpers/flashlightHelpers";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("Flashlight command handling", () => {
  it("lets the player use turn on/off with the LED flashlight", async () => {
    const start = setInventory(createTestState({ roomId: "InsideTheShed" }), [
      "flashlight",
    ]);

    const turnedOn = await runCommand(start, "turn on flashlight");

    expect(turnedOn.itemState.itemSettings.flashlight).toMatchObject({
      kind: "flashlight",
      isOn: true,
      maxCharge: 100,
      currentCharge: 99.95,
      drainRate: 0.05,
      rechargeRate: 10,
    });
    expect(turnedOn.log.at(-1)).toContain("> turn on flashlight");
    expect(turnedOn.log.at(-1)).toContain("You turn the LED flashlight on.");

    const turnedOff = await runCommand(turnedOn, "turn off flashlight");

    expect(turnedOff.itemState.itemSettings.flashlight).toMatchObject({
      kind: "flashlight",
      isOn: false,
      currentCharge: 100,
    });
    expect(turnedOff.log.at(-1)).toContain("> turn off flashlight");
    expect(turnedOff.log.at(-1)).toContain("You turn the LED flashlight off.");
  });

  it("lets the player use switch on/off with the broken flashlight", async () => {
    const start = setInventory(createTestState({ roomId: "StairWellSeven" }), [
      "brokenFlashlight",
    ]);

    const switchedOn = await runCommand(start, "switch on broken flashlight");

    expect(switchedOn.itemState.itemSettings.brokenFlashlight).toMatchObject({
      isOn: true,
    });
    expect(switchedOn.log.at(-1)).toContain("> switch on broken flashlight");
    expect(switchedOn.log.at(-1)).toContain(
      "you don't see so much as a flicker",
    );
    expect(getDisplayedFlashlightStatus(switchedOn).hasFlashlight).toBe(false);

    const switchedOff = await runCommand(
      switchedOn,
      "switch off broken flashlight",
    );

    expect(switchedOff.itemState.itemSettings.brokenFlashlight).toMatchObject({
      isOn: false,
    });
    expect(switchedOff.log.at(-1)).toContain("> switch off broken flashlight");
    expect(switchedOff.log.at(-1)).toContain(
      "you don't see so much as a flicker",
    );
  });

  it("does not toggle a flashlight on when the player explicitly says off", async () => {
    const start = setInventory(createTestState({ roomId: "InsideTheShed" }), [
      "flashlight",
    ]);

    const next = await runCommand(start, "switch off flashlight");

    expect(next.itemState.itemSettings.flashlight).toMatchObject({
      kind: "flashlight",
      isOn: false,
    });
    expect(next.log.at(-1)).toContain("The LED flashlight is already off.");
  });

  it("prefers the LED flashlight for the room indicator when both flashlights are on", async () => {
    const start = setInventory(createTestState({ roomId: "StairWellSeven" }), [
      "flashlight",
      "brokenFlashlight",
    ]);

    const bothOn = await runCommands(start, [
      "switch on broken flashlight",
      "turn on flashlight",
    ]);
    const flashlightStatus = getDisplayedFlashlightStatus(bothOn);

    expect(flashlightStatus.hasFlashlight).toBe(true);
    expect(flashlightStatus.isActive).toBe(true);
    expect(flashlightStatus.itemId).toBe("flashlight");
    expect(flashlightStatus.settings?.currentCharge).toBe(99.95);
  });
});
