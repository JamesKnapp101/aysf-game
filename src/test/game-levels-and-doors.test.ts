import { advanceTurn } from "@game/engine/turn";
import { tickHydroponics } from "@game/engine/ticks/hydroponicsTick";
import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import { LEVEL_FIVE } from "../world/maps/levelFive/LevelFive";
import { hydroponicsItems } from "../world/maps/levelSix/Hydroponics";
import {
  buildHydroponicsTerminalMenu,
  describeHydroponicsSignIn,
  HYDROPONICS_EMPLOYEE_PROFILES,
} from "../world/maps/levelSix/hydroponicsPuzzle";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

describe("Doors and level mechanics", () => {
  it("authors the hydroponics cocoons as distinct scenery items", () => {
    const employeeIds = new Set(
      HYDROPONICS_EMPLOYEE_PROFILES.map((profile) => profile.id),
    );
    const cocoonItems = hydroponicsItems.filter((item) => employeeIds.has(item.id));

    expect(cocoonItems).toHaveLength(HYDROPONICS_EMPLOYEE_PROFILES.length);
    expect(new Set(cocoonItems.map((item) => item.name)).size).toBe(
      cocoonItems.length,
    );

    for (const item of cocoonItems) {
      expect(item.itemCategory).toBe("scenery");
      expect(item.name).not.toBe("cocooned body");

      const profile = HYDROPONICS_EMPLOYEE_PROFILES.find(
        (candidate) => candidate.id === item.id,
      );
      expect(profile).toBeDefined();
      expect(item.vocab).not.toContain(profile!.name.toLowerCase());
    }
  });

  it("uses visible employee traits in cocoon descriptions", () => {
    const sillith = hydroponicsItems.find((item) => item.id === "SillithLeSconce");
    const ernwith = hydroponicsItems.find((item) => item.id === "ErnwithGob");

    expect(sillith?.description).toContain("long, straight red hair");
    expect(sillith?.description).toContain("bionic replacement knee");
    expect(ernwith?.description).toContain("spectacles");
    expect(ernwith?.description).toContain("webbed toes");
  });

  it("keeps the sign-in tablet focused on identity and badge, not physical description", () => {
    const state = createHydroponicsPuzzleState("SillithLeSconce");

    const signInText = describeHydroponicsSignIn(state);

    expect(signInText).toContain("Sillith LeSconce, Power Department");
    expect(signInText).toContain("yellow plastic security badge");
    expect(signInText).not.toContain("thumbnail photo");
    expect(signInText).not.toContain("long, straight red hair");
    expect(signInText).not.toContain("bionic replacement knee");
  });

  it("omits the power worker from the hydroponics terminal employee list", () => {
    const state = createHydroponicsPuzzleState("SillithLeSconce");

    const menu = buildHydroponicsTerminalMenu(state);
    const recordsNode = menu.children[0];

    expect(recordsNode?.kind).toBe("menu");

    if (!recordsNode || recordsNode.kind !== "menu") {
      throw new Error("Expected employee records menu");
    }

    expect(
      recordsNode.children.some((child) => child.title === "Sillith LeSconce"),
    ).toBe(false);
    expect(recordsNode.children).toHaveLength(
      HYDROPONICS_EMPLOYEE_PROFILES.length - 1,
    );
  });

  it("sets the yellow-badge escape timer based on the current cocoon room", () => {
    const openedUnderWeb = runCommand(
      createHydroponicsEscapeState("UnderWebOne"),
      "open statuesque cocoon",
    );
    const openedBottom = runCommand(
      createHydroponicsEscapeState("HydroponicsPlatformBottom"),
      "open statuesque cocoon",
    );

    expect(expectInventoryToContain(openedUnderWeb, "yellowbadge")).toBe(true);
    expect(expectInventoryToContain(openedBottom, "yellowbadge")).toBe(true);
    expect(openedUnderWeb.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining).toBe(3);
    expect(openedBottom.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining).toBe(2);
  });

  it("lets the player escape with the yellow badge if they reach the top platform in time", () => {
    const escaped = runCommands(createHydroponicsEscapeState("UnderWebOne"), [
      "open statuesque cocoon",
      "southeast",
      "up",
      "up",
    ]);

    expect(escaped.player.roomId).toBe("HydroponicsPlatform");
    expect(expectInventoryToContain(escaped, "yellowbadge")).toBe(true);
    expect(escaped.worldState.conditionalTriggers.EscapedWithYellowBadge).toBe(true);
    expect(escaped.worldState.hydroponicsSpider.isAlive).toBe(false);
    expect(escaped.worldState.hydroponicsCocoonPuzzle.graceTurnsRemaining).toBe(0);
    expect(escaped.worldState.playerDeaths.HydroponicsPlatform).toBeUndefined();
  });

  it("adds escalating warnings during the escape and plays the finale on reaching the top platform", () => {
    const start = createHydroponicsEscapeState("UnderWebOne");

    const opened = runCommand(start, "open statuesque cocoon");
    expect(opened.log.join("\n")).toContain(
      "Somewhere overhead, taut strands of web begin snapping one by one.",
    );

    const toBottom = runCommand(opened, "southeast");
    expect(toBottom.log.join("\n")).toContain(
      "The web canopy convulses above you. Silk lashes through the air",
    );

    const toMid = runCommand(toBottom, "up");
    expect(toMid.log.join("\n")).toContain(
      "A violent series of cracks tears through the chamber.",
    );

    const toTop = runCommand(toMid, "up");
    expect(toTop.log.join("\n")).toContain(
      "Just as you reach the top platform, thick strands of silk give way with a series of loud snaps.",
    );
  });

  it("kills the player if the yellow-badge timer expires before they reach the top platform", () => {
    const doomed = runCommands(createHydroponicsEscapeState("UnderWebOne"), [
      "open statuesque cocoon",
      "southeast",
      "up",
      "north",
    ]);

    expect(doomed.player.roomId).toBe("LevelSixCorridorEnd");
    expect(doomed.worldState.conditionalTriggers.EscapedWithYellowBadge).toBe(false);
    expect(doomed.worldState.playerDeaths.HydroponicsPlatformMid?.cause).toBe(
      "hydroponics cocoon trap",
    );
  });

  it("describes the dead spider aftermath and blocks descending back into the nest after a successful escape", () => {
    const escaped = runCommands(createHydroponicsEscapeState("UnderWebOne"), [
      "open statuesque cocoon",
      "southeast",
      "up",
      "up",
    ]);

    const description = buildRoomDescription(escaped, "HydroponicsPlatform", {
      mode: "panel",
      forceFull: true,
    });
    const blocked = runCommand(escaped, "down");

    expect(description).toContain("the spider's carcass sags deep into its own torn webbing");
    expect(description).toContain("millions of hand-sized spiders");
    expect(blocked.player.roomId).toBe("HydroponicsPlatform");
    expect(getLastLogEntry(blocked)).toContain("There is no chance you're going back down there.");
  });

  it("starts the visible hydroponics spider on a new paragraph after cocoon scenery", () => {
    const baseState = createTestState({ roomId: "HydroponicsPlatformBottom" });
    const state = {
      ...baseState,
      itemState: {
        ...baseState.itemState,
        itemRoomId: {
          ...baseState.itemState.itemRoomId,
          SillithLeSconce: "HydroponicsPlatformBottom",
        },
      },
    };

    const description = buildRoomDescription(state, "HydroponicsPlatformBottom", {
      mode: "panel",
      forceFull: true,
    });
    const spiderText =
      "Above you, the web canopy bows under the weight of a massive spider suspended near the center, its silhouette shifting whenever the whole structure creaks.";
    const spiderIndex = description.indexOf(spiderText);
    const lastCocoonIndex = description.lastIndexOf("cocoon");

    expect(lastCocoonIndex).toBeGreaterThan(-1);
    expect(spiderIndex).toBeGreaterThan(lastCocoonIndex);
    expect(description).toContain(`\n\n${spiderText}`);
  });

  it("blocks the park entrance without a park pass", () => {
    const start = setInventory(createTestState({ roomId: "ParkEntrance" }), []);

    const next = runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEntrance");
    expect(getLastLogEntry(next)).toContain("park pass");
  });

  it("allows the player into the park when they have a park pass", () => {
    const start = setInventory(
      createTestState({ roomId: "ParkEntrance" }),
      ["ParkPass"],
    );

    const next = runCommand(start, "west");

    expect(next.player.roomId).toBe("ParkEast");
  });

  it("unlocks keyed doors with the correct key", () => {
    const start = setInventory(
      createTestState({ roomId: "InsideTheShed" }),
      ["ShedCellarKey"],
    );

    const opened = runCommand(start, "open hatch");
    const entered = runCommand(opened, "down");

    expect(opened.worldState.doors.ShedCellarDoor?.isOpen).toBe(true);
    expect(opened.worldState.doors.ShedCellarDoor?.isLocked).toBe(false);
    expect(entered.player.roomId).toBe("UnderTheShed");
  });

  it("requires the correct badge for badge-scanner doors", () => {
    const wrongBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["bluebadge"],
    );
    const blocked = runCommand(wrongBadgeState, "south");

    const correctBadgeState = setInventory(
      createTestState({ roomId: "LevelFourCorridorTwo" }),
      ["yellowbadge"],
    );
    const allowed = runCommand(correctBadgeState, "south");

    expect(blocked.player.roomId).toBe("LevelFourCorridorTwo");
    expect(getLastLogEntry(blocked)).toContain("badge scanner emits a flat buzz");
    expect(allowed.player.roomId).toBe("PowerGrid");
  });

  it.todo("treats the gray superadmin badge as valid for every badge scanner");

  it("records DNA samples when the player touches a body with the DNA sampler", () => {
    const start = setInventory(createTestState({ roomId: "StairSix" }), [
      "DNAReader",
    ]);

    const next = runCommand(start, "touch dead soldier with dna sampler");

    expect(next.player.dnaBank).toHaveLength(1);
    expect(next.player.dnaBank[0]?.name).toBe("Joelson Dend");
  });

  it("shows the Sanyi organisms as statues when the room is lit", () => {
    const start = setInventory(
      createTestState({ roomId: "LivingQuartersThreeWest" }),
      ["flashlight"],
    );
    const litState = {
      ...start,
      itemState: {
        ...start.itemState,
        itemSettings: {
          ...start.itemState.itemSettings,
          flashlight: { kind: "flashlight" as const, isOn: true },
        },
      },
    };

    const description = buildRoomDescription(litState, "LivingQuartersThreeWest", {
      mode: "panel",
      forceFull: true,
    });

    expect(description).toContain("large, ornate wreath");
  });

  it("lets the dark Sanyi organisms kill the player", () => {
    const start = setInventory(
      createTestState({
        roomId: "LivingQuartersThreeWest",
        visitedRooms: ["LivingQuartersThreeWest", "LevelThreeCorridorThree"],
        rng: () => 1,
      }),
      [],
    );

    const next = advanceTurn(start);

    expect(next.player.roomId).not.toBe("LivingQuartersThreeWest");
    expect(next.worldState.playerDeaths.LivingQuartersThreeWest?.cause).toBe(
      "organism",
    );
  });

  it("opens the warehouse secret door after the robot whistle is blown", () => {
    const start = setInventory(createTestState({ roomId: "L3Warehouse" }), [
      "RobotWhistle",
    ]);

    const blocked = runCommand(start, "east");
    const revealed = runCommand(start, "blow whistle");
    const entered = runCommand(revealed, "east");

    expect(blocked.player.roomId).toBe("L3Warehouse");
    expect(revealed.worldState.conditionalTriggers.RobotRefugeAccess).toBe(true);
    expect(getLastLogEntry(revealed)).toContain("hidden panel slides up");
    expect(entered.player.roomId).toBe("RobotRefuge");
  });

  it("activates the Power Grid by inserting the key, turning it, and pushing the button", () => {
    const start = setInventory(createTestState({ roomId: "PowerGrid" }), [
      "PowerStationKey",
    ]);

    const next = runCommands(start, [
      "put key in keyhole",
      "turn key",
      "push button",
    ]);

    expect(next.worldState.powerRestoredSections["power-key-turned"]).toBe(true);
    expect(next.worldState.powerRestoredSections["power-initialized"]).toBe(true);
    expect(next.worldState.roomAudioLevel.PowerGrid).toBe(3);
  });

  it("defaults every level five room to dark", () => {
    const state = createTestState();

    for (const room of LEVEL_FIVE.rooms) {
      expect(state.worldState.darkRooms[room.id]).toBe(true);
    }
  });

  it("emits the spider moan message at the correct turn in range", () => {
    const baseState = createTestState({ roomId: "LevelSixCorridorEnd" });
    const start = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        hydroponicsSpider: {
          ...baseState.worldState.hydroponicsSpider,
          turnsSinceLastBreath: 3,
        },
      },
    };

    const next = tickHydroponics(start);

    expect(getLastLogEntry(next)).toContain(
      "A loud, hollow moan begins to sound from through the gap in the damaged door.",
    );
  });

  it("lets the spider acid puzzle melt the hydroponics door open", () => {
    const start = createTestState({ roomId: "LevelSixCorridorEnd" });

    const opened = runCommands(start, [
      "look through gap",
      "look through gap",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
      "look through gap",
      "wait",
    ]);
    const entered = runCommand(opened, "south");

    expect(opened.worldState.conditionalTriggers.HydroponicsDoorUnblocked).toBe(
      true,
    );
    expect(entered.player.roomId).toBe("HydroponicsPlatform");
  });
});

