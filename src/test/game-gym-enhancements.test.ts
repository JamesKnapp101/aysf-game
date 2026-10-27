import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildRoomDescription } from "@game/text/roomDescription";
import { restoreManualSnapshot, saveManualSnapshot } from "@game/persistence/resumeStorage";
import { useUIOverlayStore } from "@game/store/store";
import { migrateGymContentSnapshot } from "src/world/maps/levelThree/Park/Gym/gymContentMigration";
import { applyStatusEffectToPlayer } from "@game/rules/status";
import { mergeWorldChunkIntoState } from "@game/gameInit";
import { LEVEL_ONE } from "src/world/maps/LevelOne";
import { LEVEL_THREE } from "src/world/maps/levelThree/LevelThree";
import { formatGymReservations, gymReservations } from "src/world/maps/levelThree/Park/Gym/gymAmenities";
import { GYM_EFFECT_NAMES, GYM_MACHINE_SUFFIXES, GYM_MUSCLE_GROUPS, GYM_LIFTING_MESSAGE } from "src/world/maps/levelThree/Park/Gym/gymWeightMachines";
import { setGymTreadmillAngle, setGymTreadmillSpeed } from "src/world/maps/levelThree/Park/Gym/gymTreadmill";
import { createTestState, expectInventoryToContain, getLastLogEntry, runCommand, runCommands } from "./helpers/gameTestHelpers";

beforeEach(() => { localStorage.clear(); useUIOverlayStore.getState().closeOverlay(); });
const gym = () => createTestState({ roomId: "Gym" });
const weights = () => createTestState({ roomId: "GymWeightRoom" });
const roomText = (state = gym()) => buildRoomDescription(state, state.player.roomId, { mode: "panel", forceFull: true });

describe("Gym bar and sign-up scenery", () => {
  it.each(["bar", "juice bar", "smoothie bar"])("examines %s", async noun => {
    expect(getLastLogEntry(await runCommand(gym(), `examine ${noun}`))).toContain("There's blenders, ice, and all kind of ingredients back there but it's all locked down and there's nobody back there.");
  });
  it("renders discoverable scenery without printing reservations", async () => {
    const text = roomText();
    expect(text).toContain("Along the far wall is a juice and smoothie bar with rows of empty stools.");
    expect(text).toContain("digital sign-up sheet");
    expect(text).not.toContain("Rhomboid Onche");
    expect(text).not.toContain("[[SCENERY]]");
    expect(getLastLogEntry(await runCommand(gym(), "examine banner"))).toContain("Try the new Insta-roid Shake and get the MOST out of your WORKOUT!");
    for (const noun of ["bar", "banner", "stool", "sheet"]) {
      expect(getLastLogEntry(await runCommand(gym(), `take ${noun}`))).toContain("You can't take that.");
    }
  });
  it.each(["order shake", "order drink", "buy shake", "buy smoothie", "order smoothie", "buy a drink", "purchase juice", "order protein shake at bar"])("handles %s", async command => {
    const state = await runCommand(gym(), command);
    expect(getLastLogEntry(state)).toContain("The bar isn't being tended at the moment.");
    expect(state.player.inventory).toEqual(gym().player.inventory);
  });
  it.each(["sit on stool", "sit at bar", "sit on bar stool"])("tracks posture for %s and clears it on departure", async command => {
    let state = await runCommand(gym(), command);
    expect(getLastLogEntry(state)).toContain("You sit at the bar.");
    expect(state.worldState.conditionalTriggers.GymSittingAtBar).toBe(true);
    state = await runCommand(state, "get up");
    expect(getLastLogEntry(state)).toContain("You stand up.");
    state = await runCommand(state, "get up");
    expect(getLastLogEntry(state)).toContain("You're already standing.");
    state = await runCommands(state, [command, "stand up"]);
    expect(getLastLogEntry(state)).toContain("You stand up.");
    state = await runCommands(state, [command, "north", "south", "stand up"]);
    expect(getLastLogEntry(state)).toContain("You're already standing.");
  });
  it.each(["sign in", "sign up", "sign name"])("handles %s", async command => {
    expect(getLastLogEntry(await runCommand(gym(), command))).toContain("The tablet isn't responding at the minute.");
    expect(getLastLogEntry(await runCommand(weights(), command))).not.toContain("tablet isn't responding");
  });
  it.each(["examine sheet", "read sheet", "read signup sheet", "examine sign up sheet", "read tablet", "examine tablet"])("formats all rows for %s", async command => {
    const log = getLastLogEntry(await runCommand(gym(), command));
    expect(log).toContain(formatGymReservations());
    for (const row of gymReservations) for (const value of Object.values(row)) expect(log).toContain(value);
    const lines = formatGymReservations().split("\n");
    expect(new Set(lines.filter(line => line.includes(" | ")).map(line => line.indexOf(" | "))).size).toBe(1);
  });
  it("automatically resizes columns for new rows", () => {
    const row = { name: "An exceptionally long new gym member name", locker: "M100", reservation: "Sauna (0100)" };
    const lines = formatGymReservations([...gymReservations, row]).split("\n");
    expect(lines.at(-1)).toContain(row.name);
    expect(new Set(lines.filter(line => line.includes(" | ")).map(line => line.indexOf(" | "))).size).toBe(1);
  });
  it("leaves other rooms and scale commands alone", async () => {
    expect(getLastLogEntry(await runCommand(weights(), "buy smoothie"))).not.toContain("bar isn't being tended");
    expect(getLastLogEntry(await runCommand(gym(), "stand on scale"))).toContain("86kg");
  });
});

