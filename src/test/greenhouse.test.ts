import { useUIOverlayStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { setRadioFrequency } from "@game/helpers/radioHelpers";
import { APIARY_TRAY_ITEM_ID } from "src/world/maps/levelFour/Apiary";
import {
  DEACTIVATED_BEE_ITEM_ID,
  GREENHOUSE_BEE_SHUTDOWN_FREQUENCY,
  GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID,
  GREENHOUSE_SWARM_DEATH_CAUSE,
  deactivateGreenhouseBees,
} from "src/world/maps/levelFour/Greenhouse";
import {
  createTestState,
  expectInventoryToContain,
  runCommand,
  setInventory,
} from "./helpers/gameTestHelpers";

function getCommandEntry(state: { log: string[] }, command: string): string {
  for (let index = state.log.length - 1; index >= 0; index -= 1) {
    const entry = state.log[index];
    if (entry.includes(`> ${command}`)) return entry;
  }

  return "";
}

describe("greenhouse", () => {
  it("shows the active swarm outside and seeds the inert bee clue on first arrival", async () => {
    const next = await runCommand(
      createTestState({
        roomId: "BotanicalOne",
        visitedRooms: ["BotanicalOne"],
      }),
      "north",
    );

    const entry = getCommandEntry(next, "north");

    expect(next.player.roomId).toBe("Greenhouse");
    expect(next.itemState.itemRoomId[DEACTIVATED_BEE_ITEM_ID]).toBe(
      "Greenhouse",
    );
    expect(entry).toMatch(/swarm/i);
    expect(entry).toMatch(/buzzing/i);
    expect(entry).toContain("dead bumblebee");
  });

  it("uses the normal exterior description with no bee warning after deactivation", async () => {
    const next = await runCommand(
      deactivateGreenhouseBees(
        createTestState({
          roomId: "BotanicalOne",
          visitedRooms: ["BotanicalOne"],
        }),
      ),
      "north",
    );

    const entry = getCommandEntry(next, "north");

    expect(next.player.roomId).toBe("Greenhouse");
    expect(next.worldState.conditionalTriggers).toMatchObject({
      [GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID]: true,
    });
    expect(entry).not.toMatch(/swarm|buzzing|dead bumblebee/i);
    expect(next.itemState.itemRoomId[DEACTIVATED_BEE_ITEM_ID]).not.toBe(
      "Greenhouse",
    );
  });

  it("kills the player for entering the greenhouse interior while the swarm is active", async () => {
    const next = await runCommand(
      createTestState({
        roomId: "Greenhouse",
        rng: () => 0,
        visitedRooms: ["BotanicalOne", "Greenhouse"],
      }),
      "in",
    );

    const entry = getCommandEntry(next, "in");

    expect(next.player.roomId).toBe("BotanicalOne");
    expect(next.worldState.playerDeaths.Greenhouse?.cause).toBe(
      GREENHOUSE_SWARM_DEATH_CAUSE,
    );
    expect(entry).toMatch(/stingers/i);
    expect(next.log.join("\n")).toContain("*** You have died ***");
  });

  it("shows piles of deactivated bees inside after the swarm is shut down", async () => {
    const next = await runCommand(
      deactivateGreenhouseBees(
        createTestState({
          roomId: "Greenhouse",
          visitedRooms: ["Greenhouse"],
        }),
      ),
      "in",
    );

    const entry = getCommandEntry(next, "in");

    expect(next.player.roomId).toBe("GreenhouseInterior");
    expect(entry).toContain("Piles of deactivated robo-bees");
    expect(next.log.join("\n")).not.toContain("*** You have died ***");
  });

  it("deactivates the swarm when the radio call button beeps on the shutdown frequency outside", async () => {
    const start = setRadioFrequency(
      setInventory(
        createTestState({
          roomId: "Greenhouse",
          visitedRooms: ["Greenhouse"],
        }),
        ["Radio"],
      ),
      GREENHOUSE_BEE_SHUTDOWN_FREQUENCY,
    );

    const called = await runCommand(start, "push radio");
    const callEntry = getCommandEntry(called, "push radio");

    expect(callEntry).toContain(
      "emits a beep at frequency 168.880 MHz",
    );
    expect(callEntry).toContain("the harsh electric buzzing stutters");
    expect(called.worldState.conditionalTriggers).toMatchObject({
      [GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID]: true,
    });

    const entered = await runCommand(called, "in");

    expect(entered.player.roomId).toBe("GreenhouseInterior");
    expect(entered.log.join("\n")).not.toContain("*** You have died ***");
  });

  it("breaks the apiary room into scenery that can be examined", async () => {
    const state = createTestState({ roomId: "Apiary" });
    const description = buildRoomDescription(state, "Apiary", {
      forceFull: true,
      mode: "panel",
    });

    expect(description).toContain("drooping willow trees");
    expect(description).toContain("four large rectangular crates");
    expect(description).toContain("weatherproof computer terminal");

    const examinedCrates = await runCommand(state, "examine crates");
    expect(getCommandEntry(examinedCrates, "examine crates")).toContain(
      "rows of regular, thin horizontal slots",
    );

    await runCommand(state, "examine apiary terminal");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("apiary-terminal");
  });

  it("only accepts the deactivated bee on the apiary tray", async () => {
    const blocked = await runCommand(
      setInventory(createTestState({ roomId: "Apiary" }), ["Radio"]),
      "put radio on tray",
    );

    expect(getCommandEntry(blocked, "put radio on tray")).toContain(
      "doesn't fit",
    );
    expect(blocked.itemState.surfaceContents[APIARY_TRAY_ITEM_ID]).toBeUndefined();
    expect(expectInventoryToContain(blocked, "Radio")).toBe(true);

    const placed = await runCommand(
      setInventory(createTestState({ roomId: "Apiary" }), [
        DEACTIVATED_BEE_ITEM_ID,
      ]),
      "put bee on tray",
    );

    expect(placed.itemState.surfaceContents[APIARY_TRAY_ITEM_ID]).toContain(
      DEACTIVATED_BEE_ITEM_ID,
    );
    expect(expectInventoryToContain(placed, DEACTIVATED_BEE_ITEM_ID)).toBe(
      false,
    );
  });
});
