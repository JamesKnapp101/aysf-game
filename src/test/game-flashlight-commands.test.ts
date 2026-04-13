import { describe, expect, it } from "vitest";
import { createTestState, runCommand, setInventory } from "./helpers/gameTestHelpers";

describe("Flashlight command handling", () => {
  it("lets the player use turn on/off with the LED flashlight", async () => {
    const start = setInventory(createTestState({ roomId: "InsideTheShed" }), [
      "flashlight",
    ]);

    const turnedOn = await runCommand(start, "turn on flashlight");

    expect(turnedOn.itemState.itemSettings.flashlight).toMatchObject({
      kind: "flashlight",
      isOn: true,
    });
    expect(turnedOn.log.at(-1)).toContain("> turn on flashlight");
    expect(turnedOn.log.at(-1)).toContain("You turn the LED flashlight on.");

    const turnedOff = await runCommand(turnedOn, "turn off flashlight");

    expect(turnedOff.itemState.itemSettings.flashlight).toMatchObject({
      kind: "flashlight",
      isOn: false,
    });
    expect(turnedOff.log.at(-1)).toContain("> turn off flashlight");
    expect(turnedOff.log.at(-1)).toContain("You turn the LED flashlight off.");
  });

  it("lets the player use switch on/off with the broken flashlight", async () => {
    const start = setInventory(createTestState({ roomId: "StairWellSeven" }), [
      "damagedFlashlight",
    ]);

    const switchedOn = await runCommand(start, "switch on broken flashlight");

    expect(switchedOn.worldState.damagedFlashlight.isOn).toBe(true);
    expect(switchedOn.log.at(-1)).toContain("> switch on broken flashlight");
    expect(switchedOn.log.at(-1)).toContain(
      "You switch the broken flashlight on.",
    );

    const switchedOff = await runCommand(
      switchedOn,
      "switch off broken flashlight",
    );

    expect(switchedOff.worldState.damagedFlashlight.isOn).toBe(false);
    expect(switchedOff.log.at(-1)).toContain("> switch off broken flashlight");
    expect(switchedOff.log.at(-1)).toContain(
      "You switch the broken flashlight off.",
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
});