describe("Exercise ball treadmill rolls", () => {
  const start = "You roll the ball across the treadmill and it begins to roll down the angled treadmill, then spins in place for a moment before the moving belt sends it shooting back! ";
  const high = start + "It hits the far wall just above the wire bin, then bounces off, hits the ceiling, then bounces around the room for a while before rolling to a stop.";
  const perfect = start + "The ball continues to spin as it flies through the air in a perfect arc before landing right in the wire bin! Awesome!";
  const low = start + "The ball flies past at about knee height before skidding off the floor and bouncing around for a bit, then rolling to a stop.";
  const other = "With the treadmill angled down toward your side, the ball quickly shoots back down the ramp, hits the base, and goes bouncing away.";
  it.each([[-20, high], [-15, high], [-14, other], [-11, other], [-10, perfect], [-9, low], [-1, low], [0, other], [20, other]] as const)("rolls at angle %i", async (angle, message) => {
    const state = await runCommand(setGymTreadmillAngle(gym(), angle), "roll ball across treadmill");
    expect(getLastLogEntry(state)).toContain(message);
    expect(state.itemState.itemRoomId.GymExerciseBall).toBe(angle === -10 ? "GymExerciseBallRack" : "Gym");
    expect(state.world.items.filter(item => item.id === "GymExerciseBall")).toHaveLength(1);
  });
  it.each(["roll ball west", "roll ball across treadmill", "roll the ball across the treadmill"])("moves the held ball to the stage when off: %s", async command => {
    const held = await runCommand(gym(), "take ball");
    const state = await runCommand(setGymTreadmillSpeed(setGymTreadmillAngle(held, -10), 0), command);
    expect(getLastLogEntry(state)).toContain("You roll the ball across the deactivated treadmill, and it ends up over by the Spin Stage.");
    expect(state.itemState.itemRoomId.GymExerciseBall).toBe("SpinStage");
    expect(expectInventoryToContain(state, "GymExerciseBall")).toBe(false);
    expect(Object.values(state.itemState.containerContents).flat()).not.toContain("GymExerciseBall");
    expect(getLastLogEntry(await runCommand(state, "roll ball west"))).toContain("You don't see that here.");
    const crossed = await runCommand(state, "west");
    expect(getLastLogEntry(await runCommand(crossed, "examine ball"))).toContain("giant rubber exercise ball");
  });
  it("uses a successful roll in the existing crossing solution", async () => {
    const state = await runCommands(gym(), ["take ball", "set angle dial to -10", "roll ball west"]);
    expect(state.itemState.containerContents.GymExerciseBallRack).toEqual(["GymExerciseBall"]);
    expect(expectInventoryToContain(state, "GymExerciseBall")).toBe(false);
    expect((await runCommand(state, "west")).player.roomId).toBe("SpinStage");
  });
  it("does not use an inaccessible ball or intercept rolls elsewhere", async () => {
    const state = gym();
    state.itemState.itemRoomId.GymExerciseBall = "DuffelBag";
    expect(getLastLogEntry(await runCommand(state, "roll ball west"))).toContain("You don't see that here.");
    expect(getLastLogEntry(await runCommand(weights(), "roll ball west"))).not.toContain("moving belt");
  });
});