function createHydroponicsEscapeState(
  roomId: "HydroponicsPlatformBottom" | "UnderWebOne",
) {
  const baseState = createTestState({
    roomId,
    visitedRooms: [
      roomId,
      "HydroponicsPlatformBottom",
      "HydroponicsPlatformMid",
      "HydroponicsPlatform",
      "LevelSixCorridorEnd",
    ],
  });

  return createHydroponicsPuzzleState("SillithLeSconce", {
    ...baseState,
    player: {
      ...baseState.player,
      roomId,
    },
  });
}

function createHydroponicsPuzzleState(
  bodyId: string,
  baseState = createTestState({ roomId: "HydroponicsPlatformBottom" }),
) {
  const bodyRoomId = baseState.player.roomId;

  return {
    ...baseState,
    itemState: {
      ...baseState.itemState,
      itemRoomId: {
        ...baseState.itemState.itemRoomId,
        [bodyId]: bodyRoomId,
      },
    },
    worldState: {
      ...baseState.worldState,
      hydroponicsCocoonPuzzle: {
        initialized: true,
        powerWorkerBodyId: bodyId,
        graceTurnsRemaining: 0,
        resolved: false,
        openedBodyIds: {},
      },
      conditionalTriggers: {
        ...baseState.worldState.conditionalTriggers,
        EscapedWithYellowBadge: false,
      },
    },
  };
}
