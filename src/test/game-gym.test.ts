import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("Gym interactions", () => {
  it("updates the giant treadmill angle from the gym angle dial", async () => {
    const state = createTestState({ roomId: "Gym" });

    expect(
      buildRoomDescription(state, "Gym", { mode: "panel", forceFull: true }),
    ).toContain("The surface is completely level.");
    expect(
      buildRoomDescription(state, "Gym", { mode: "panel", forceFull: true }),
    ).toContain("woman's body lying beside it");
    expect(
      buildRoomDescription(state, "Gym", { mode: "panel", forceFull: true }),
    ).toContain("belt is pegged at 100");

    const angled = await runCommand(state, "set angle dial to -10");

    expect(getLastLogEntry(angled)).toContain(
      "You set the treadmill angle dial to -10.",
    );
    expect(
      buildRoomDescription(angled, "Gym", { mode: "panel", forceFull: true }),
    ).toContain("The surface slopes down 10 degrees.");
  });

  it("blocks the gym speed dial but lets the spin stage speed dial work", async () => {
    const state = createTestState({ roomId: "Gym" });

    const blocked = await runCommand(state, "set speed dial to 50");

    expect(getLastLogEntry(blocked)).toContain("Instructor Override");

    const spinStage = createTestState({ roomId: "SpinStage" });
    const adjusted = await runCommand(spinStage, "set speed dial to 25");
    const treadmillSettings = adjusted.itemState.itemSettings.GymGiantTreadmill;

    expect(getLastLogEntry(adjusted)).toContain(
      "You set the instructor speed dial to 25.",
    );
    expect(treadmillSettings).toMatchObject({
      kind: "gym-treadmill",
      speed: 25,
    });
  });

  it("lets the exercise ball bounce, sit badly, and drop before leaving", async () => {
    const state = createTestState({ roomId: "Gym" });

    const holdingBall = await runCommand(state, "take ball");
    expect(expectInventoryToContain(holdingBall, "GymExerciseBall")).toBe(true);

    const sat = await runCommand(holdingBall, "sit on ball");
    expect(getLastLogEntry(sat)).toContain("a lot harder than it looks");

    const bounced = await runCommand(sat, "bounce ball");
    expect(expectInventoryToContain(bounced, "GymExerciseBall")).toBe(false);
    expect(bounced.itemState.itemRoomId.GymExerciseBall).toBe("Gym");
    expect(getLastLogEntry(bounced)).toContain("rockets away");

    const holdingAgain = await runCommand(bounced, "take ball");
    const leftGym = await runCommand(holdingAgain, "north");

    expect(leftGym.player.roomId).toBe("GymWeightRoom");
    expect(expectInventoryToContain(leftGym, "GymExerciseBall")).toBe(false);
    expect(leftGym.itemState.itemRoomId.GymExerciseBall).toBe("Gym");
    expect(getLastLogEntry(leftGym)).toContain("too bulky to carry");
  });

  it("blocks the orange badge while the weightlifter is pinning it", async () => {
    const state = createTestState({ roomId: "GymWeightRoom" });

    expect(
      buildRoomDescription(state, "GymWeightRoom", {
        mode: "panel",
        forceFull: true,
      }),
    ).toContain("orange plastic badge peeks out");

    const blocked = await runCommand(state, "take orange badge");

    expect(expectInventoryToContain(blocked, "orangebadge")).toBe(false);
    expect(getLastLogEntry(blocked)).toContain("trapped");

    const freed = {
      ...blocked,
      worldState: {
        ...blocked.worldState,
        conditionalTriggers: {
          ...blocked.worldState.conditionalTriggers,
          GymWeightlifterMoved: true,
        },
      },
    };
    const taken = await runCommand(freed, "take orange badge");

    expect(expectInventoryToContain(taken, "orangebadge")).toBe(true);
    expect(getLastLogEntry(taken)).toContain("Taken.");
  });

  it("turns the fast treadmill into a launch hazard when crossing west", async () => {
    const state = createTestState({ roomId: "Gym" });

    const launchedFlat = await runCommand(state, "west");

    expect(launchedFlat.player.roomId).toBe("Gym");
    expect(launchedFlat.player.vitals.health).toBe(100);
    expect(getLastLogEntry(launchedFlat)).toContain("tumbling across the floor");

    const angled = await runCommand(state, "set angle dial to -20");
    const wall = await runCommand(angled, "west");

    expect(wall.player.roomId).toBe("Gym");
    expect(wall.player.vitals.health).toBe(95);
    expect(getLastLogEntry(wall)).toContain("take 5 damage");
  });

  it("uses the exercise ball in the wire bin to bounce onto the spin stage", async () => {
    const state = createTestState({ roomId: "Gym" });

    const angledWithoutBall = await runCommand(state, "set angle dial to -10");
    const emptyBinCrash = await runCommand(angledWithoutBall, "west");

    expect(emptyBinCrash.player.roomId).toBe("Gym");
    expect(emptyBinCrash.player.vitals.health).toBe(95);
    expect(getLastLogEntry(emptyBinCrash)).toContain("empty wire bin");

    const holdingBall = await runCommand(state, "take ball");
    const ballInBin = await runCommand(holdingBall, "put ball in bin");
    const angledWithBall = await runCommand(ballInBin, "set angle dial to -10");
    const bounced = await runCommand(angledWithBall, "west");

    expect(bounced.player.roomId).toBe("SpinStage");
    expect(bounced.player.vitals.health).toBe(100);
    expect(bounced.itemState.containerContents.GymExerciseBallRack).toContain(
      "GymExerciseBall",
    );
    expect(getLastLogEntry(bounced)).toContain("bounce off it");
  });

  it("lets the player scramble across when the instructor slows the treadmill", async () => {
    const state = createTestState({ roomId: "SpinStage" });

    const slowed = await runCommand(state, "set speed dial to 80");
    const crossedEast = await runCommand(slowed, "east");
    const crossedWest = await runCommand(crossedEast, "west");

    expect(crossedEast.player.roomId).toBe("Gym");
    expect(crossedWest.player.roomId).toBe("SpinStage");
    expect(getLastLogEntry(crossedWest)).toContain("scramble across");
  });

  it("still flings the player back from the spin stage when the belt is too fast", async () => {
    const state = createTestState({ roomId: "SpinStage" });

    const launchedBack = await runCommand(state, "east");

    expect(launchedBack.player.roomId).toBe("Gym");
    expect(getLastLogEntry(launchedBack)).toContain("moving too fast");
  });
});