describe("Pinned smart barbell feedback", () => {
  const attempts: [string, string][] = [
    ["pull lanyard", "You pull the lanyard as hard as you can but you can't get it to budge an inch."],
    ["pull badge", "You get a grip on the corner and pull, but you can't get it to move."],
    ["push body", "The part you'd need to push looks like it would weigh a ton even if it wasn't pinned under a 4007 kilo barbell."],
    ["pull body", "You grab an arm and give it a heave but nothing moves an inch."],
    ["lift body", "It's pinned under that barbell, you're going to have to find a way to move that first."],
    ["move body", "You'll never move it with that weight pinning it down."],
    ["examine barbell", "Its display is cracked and appears to be damaged, registering a weight of 4007 kilograms. The bar has embedded itself in the man's broad chest."],
    ...["turn off barbell", "shut off barbell", "shut off the barbell", "switch off barbell", "turn the barbell off"].map(command => [command, "It's not responding to the controls, I think something damaged it."] as [string, string]),
    ...["roll weights", "roll barbell", "roll weights off body", "roll barbell off body", "roll barbell off corpse"].map(command => [command, "The bar is embedded in about three inches of muscle and rib cage, it's not going anywhere."] as [string, string]),
    ...["remove plates", "remove plates from barbell", "take plates"].map(command => [command, "There aren't any plates, it uses an adjustable gravity field to change the weight, which is unfortunately stuck at 4007 kilograms."] as [string, string]),
  ];
  it.each(attempts)("handles %s without freeing the badge", async (command, message) => {
    const state = await runCommand(weights(), command);
    expect(getLastLogEntry(state)).toContain(message);
    expect(expectInventoryToContain(state, "yellowbadge")).toBe(false);
    expect(state.worldState.conditionalTriggers.GymWeightlifterMoved).not.toBe(true);
  });
  it.each(["corpse", "man", "the body"])("supports %s as a body alias", async noun => {
    expect(getLastLogEntry(await runCommand(weights(), `lift ${noun}`))).toContain("It's pinned under that barbell");
    expect(getLastLogEntry(await runCommand(weights(), `pull ${noun}`))).toContain("You grab an arm");
  });
  it("preserves the strength solution and stops trapped-state feedback afterwards", async () => {
    let state = applyStatusEffectToPlayer(weights(), "stronger", 100, 100);
    state = await runCommand(state, "lift body");
    expect(expectInventoryToContain(state, "yellowbadge")).toBe(false);
    state = await runCommand(state, "lift barbell");
    expect(expectInventoryToContain(state, "yellowbadge")).toBe(true);
    for (const [command, message] of attempts.filter(([command]) => !command.startsWith("examine"))) {
      expect(getLastLogEntry(await runCommand(state, command))).not.toContain(message);
    }
    expect(getLastLogEntry(await runCommand(gym(), "pull badge"))).not.toContain("get a grip on the corner");
  });
});

describe("Weightlifting and exercise machines", () => {
  it.each(["use weights", "lift weights", "pump iron"])("handles %s", async command => {
    expect(getLastLogEntry(await runCommand(weights(), command))).toContain(GYM_LIFTING_MESSAGE);
  });
  it.each(["use machines", "use weight machines"])("draws all three parts independently for %s", async command => {
    const state = weights();
    state.rng = vi.fn().mockReturnValueOnce(0.25).mockReturnValueOnce(0.6).mockReturnValueOnce(0.3).mockReturnValue(0);
    expect(getLastLogEntry(await runCommand(state, command))).toContain("You decide to give the Lat-Blaster Pro a try. You get yourself situated and grind out a few reps. You can really feel it in your Lat!");
  });
  it.each(["use lat blaster pro", "USE LAT-BLASTER PRO", "use ab shredder 5000", "use glute annihilator supreme", "use bicep pumper 2"])("recognizes %s", async command => {
    const parts = command.toLowerCase().split(/[\s-]+/).slice(1);
    const expected = [GYM_MUSCLE_GROUPS, GYM_EFFECT_NAMES, GYM_MACHINE_SUFFIXES].map((values, index) => values.find(value => value.toLowerCase() === parts[index]));
    expect(getLastLogEntry(await runCommand(weights(), command))).toContain(`You decide to give the ${expected[0]}-${expected[1]} ${expected[2]} a try. You get yourself situated and grind out a few reps. You can really feel it in your ${expected[0]}!`);
  });
  it("leaves unrelated uses and other rooms unaffected", async () => {
    for (const command of ["use barbell", "use lat blaster 123", "use machines with badge"]) {
      expect(getLastLogEntry(await runCommand(weights(), command))).not.toContain("You decide to give");
    }
    expect(getLastLogEntry(await runCommand(gym(), "use lat blaster pro"))).not.toContain("You decide to give");
  });
});

