import { ACTION_HANDLERS } from "@game/actions";
import { useUIOverlayStore } from "@game/store/store";
import { describe, expect, it } from "vitest";
import { getItemsInRoom } from "../game/selectors/roomSelectors";
import {
  createTestState,
  expectInventoryToContain,
  patchRoomDarkness,
  runCommand,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";

const COVERED_ACTIONS = [
  "open",
  "close",
  "take",
  "drop",
  "put",
  "read",
  "examine",
  "inject",
  "drink",
  "eat",
  "set",
  "empty",
  "fill",
  "pour",
  "wear",
  "remove",
  "switch",
  "wait",
  "shoot",
  "load",
  "search",
  "stand",
  "turn",
  "push",
  "ask",
  "tell",
  "listen",
  "look",
  "use",
  "ride",
  "touch",
  "blow",
] as const satisfies ReadonlyArray<keyof typeof ACTION_HANDLERS>;

function getCommandEntry(state: { log: string[] }, command: string): string {
  for (let index = state.log.length - 1; index >= 0; index -= 1) {
    const entry = state.log[index];
    if (entry.includes(`> ${command}`)) {
      return entry;
    }
  }

  return "";
}

function expectCommandEntry(
  state: { log: string[] },
  command: string,
  expected: string | RegExp,
) {
  const entry = getCommandEntry(state, command);

  expect(entry).toContain(`> ${command}`);

  if (typeof expected === "string") {
    expect(entry).toContain(expected);
  } else {
    expect(entry).toMatch(expected);
  }
}

describe("Action smoke coverage", () => {
  it("keeps smoke coverage aligned with registered action verbs", () => {
    expect([...COVERED_ACTIONS].sort()).toEqual(
      Object.keys(ACTION_HANDLERS).sort(),
    );
  });

  it("covers open", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "InsideTheShed" }), [
        "ShedCellarKey",
      ]),
      "open hatch",
    );

    expect(next.worldState.doors.ShedCellarDoor?.isOpen).toBe(true);
  });

  it("covers close", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "InsideTheShed" }), [
        "ShedCellarKey",
      ]),
      ["open hatch", "close hatch"],
    );

    expect(next.worldState.doors.ShedCellarDoor?.isOpen).toBe(false);
  });

  it("covers take", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      "take research notes",
    );

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(true);
  });

  it("covers drop", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      ["take research notes", "drop research notes"],
    );

    expect(expectInventoryToContain(next, "ResearchNotes")).toBe(false);
    expect(getItemsInRoom(next, "ThreeWestBed").map((item) => item.id)).toContain(
      "ResearchNotes",
    );
  });

  it("covers put", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "PowerGrid" }), [
        "PowerStationKey",
      ]),
      "put key in keyhole",
    );

    expect(next.itemState.containerContents.PowerStationKeyhole).toContain(
      "PowerStationKey",
    );
  });

  it("covers read", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      ["take research notes", "read research notes"],
    );

    expect(next.player.log[0]?.title).toContain("Research Notes");
  });

  it("covers examine", () => {
    const next = runCommand(
      patchRoomDarkness(
        createTestState({ roomId: "ThreeWestBath" }),
        "ThreeWestBath",
        false,
      ),
      "examine mirror",
    );

    expect(next.player.memoriesTriggered.own_image).toBe(true);
  });

  it("covers inject", () => {
    const next = runCommands(
      setInventory(createTestState(), ["Syringe", "GroovyCart"]),
      ["put green serum cartridge in syringe", "inject me"],
    );

    expect(next.player.statusEffects.map((effect) => effect.id)).toContain(
      "trixophine",
    );
    expect(next.itemState.syringe.loadedCartridgeId).toBeUndefined();
  });

  it("covers drink", () => {
    const next = runCommand(
      setInventory(createTestState(), ["FiveWestScotch"]),
      "drink scotch",
    );

    expect(next.player.statusEffects.map((effect) => effect.id)).toContain(
      "drunk",
    );
    expect(next.world.items.find((item) => item.id === "FiveWestScotch")?.doses).toBe(
      16,
    );
  });

  it("covers eat", () => {
    const next = runCommand(
      setInventory(createTestState(), ["hornychew"]),
      "eat chewable",
    );

    expect(next.player.statusEffects.map((effect) => effect.id)).toContain(
      "superhorny",
    );
    expect(next.world.items.find((item) => item.id === "hornychew")?.doses).toBe(0);
  });

  it("covers set", () => {
    const next = runCommand(
      setInventory(createTestState(), ["Cooler"]),
      "set cooler",
    );

    expect(useUIOverlayStore.getState().overlay.kind).toBe("cooler");
    expectCommandEntry(next, "set cooler", /^> set cooler/m);
  });

  it("covers empty", () => {
    const start = setInventory(createTestState(), ["FISHBOWL"]);
    const next = runCommand(
      {
        ...start,
        itemState: {
          ...start.itemState,
          containerFilled: {
            ...start.itemState.containerFilled,
            FISHBOWL: ["water"],
          },
        },
      },
      "empty fish bowl",
    );

    expect(next.itemState.containerFilled.FISHBOWL).toBeUndefined();
    expectCommandEntry(next, "empty fish bowl", "You empty the fish bowl");
  });

  it("covers fill", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "ThreeEastBath" }), ["FISHBOWL"]),
      "fill fish bowl with water",
    );

    expect(next.itemState.containerFilled.FISHBOWL).toEqual(["water"]);
  });

  it("covers pour", () => {
    const start = setInventory(createTestState(), ["FISHBOWL", "URN"]);
    const next = runCommand(
      {
        ...start,
        itemState: {
          ...start.itemState,
          containerFilled: {
            ...start.itemState.containerFilled,
            FISHBOWL: ["water"],
          },
        },
      },
      "pour water into urn",
    );

    expect(next.itemState.containerFilled.FISHBOWL).toBeUndefined();
    expect(next.itemState.containerFilled.URN).toEqual(["water"]);
  });

  it("covers wear", () => {
    const next = runCommand(
      setInventory(createTestState(), ["NVGoggles"]),
      "wear goggles",
    );

    expect(next.itemState.wornByPlayer.face).toBe("NVGoggles");
  });

  it("covers remove", () => {
    const next = runCommands(
      setInventory(createTestState(), ["NVGoggles"]),
      ["wear goggles", "remove goggles"],
    );

    expect(next.itemState.wornByPlayer.face).toBeUndefined();
  });

  it("covers switch", () => {
    const next = runCommand(
      setInventory(createTestState(), ["NVGoggles"]),
      "switch goggles",
    );

    expect(next.itemState.itemSettings.NVGoggles).toMatchObject({ isOn: true });
  });

  it("covers wait", () => {
    const next = runCommand(
      createTestState({ roomId: "PowerGrid" }),
      "wait",
    );

    expectCommandEntry(next, "wait", "You wait for a bit.");
  });

  it("covers shoot", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "LivingQuartersThreeEast" }), [
        "CameraGun",
        "GelRound1",
      ]),
      ["load gas gun with soft projectile round", "shoot cooler with gas gun"],
    );

    expect(next.itemState.attachedTo.GelRound1).toBe("Cooler");
    expect(next.itemState.containerContents.CameraGun).toEqual([]);
  });

  it("covers load", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "LivingQuartersThreeEast" }), [
        "CameraGun",
        "GelRound1",
      ]),
      "load gas gun with soft projectile round",
    );

    expect(next.itemState.containerContents.CameraGun).toContain("GelRound1");
    expect(expectInventoryToContain(next, "GelRound1")).toBe(false);
  });

  it("covers search", () => {
    const next = runCommand(
      createTestState({ roomId: "StairWellSeven" }),
      "search corpse",
    );

    expect(expectInventoryToContain(next, "MysteriousNote")).toBe(true);
    expect(next.itemState.searchableContents.FallenCorpse).toEqual([]);
  });

  it("covers stand", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "TPADTerminal" }), ["greenbadge"]),
      "stand on green disk",
    );

    expect(next.player.roomId).toBe("ParkCenter");
  });

  it("covers turn", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "PowerGrid" }), [
        "PowerStationKey",
      ]),
      ["put key in keyhole", "turn key"],
    );

    expect(next.worldState.powerRestoredSections["power-key-turned"]).toBe(true);
  });

  it("covers push", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "StairSix" }), ["Radio"]),
      "push radio",
    );

    expect(next.radio?.activeNpcId).toBe("kevin_1st_contact");
  });

  it("covers ask", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "StairSix" }), ["Radio"]),
      ["push radio", "ask kevin about power"],
    );

    expect(next.conversation?.npcs?.kevin_1st_contact?.topicsUsed?.power).toBe(
      true,
    );
    expectCommandEntry(next, "ask kevin about power", /reset key/i);
  });

  it("covers tell", () => {
    const next = runCommands(
      setInventory(createTestState({ roomId: "StairSix" }), ["Radio"]),
      ["push radio", "tell kevin about bug"],
    );

    expect(
      next.conversation?.npcs?.kevin_1st_contact?.topicsUsed?.["tell:bug"],
    ).toBe(true);
    expectCommandEntry(next, "tell kevin about bug", /found one when i woke up/i);
  });

  it("covers listen", () => {
    const baseState = createTestState({ roomId: "LevelSixCorridorEnd" });
    const next = runCommand(
      {
        ...baseState,
        worldState: {
          ...baseState.worldState,
          hydroponicsSpider: {
            ...baseState.worldState.hydroponicsSpider,
            turnsSinceLastBreath: 3,
          },
        },
      },
      "listen to moan",
    );

    expectCommandEntry(next, "listen to moan", /haunting, eerie quality/i);
  });

  it("covers look", () => {
    const next = runCommand(
      createTestState({ roomId: "LevelSixCorridorEnd" }),
      "look through gap",
    );

    expectCommandEntry(next, "look through gap", /Through the narrow gap/i);
  });

  it("covers use", () => {
    const next = runCommand(
      setInventory(createTestState(), ["TrixPen"]),
      "use vape pen",
    );

    expect(next.player.statusEffects.map((effect) => effect.id)).toContain(
      "trixophine",
    );
    expect(next.world.items.find((item) => item.id === "TrixPen")?.doses).toBe(99);
  });

  it("covers ride", () => {
    const next = runCommand(
      createTestState({ roomId: "RobotRefuge" }),
      "ride conveyor belt",
    );

    expect(next.player.roomId).toBe("Storage");
  });

  it("covers touch", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "StairSix" }), ["DNAReader"]),
      "touch dead soldier with dna sampler",
    );

    expect(next.player.dnaBank[0]?.name).toBe("Joelson Dend");
  });

  it("covers blow", () => {
    const next = runCommand(
      setInventory(createTestState({ roomId: "L3Warehouse" }), [
        "RobotWhistle",
      ]),
      "blow whistle",
    );

    expect(next.worldState.conditionalTriggers.RobotRefugeAccess).toBe(true);
  });
});
