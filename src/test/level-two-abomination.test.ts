import { advanceTurn } from "@game/engine/turn";
import {
  buildRoomItemsDescription,
  getItemDescription,
  getItemSceneryDescription,
} from "@game/helpers/descriptionHelpers";
import type { GameState } from "@game/types/gameTypes";
import {
  ABOMINATION_GROWTH_TURNS,
  ABOMINATION_ID,
} from "../world/Items/creatures/abomination";
import { describe, expect, it } from "vitest";
import {
  addInventoryItems,
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
  setPlayerRoom,
} from "./helpers/gameTestHelpers";

const LIMB_IDS = [
  "manLegOne",
  "womanLegOne",
  "womanArmOne",
  "manLegTwo",
  "womanArmTwo",
  "manArmTwo",
];

function patchAbomination(
  state: GameState,
  patch: Partial<GameState["worldState"]["abomination"]>,
  roomId = state.itemState.itemRoomId[ABOMINATION_ID],
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [ABOMINATION_ID]: roomId,
      },
    },
    worldState: {
      ...state.worldState,
      abomination: {
        ...state.worldState.abomination,
        ...patch,
      },
    },
  };
}

describe("level two abomination", () => {
  it("starts trapped and is released by the containment field button", async () => {
    const trapped = createTestState({ roomId: "Lab", rng: () => 0 });
    const afterWaiting = advanceTurn(trapped);

    expect(afterWaiting.player.vitals.health).toBe(100);
    expect(afterWaiting.itemState.itemRoomId[ABOMINATION_ID]).toBe("Lab");

    const released = await runCommand(afterWaiting, "push button");

    expect(released.worldState.abomination.containmentFieldOn).toBe(false);
    expect(released.worldState.abomination.phase).toBe("collecting");
    expect(released.player.vitals.health).toBe(98);
    expect(released.log.join("\n")).toContain("springs from the platform");
  });

  it("updates the field and button descriptions with the toggle state", async () => {
    const start = createTestState({ roomId: "Lab" });
    const field = start.world.items.find((item) => item.id === "containmentField")!;
    const button = start.world.items.find(
      (item) => item.id === "containmentFieldButton",
    )!;

    expect(
      getItemSceneryDescription(start, field, {
        kind: "scenery",
        roomId: "Lab",
      }),
    ).toContain("globe of crackling energy");
    expect(
      getItemDescription(start, button, {
        kind: "examine",
        roomId: "Lab",
      }),
    ).toContain("glows steadily");

    const toggled = await runCommand(start, "push button");

    expect(
      getItemSceneryDescription(toggled, field, {
        kind: "scenery",
        roomId: "Lab",
      }),
    ).toContain("emitters are dark");
    expect(
      getItemDescription(toggled, button, {
        kind: "examine",
        roomId: "Lab",
      }),
    ).toContain("currently dark");
  });

  it("uses custom NPC prose when listing the abomination in a room", () => {
    const state = patchAbomination(
      createTestState({ roomId: "Lab" }),
      {
        attachedLimbIds: LIMB_IDS.slice(0, 3),
        containmentFieldOn: false,
        phase: "collecting",
      },
      "Lab",
    );
    const abomination = state.world.items.find(
      (item) => item.id === ABOMINATION_ID,
    )!;

    const description = buildRoomItemsDescription(state, "Lab");
    const examineDescription = getItemDescription(state, abomination, {
      kind: "examine",
      roomId: "Lab",
    });

    expect(description).toContain(
      "Lurking in the corner is a shambling humanoid figure",
    );
    expect(description).toContain("three stolen limbs twitch from its body");
    expect(description).not.toContain("3 stolen limbs twitch from its body");
    expect(description).not.toContain("There is horrid abomination here.");
    expect(examineDescription).toContain("three crudely grafted limbs work");
    expect(examineDescription).not.toContain("3 crudely grafted limbs work");
  });

  it("grafts one available limb per tick and tracks it as attached", () => {
    const start = patchAbomination(
      createTestState({ roomId: "MainMedical", rng: () => 0 }),
      { containmentFieldOn: false, phase: "collecting" },
      "LevelTwoBurnedQuartersThree",
    );

    const next = advanceTurn(start);
    const attachedId = next.worldState.abomination.attachedLimbIds[0];

    expect(next.worldState.abomination.attachedLimbIds).toHaveLength(1);
    expect(["manLegOne", "womanLegOne", "womanArmOne"]).toContain(attachedId);
    expect(next.itemState.attachedTo[attachedId]).toBe(ABOMINATION_ID);
    expect(next.itemState.itemRoomId[ABOMINATION_ID]).toBe(
      "LevelTwoBurnedQuartersThree",
    );
  });

  it("uses a more aggressive message when stealing a carried limb", () => {
    const start = addInventoryItems(
      patchAbomination(
        createTestState({ roomId: "LevelTwoBurnedQuartersTwo", rng: () => 0 }),
        { containmentFieldOn: false, phase: "collecting" },
        "LevelTwoBurnedQuartersTwo",
      ),
      ["manArmTwo"],
    );

    const next = advanceTurn(start);
    const transcript = next.log.join("\n");

    expect(expectInventoryToContain(next, "manArmTwo")).toBe(false);
    expect(next.worldState.abomination.attachedLimbIds).toContain("manArmTwo");
    expect(next.itemState.attachedTo.manArmTwo).toBe(ABOMINATION_ID);
    expect(transcript).toContain("The abomination rushes you");
    expect(transcript).toContain("pawing through your inventory");
    expect(transcript).toContain("plucking out the tattooed male arm");
    expect(transcript).toContain("It attaches the limb");
    expect(transcript).not.toContain("snatches up the tattooed male arm");
  });

  it("gives a directional audio cue after leaving the player's room", () => {
    const start = patchAbomination(
      createTestState({ roomId: "LevelTwoBurnedQuartersTwo", rng: () => 0 }),
      {
        attachedLimbIds: LIMB_IDS,
        containmentFieldOn: false,
        phase: "collecting",
      },
      "LevelTwoBurnedQuartersTwo",
    );

    const next = advanceTurn(start);
    const transcript = next.log.join("\n");

    expect(next.itemState.itemRoomId[ABOMINATION_ID]).not.toBe(
      "LevelTwoBurnedQuartersTwo",
    );
    expect(transcript).toMatch(
      /You hear the abomination crashing around off to the (east|north)\./,
    );
  });

  it("breaks the storage door, enters the vats, and completes its growth countdown", async () => {
    const start = patchAbomination(
      createTestState({ roomId: "MainMedical", rng: () => 0 }),
      {
        attachedLimbIds: LIMB_IDS,
        containmentFieldOn: false,
        phase: "collecting",
      },
      "MedicalCorridorThree",
    );

    const throughDoor = advanceTurn(start);

    expect(throughDoor.itemState.itemRoomId[ABOMINATION_ID]).toBe(
      "MedicalStorage",
    );
    expect(throughDoor.worldState.doors.MedStorageDoor).toMatchObject({
      isLocked: false,
      isOpen: true,
    });
    expect(throughDoor.worldState.abomination.storageDoorBroken).toBe(true);

    const closeAttempt = await runCommand(
      setPlayerRoom(throughDoor, "MedicalCorridorThree"),
      "close storage door",
    );
    expect(closeAttempt.worldState.doors.MedStorageDoor.isOpen).toBe(true);
    expect(getLastLogEntry(closeAttempt)).toContain(
      "no longer enough door left",
    );

    const inVat = advanceTurn(throughDoor);

    expect(inVat.itemState.itemRoomId[ABOMINATION_ID]).toBe("TissueVats");
    expect(inVat.worldState.abomination.phase).toBe("growing");
    expect(inVat.worldState.abomination.growthTurnsRemaining).toBe(
      ABOMINATION_GROWTH_TURNS,
    );

    const nearlyFinished = patchAbomination(inVat, {
      growthTurnsRemaining: 1,
    });
    const empowered = advanceTurn(nearlyFinished);

    expect(empowered.worldState.abomination.phase).toBe("empowered");
    expect(empowered.worldState.abomination.growthTurnsRemaining).toBe(0);
  });

  it("uses the 50 percent passing attack and empowered damage range", () => {
    const base = patchAbomination(
      createTestState({ roomId: "Lab", rng: () => 0 }),
      {
        attachedLimbIds: LIMB_IDS,
        containmentFieldOn: false,
        phase: "empowered",
      },
      "Lab",
    );
    const crossing: GameState = {
      ...base,
      player: {
        ...base.player,
        prevRoomId: "MedicalCorridorOne",
        recentMoves: [
          {
            atTurn: base.moves,
            fromRoomId: "MedicalCorridorOne",
            toRoomId: "Lab",
          },
        ],
      },
    };

    const next = advanceTurn(crossing);

    expect(next.itemState.itemRoomId[ABOMINATION_ID]).toBe(
      "MedicalCorridorOne",
    );
    expect(next.player.vitals.health).toBe(90);
    expect(getLastLogEntry(next)).toContain("stray claw");
  });

  it("can complete the whole limb-and-vat script and then resumes wandering", () => {
    let state = patchAbomination(
      createTestState({ roomId: "StairWellSeven", rng: () => 0 }),
      { containmentFieldOn: false, phase: "collecting" },
      "Lab",
    );

    for (let turn = 0; turn < 100; turn += 1) {
      state = advanceTurn(state);
    }

    expect(state.worldState.abomination.attachedLimbIds).toHaveLength(6);
    expect(state.worldState.abomination.phase).toBe("empowered");
    expect(state.itemState.itemRoomId[ABOMINATION_ID]).not.toBe(
      "LevelTwoStairAccess",
    );

    const roomBeforeWandering = state.itemState.itemRoomId[ABOMINATION_ID];
    const afterAnotherTurn = advanceTurn(state);

    expect(afterAnotherTurn.worldState.abomination.phase).toBe("empowered");
    expect(afterAnotherTurn.itemState.itemRoomId[ABOMINATION_ID]).not.toBe(
      roomBeforeWandering,
    );
  });
});