describe("Spin Stage gym tote", () => {
  it("is discoverable and examinable but unreachable from the Gym", async () => {
    expect(roomText()).toContain("duffel bag rests beside the woman's body");
    expect(getLastLogEntry(await runCommand(gym(), "examine duffel bag"))).toContain("small black and neon pink duffel bag with a shoulder strap");
    for (const command of ["get duffel bag", "take gym tote", "get bag", "open tote", "search bag", "put ball in bag", "look under bag"]) {
      const state = await runCommand(gym(), command);
      expect(getLastLogEntry(state)).toContain("You can't reach it from here.");
      expect(state.itemState.itemRoomId.DuffelBag).toBe("SpinStage");
      expect(state.itemState.openItems.DuffelBag).not.toBe(true);
    }
  });
  it("seeds and retrieves all contents using normal container behavior", async () => {
    let state = createTestState({ roomId: "SpinStage" });
    expect(state.itemState.containerContents.DuffelBag).toEqual(["YogaPants", "CropTop", "TeacherId"]);
    expect(getLastLogEntry(await runCommand(state, "take yoga pants"))).not.toContain("Taken.");
    state = await runCommands(state, ["take bag", "open bag"]);
    expect(expectInventoryToContain(state, "DuffelBag")).toBe(true);
    expect(state.itemState.openItems.DuffelBag).toBe(true);
    expect(getLastLogEntry(state)).toContain("yoga pants");
    state = await runCommands(state, ["take yoga pants", "take crop top", "take teacher's badge"]);
    for (const id of ["YogaPants", "CropTop", "TeacherId"]) {
      expect(expectInventoryToContain(state, id)).toBe(true);
      expect(state.itemState.itemRoomId[id]).toBe("INVENTORY");
    }
    expect(state.itemState.containerContents.DuffelBag).toEqual([]);
    expect(expectInventoryToContain(state, "yellowbadge")).toBe(false);
  });
  it("persists contents, clothing, posture and ball placement across save/load without duplication", async () => {
    let state = await runCommands(mergeWorldChunkIntoState(createTestState({ roomId: "SpinStage" }), "level-three", LEVEL_THREE), ["take bag", "open bag", "take yoga pants", "take crop top", "wear yoga pants", "wear crop top"]);
    expect(state.itemState.wornByPlayer.legs).toBe("YogaPants");
    expect(state.itemState.wornByPlayer.torso).toBe("CropTop");
    state = await runCommand(state, "east");
    state = await runCommands(setGymTreadmillSpeed(state, 0), ["roll ball west", "sit at bar"]);
    expect(saveManualSnapshot(state)).toBe(true);
    const restored = (await restoreManualSnapshot())!;
    expect(restored).not.toBeNull();
    expect(restored.itemState.wornByPlayer.legs).toBe("YogaPants");
    expect(restored.itemState.wornByPlayer.torso).toBe("CropTop");
    expect(restored.itemState.containerContents.DuffelBag).toEqual(["TeacherId"]);
    expect(restored.itemState.itemRoomId.GymExerciseBall).toBe("SpinStage");
    expect(getLastLogEntry(await runCommand(restored, "stand up"))).toContain("You stand up.");
    const merged = mergeWorldChunkIntoState(restored, "level-one", LEVEL_ONE);
    expect(merged.itemState.containerContents.DuffelBag).toEqual(["TeacherId"]);
    for (const id of ["DuffelBag", "YogaPants", "CropTop", "TeacherId", "GymExerciseBall"]) expect(merged.world.items.filter(item => item.id === id)).toHaveLength(1);
    const taken = await runCommand(restored, "take teacher's badge from bag");
    expect(expectInventoryToContain(taken, "TeacherId")).toBe(true);
    expect(getLastLogEntry(await runCommand(taken, "examine teacher's badge"))).toContain("Myndricks Fondwell, Substitute Teacher");
  });
});



