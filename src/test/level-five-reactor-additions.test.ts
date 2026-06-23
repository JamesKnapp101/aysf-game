import { describe, expect, it } from "vitest";
import {
  getReactorConsensusState,
  getReactorLobeCounts,
  RADIATION_SUIT_ITEM_ID,
  REACTOR_BIG_BOARD_ROOM_IDS,
} from "../world/maps/levelFive/reactorConsensus";
import {
  authenticateReactorTerminal,
  getCoolantValvePosition,
  REACTOR_CORE_FATAL_BODY_TEMPERATURE_F,
  getReactorCoreTemperatureF,
  insertReactorTerminalKey,
  REACTOR_RESTARTED_TRIGGER,
  restartReactorCore,
  turnReactorTerminalKey,
} from "../world/maps/levelFive/reactorSystems";
import {
  createTestState,
  getLastLogEntry,
  runCommand,
  setPlayerRoom,
} from "./helpers/gameTestHelpers";

async function replaceCorruptedLobe() {
  let state = createTestState({ roomId: "ReactorControlRoom" });
  state = await runCommand(state, "get lobe 13");
  state = setPlayerRoom(state, "TiltedPlatformPerch");
  state = await runCommand(state, "take intact lobe");
  state = setPlayerRoom(state, "ReactorControlRoom");
  return runCommand(state, "plug intact lobe into array");
}

