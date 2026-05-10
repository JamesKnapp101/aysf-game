import { buildRoomDescription } from "@game/text/roomDescription";
import { dispatchAction } from "@game/actions/dispatchAction";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { useUIOverlayStore } from "@game/store/store";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  setInventory,
  runCommand,
} from "./helpers/gameTestHelpers";

function createMindScannerState(roomId: string) {
  const base = setInventory(createTestState({ roomId }), [
    "MindGun",
    "MindCap",
  ]);

  return {
    ...base,
    itemState: {
      ...base.itemState,
      wornByPlayer: {
        ...base.itemState.wornByPlayer,
        head: "MindCap",
      },
    },
  };
}

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

  it("blocks the gym speed dial and password-gates the spin stage speed dial", async () => {
    const state = createTestState({ roomId: "Gym" });

    const blocked = await runCommand(state, "set speed dial to 50");

    expect(getLastLogEntry(blocked)).toContain("Instructor Override");

    const spinStage = createTestState({ roomId: "SpinStage" });
    const prompted = await runCommand(spinStage, "set speed dial to 25");

    expect(getLastLogEntry(prompted)).toContain("Password Required");
    expect(useUIOverlayStore.getState().overlay).toMatchObject({
      kind: "spin-stage-speed-password",
      targetSpeed: 25,
    });

    const failed = await dispatchAction(prompted, {
      verb: "submitSpinStageSpeedPassword",
      payload: { password: "YX34-D", speed: 25 },
    });

    expect(failed.message).toBe("The password failed.");
    expect(failed.state.itemState.itemSettings.GymGiantTreadmill).toBeUndefined();

    const adjusted = await dispatchAction(prompted, {
      verb: "submitSpinStageSpeedPassword",
      payload: { password: "YX34-D940-6", speed: 25 },
    });
    const treadmillSettings =
      adjusted.state.itemState.itemSettings.GymGiantTreadmill;

    expect(adjusted.message).toBe("You set the instructor speed dial to 25.");
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

  it("lets a stronger player lift the barbell and grab the orange badge", async () => {
    const weak = createTestState({ roomId: "GymWeightRoom" });

    const failed = await runCommand(weak, "lift barbell");

    expect(expectInventoryToContain(failed, "orangebadge")).toBe(false);
    expect(getLastLogEntry(failed)).toContain("can't move it an inch");

    const strong = applyStatusEffectToPlayer(
      createTestState({ roomId: "GymWeightRoom" }),
      "stronger",
      100,
      10,
    );
    const lifted = await runCommand(strong, "move barbell");

    expect(expectInventoryToContain(lifted, "orangebadge")).toBe(true);
    expect(lifted.itemState.itemRoomId.orangebadge).toBe("INVENTORY");
    expect(lifted.worldState.conditionalTriggers.GymWeightlifterMoved).toBe(
      true,
    );
    expect(lifted.log.join("\n")).toContain("hook the orange badge");
    expect(getLastLogEntry(lifted)).toContain(
      "You feel a warmth flooding through you",
    );
  });

  it("keeps the spin instructor memory unresponsive", async () => {
    const linked = await runCommand(
      createMindScannerState("SpinStage"),
      "shoot body with scanner",
    );

    expect(linked.player.roomId).toBe("SpinInstructorSpinStageMemory");
    expect(
      buildRoomDescription(linked, "SpinInstructorSpinStageMemory", {
        mode: "panel",
        forceFull: true,
      }),
    ).toContain("PW: YX34-D940-6");

    const asked = await runCommand(linked, "ask woman about bike");

    expect(getLastLogEntry(asked)).toContain(
      "The woman continues to stare forward, eyes bulging, muscles locked.",
    );
  });

  it("runs the crushed weightlifter memory with SpotBot check-ins", async () => {
    const linked = await runCommand(
      createMindScannerState("GymWeightRoom"),
      "shoot body with scanner",
    );

    expect(linked.player.roomId).toBe("CrushedWeightlifterGymMemory");
    expect(linked.itemState.itemRoomId.CrushedWeightlifterMemorySpotBot).toBe(
      "CrushedWeightlifterGymMemory",
    );

    const firstTurn = await runCommand(linked, "wait");
    expect(getLastLogEntry(firstTurn)).toContain("You got this, bro?");

    const secondTurn = await runCommand(firstTurn, "wait");
    expect(getLastLogEntry(secondTurn)).toContain(
      "arms and legs begin to shake",
    );

    const thirdTurn = await runCommand(secondTurn, "wait");
    expect(getLastLogEntry(thirdTurn)).toContain("face purple");
    expect(thirdTurn.worldState.activeExperience).toBeDefined();

    const returned = await runCommand(thirdTurn, "wait");
    expect(returned.player.roomId).toBe("GymWeightRoom");
    expect(returned.worldState.activeExperience).toBeUndefined();
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
    expect(wall.uiState.notifications).toContainEqual(
      expect.objectContaining({
        kind: "damage",
        text: "You take 5 points of damage!",
      }),
    );
    expect(getLastLogEntry(wall)).toContain(
      "straight into the wall over the wire bin",
    );
    expect(getLastLogEntry(wall)).not.toMatch(/damage/i);
  });

  it("uses the exercise ball in the wire bin to bounce onto the spin stage", async () => {
    const state = createTestState({ roomId: "Gym" });

    const angledWithoutBall = await runCommand(state, "set angle dial to -10");
    const emptyBinCrash = await runCommand(angledWithoutBall, "west");

    expect(emptyBinCrash.player.roomId).toBe("Gym");
    expect(emptyBinCrash.player.vitals.health).toBe(95);
    expect(emptyBinCrash.uiState.notifications).toContainEqual(
      expect.objectContaining({
        kind: "damage",
        text: "You take 5 points of damage!",
      }),
    );
    expect(getLastLogEntry(emptyBinCrash)).toContain("empty wire bin");
    expect(getLastLogEntry(emptyBinCrash)).not.toMatch(/damage/i);

    const holdingBall = await runCommand(state, "take ball");
    const ballInBin = await runCommand(holdingBall, "put ball in bin");
    const angledWithBall = await runCommand(ballInBin, "set angle dial to -10");
    const bounced = await runCommand(angledWithBall, "west");

    expect(bounced.player.roomId).toBe("SpinStage");
    expect(bounced.player.vitals.health).toBe(100);
    expect(bounced.itemState.containerContents.GymExerciseBallRack).toContain(
      "GymExerciseBall",
    );
    expect(getLastLogEntry(bounced)).toContain(
      "launches you back into the air",
    );
  });

  it("lets the player scramble across when the instructor slows the treadmill", async () => {
    const state = createTestState({ roomId: "SpinStage" });

    const prompted = await runCommand(state, "set speed dial to 80");
    const unlocked = await dispatchAction(prompted, {
      verb: "submitSpinStageSpeedPassword",
      payload: { password: "YX34-D940-6", speed: 80 },
    });
    const slowed = unlocked.state;
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