describe("Gym persistence and reach edge cases", () => {
  it("lets the visible exercise ball be rolled again from the open wire bin", async () => {
    const inBin = await runCommands(gym(), ["set angle dial to -10", "roll ball west"]);
    const rolled = await runCommand(setGymTreadmillSpeed(inBin, 0), "roll ball west");
    expect(rolled.itemState.itemRoomId.GymExerciseBall).toBe("SpinStage");
    expect(rolled.itemState.containerContents.GymExerciseBallRack).toEqual([]);
  });
  it.each([-20, -15, -10, -9, -1, 0, 20])("ignores incline %i when the belt is off", async angle => {
    const state = await runCommand(setGymTreadmillSpeed(setGymTreadmillAngle(gym(), angle), 0), "roll ball west");
    expect(state.itemState.itemRoomId.GymExerciseBall).toBe("SpinStage");
    expect(getLastLogEntry(state)).toContain("You roll the ball across the deactivated treadmill, and it ends up over by the Spin Stage.");
  });
  it("keeps an unrelated local bag ahead of the remote tote", async () => {
    const state = gym();
    state.world = { ...state.world, items: [...state.world.items, {
      id: "TestLocalBag", name: "paper bag", description: "An unrelated paper bag.",
      vocab: ["bag"], location: "Gym", itemCategory: "collectable", itemClass: "solid", itemWeight: 1, itemSize: 1,
    }] };
    const taken = await runCommand(state, "take bag");
    expect(expectInventoryToContain(taken, "TestLocalBag")).toBe(true);
    expect(taken.itemState.itemRoomId.DuffelBag).toBe("SpinStage");
  });
  it("upgrades an older snapshot and preserves both puzzle progress and new container contents", async () => {
    let state = mergeWorldChunkIntoState(weights(), "level-three", LEVEL_THREE);
    expect(saveManualSnapshot(state)).toBe(true);
    const snapshot = JSON.parse(localStorage.getItem("aysf:save")!);
    delete snapshot.itemState.containerContents.DuffelBag;
    for (const id of ["DuffelBag", "YogaPants", "CropTop", "TeacherId"]) delete snapshot.itemState.itemRoomId[id];
    const savedBody = snapshot.worldItems.find((item: { id: string }) => item.id === "GymWeightRoomCrushedBody");
    savedBody.vocab.push("barbell", "weights");
    savedBody.description = "A barbell stacked with four hundred pounds has crushed his ribcage flat.";
    localStorage.setItem("aysf:save", JSON.stringify(snapshot));
    state = (await restoreManualSnapshot())!;
    expect(state.itemState.containerContents.DuffelBag).toEqual(["YogaPants", "CropTop", "TeacherId"]);
    expect(state.world.items.find(item => item.id === "GymWeightRoomCrushedBody")?.vocab).not.toContain("barbell");
    expect(getLastLogEntry(await runCommand(state, "examine barbell"))).toContain("4007 kilograms");
    state = await runCommand(applyStatusEffectToPlayer(state, "stronger", 100, 100), "lift barbell");
    expect(expectInventoryToContain(state, "yellowbadge")).toBe(true);
    state = migrateGymContentSnapshot(state);
    expect(state.worldState.conditionalTriggers.GymWeightlifterMoved).toBe(true);
    expect(state.itemState.containerContents.DuffelBag).toEqual(["YogaPants", "CropTop", "TeacherId"]);
  });
  it("preserves exact cosmetic clothing messages", async () => {
    let state = await runCommands(createTestState({ roomId: "SpinStage" }), ["open bag", "take yoga pants", "take crop top", "wear yoga pants"]);
    expect(getLastLogEntry(state)).toContain("It takes a little work, but you manage to pull the yoga pants on. They leave absolutely nothing to the imagination.");
    state = await runCommand(state, "wear crop top");
    expect(getLastLogEntry(state)).toContain("You slip on the crop top, leaving plenty of belly exposed.");
    expect(state.player.statusEffects).toEqual([]);
  });
});