describe("Level Five reactor additions", () => {
  it("introduces the Big Board when the player first reaches the Reactor Platform", async () => {
    const entered = await runCommand(
      createTestState({ roomId: "EngCorridorTwo" }),
      "west",
    );

    expect(entered.player.roomId).toBe("ReactorPlatform");
    expect(entered.log.join("\n")).toContain("REACTOR LOBE CONSENSUS");
    expect(entered.log.join("\n")).toContain("live view of that Big Board");
  });

  it("lets the player examine the Big Board anywhere it is visible", async () => {
    for (const roomId of REACTOR_BIG_BOARD_ROOM_IDS) {
      const examined = await runCommand(
        createTestState({ roomId }),
        "examine board",
      );
      const log = examined.log.join("\n");

      expect(log).toContain("REACTOR LOBE CONSENSUS");
      expect(log).toContain("lit hexagons");
      expect(log).toContain("containment");
      expect(log).not.toContain("Lobe 13 stands out");
    }
  });

  it("stores a wearable radiation suit in the Supply Platform locker", async () => {
    let state = createTestState({ roomId: "SupplyPlatform" });
    state = await runCommand(state, "open radiation locker");
    expect(getLastLogEntry(state)).toContain("radiation suit");

    state = await runCommand(state, "take radiation suit");
    state = await runCommand(state, "wear radiation suit");
    expect(state.itemState.wornByPlayer.body).toBe(RADIATION_SUIT_ITEM_ID);

    state = setPlayerRoom(state, "ReactorCore");
    state = await runCommand(state, "wait");
    expect(state.player.statusEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "radiation" })]),
    );
    expect(state.player.vitals.temperature).toBeGreaterThan(98.6);
  });

  it("uses the coolant valve to determine Reactor Core heat", async () => {
    let state = createTestState({ roomId: "HeatCoolantExchangePlatform" });
    state = await runCommand(state, "open coolant panel");

    state = await runCommand(state, "set coolant valve to -1");
    expect(getCoolantValvePosition(state)).toBe(-1);
    expect(getReactorCoreTemperatureF(state)).toBe(108);

    const hotStart = setPlayerRoom(state, "ReactorCore");
    const hot = await runCommand(hotStart, "wait");
    expect(hot.player.vitals.temperature - hotStart.player.vitals.temperature).toBeCloseTo(0.45);

    state = setPlayerRoom(state, "HeatCoolantExchangePlatform");
    state = await runCommand(state, "set coolant valve to 1");
    expect(getReactorCoreTemperatureF(state)).toBe(88);
  });

  it("warns on every Reactor Core heat increase and kills the player near 106 F", async () => {
    let state = createTestState({
      roomId: "ReactorCore",
      visitedRooms: ["ReactorCore", "ReactorControlRoom"],
    });

    state = await runCommand(state, "wait");
    expect(getLastLogEntry(state)).toContain("body temperature rises to 98.8 F");

    state = await runCommand(state, "wait");
    expect(getLastLogEntry(state)).toContain("body temperature rises to 99.0 F");

    state = {
      ...state,
      player: {
        ...state.player,
        roomId: "ReactorCore",
        vitals: {
          ...state.player.vitals,
          temperature: REACTOR_CORE_FATAL_BODY_TEMPERATURE_F - 0.1,
        },
      },
    };

    const dead = await runCommand(state, "wait");

    expect(dead.player.vitals.temperature).toBeGreaterThanOrEqual(
      REACTOR_CORE_FATAL_BODY_TEMPERATURE_F,
    );
    expect(dead.player.roomId).not.toBe("ReactorCore");
    expect(dead.worldState.playerDeaths.ReactorCore?.cause).toBe(
      "reactor core heat stroke",
    );
    expect(dead.log.join("\n")).toContain("heat stroke shuts your body down");
    expect(dead.log.join("\n")).toContain("*** You have died ***");
  });

  it("removes corrupted lobe 13, installs the rafter replacement, and stabilizes consensus", async () => {
    let state = createTestState({ roomId: "ReactorControlRoom" });
    const blocked = await runCommand(state, "down");
    expect(blocked.player.roomId).toBe("ReactorControlRoom");
    expect(blocked.log.join("\n")).toContain("REPLACE CORRUPTED MODULE 13");

    state = await runCommand(state, "examine lobe array");
    expect(state.log.join("\n")).toContain("Lobe 13");
    expect(state.log.join("\n")).toContain("red light flickers");

    state = await runCommand(state, "get lobe 13");
    expect(
      getReactorConsensusState(state).lobes.find(
        (lobe) => lobe.id === "reactor-lobe-13",
      )?.status,
    ).toBe("missing");

    state = setPlayerRoom(state, "TiltedPlatformPerch");
    state = await runCommand(state, "take intact lobe");
    state = setPlayerRoom(state, "ReactorControlRoom");
    state = await runCommand(state, "put intact lobe in array");

    expect(
      getReactorConsensusState(state).lobes.find(
        (lobe) => lobe.id === "reactor-lobe-13",
      )?.status,
    ).toBe("harmonic");
    expect(getReactorLobeCounts(getReactorConsensusState(state)).dissonant).toBe(0);

    const admitted = await runCommand(state, "down");
    expect(admitted.player.roomId).toBe("ReactorCore");

    state = admitted;
    for (let turn = 0; turn < 20; turn += 1) {
      state = await runCommand(state, "wait");
    }
    expect(getReactorConsensusState(state).isStable).toBe(true);
    expect(getReactorLobeCounts(getReactorConsensusState(state)).undecided).toBe(0);
  });

  it("requires the terminal password and Engine Room Key before restarting", async () => {
    let state = await replaceCorruptedLobe();
    state = {
      ...state,
      player: {
        ...state.player,
        inventory: {
          ...state.player.inventory,
          keys: [...state.player.inventory.keys, "EngineRoomKey"],
        },
      },
    };

    expect(authenticateReactorTerminal(state, "wrong").message).toContain(
      "ACCESS DENIED",
    );
    state = authenticateReactorTerminal(state, "3thiC4L").state;
    state = insertReactorTerminalKey(state).state;
    state = turnReactorTerminalKey(state).state;
    const restarted = restartReactorCore(state);

    expect(restarted.message).toContain("REACTOR RESTART ACCEPTED");
    expect(
      restarted.state.worldState.conditionalTriggers[
        REACTOR_RESTARTED_TRIGGER
      ],
    ).toBe(true);
  });

  it("enters and exits the two-room Virtual Office through the wired goggles", async () => {
    let state = createTestState({ roomId: "ReactorCore" });
    state = await runCommand(state, "wear virtual goggles");
    expect(state.player.roomId).toBe("LemsterVirtualOffice");
    expect(state.itemState.wornByPlayer.face).toBe("ReactorVirtualGoggles");

    state = await runCommand(state, "east");
    expect(state.player.roomId).toBe("VirtualManagerOffice");

    state = await runCommand(state, "remove virtual goggles");
    expect(state.player.roomId).toBe("ReactorCore");
    expect(state.itemState.wornByPlayer.face).toBeUndefined();
  });

  it("lets abort exit the Virtual Office from either room", async () => {
    let state = createTestState({ roomId: "ReactorCore" });
    state = await runCommand(state, "wear virtual goggles");
    state = await runCommand(state, "east");
    expect(state.player.roomId).toBe("VirtualManagerOffice");

    const movesBeforeAbort = state.moves;
    state = await runCommand(state, "abort");

    expect(state.player.roomId).toBe("ReactorCore");
    expect(state.itemState.wornByPlayer.face).toBeUndefined();
    expect(state.moves).toBe(movesBeforeAbort);
    expect(state.log.join("\n")).toContain("virtual office abort");

    state = await runCommand(state, "wear virtual goggles");
    expect(state.player.roomId).toBe("LemsterVirtualOffice");

    const abortedFromLemster = await runCommand(state, "abort");
    expect(abortedFromLemster.player.roomId).toBe("ReactorCore");
    expect(abortedFromLemster.itemState.wornByPlayer.face).toBeUndefined();
  });

  it("lets Corey explain the virtual population", async () => {
    const state = await runCommand(
      createTestState({ roomId: "ReactorCore" }),
      "ask Corey about deep storage",
    );

    expect(state.log.join("\n")).toContain("nearly nineteen billion");
    expect(state.log.join("\n")).toContain("robot bodies");
  });

  it("has the virtual manager enter Lemster's office and ignore the player there", async () => {
    let state = createTestState({ roomId: "LemsterVirtualOffice" });
    state = { ...state, moves: 3 };
    state = await runCommand(state, "wait");

    expect(state.itemState.itemRoomId.VirtualManager).toBe(
      "LemsterVirtualOffice",
    );
    expect(state.log.join("\n")).toContain("drive, drive, drive");

    state = await runCommand(state, "ask manager about workload");
    expect(state.log.join("\n")).toContain("does not acknowledge you");
  });
});
