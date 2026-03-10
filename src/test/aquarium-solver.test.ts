import { describe, expect, it } from "vitest";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";
import {
  AQUARIUM_BREATHER_CORPSE_ITEM_ID,
  AQUARIUM_BREATHER_ITEM_ID,
  AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID,
  AQUARIUM_ELECTRIC_PROD_ITEM_ID,
  AQUARIUM_GOAL_ITEM_ID,
  createInitialOctopusState,
} from "src/world/Items/creatures/octopus";

type SolverNode = {
  state: GameState;
  path: string[];
};

type SolverOptions = {
  maxDepth?: number;
  allowBreather?: boolean;
  allowProd?: boolean;
  requireBreatherInWin?: boolean;
  requireProdInWin?: boolean;
};

function inventoryHas(state: GameState, itemId: string): boolean {
  return (
    state.player.inventory.general.includes(itemId) ||
    state.player.inventory.badges.includes(itemId) ||
    state.player.inventory.keys.includes(itemId)
  );
}

function getProdCharges(state: GameState): number {
  return (
    state.world.items.find((item) => item.id === AQUARIUM_ELECTRIC_PROD_ITEM_ID)
      ?.doses ?? 0
  );
}

function getCurrentRoomItem(state: GameState, itemId: string): Item | undefined {
  return state.world.items.find(
    (item) =>
      item.id === itemId &&
      (state.itemState.itemRoomId[item.id] ?? item.location) === state.player.roomId,
  );
}

function hasAdjacentTentacle(state: GameState): boolean {
  const room = state.world.rooms.find(
    (candidate) => candidate.id === state.player.roomId,
  );
  if (!room) return false;

  const occupied = new Set(state.worldState.octopusState.occupiedRoomIds);

  return room.exits.some((exit) => {
    const toRoomId = exit.toRoomId;
    return Boolean(toRoomId && occupied.has(toRoomId));
  });
}

function isWinningState(state: GameState): boolean {
  return (
    state.player.roomId === "VeterinaryCenter" &&
    inventoryHas(state, AQUARIUM_GOAL_ITEM_ID)
  );
}

function didDie(state: GameState): boolean {
  return Object.keys(state.worldState.playerDeaths ?? {}).length > 0;
}

function getCandidateCommands(
  state: GameState,
  options: SolverOptions,
): string[] {
  const commands: string[] = [];
  const room = state.world.rooms.find(
    (candidate) => candidate.id === state.player.roomId,
  );
  if (!room) return commands;

  if (
    options.allowBreather !== false &&
    inventoryHas(state, AQUARIUM_BREATHER_ITEM_ID) &&
    state.itemState.wornByPlayer.face !== AQUARIUM_BREATHER_ITEM_ID
  ) {
    commands.push("wear breather");
  }

  if (
    options.allowBreather !== false &&
    state.player.roomId === "AqRock2" &&
    (state.itemState.searchableContents[AQUARIUM_BREATHER_CORPSE_ITEM_ID]?.length ?? 0) > 0
  ) {
    commands.push("search dead diver");
  }

  if (
    options.allowProd !== false &&
    state.player.roomId === "AqChannel4b" &&
    (state.itemState.searchableContents[AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID]?.length ?? 0) > 0
  ) {
    commands.push("search dead technician");
  }

  if (
    state.player.roomId === "AqGoal" &&
    !inventoryHas(state, AQUARIUM_GOAL_ITEM_ID) &&
    getCurrentRoomItem(state, AQUARIUM_GOAL_ITEM_ID)
  ) {
    commands.push("take control node");
  }

  if (
    options.allowProd !== false &&
    inventoryHas(state, AQUARIUM_ELECTRIC_PROD_ITEM_ID) &&
    getProdCharges(state) > 0 &&
    hasAdjacentTentacle(state)
  ) {
    commands.push("use prod on tentacle");
  }

  if (
    state.player.roomId === "VeterinaryCenter" &&
    !inventoryHas(state, AQUARIUM_GOAL_ITEM_ID)
  ) {
    commands.push("stand on aqua disk");
  }

  if (
    state.player.roomId === "AqStart" &&
    inventoryHas(state, AQUARIUM_GOAL_ITEM_ID)
  ) {
    commands.push("stand on aqua disk");
  }

  for (const exit of room.exits) {
    commands.push(exit.direction);
  }

  return commands;
}

function getStateSignature(state: GameState): string {
  const armSignature = [...state.worldState.octopusState.arms]
    .map((arm) => `${arm.stunnedTurns}:${arm.path.join(">")}`)
    .sort()
    .join("|");

  return JSON.stringify({
    roomId: state.player.roomId,
    health: state.player.vitals.health,
    oxygen: state.player.vitals.oxygen,
    breather: inventoryHas(state, AQUARIUM_BREATHER_ITEM_ID),
    breatherWorn: state.itemState.wornByPlayer.face === AQUARIUM_BREATHER_ITEM_ID,
    prod: inventoryHas(state, AQUARIUM_ELECTRIC_PROD_ITEM_ID),
    prodCharges: getProdCharges(state),
    controlNode: inventoryHas(state, AQUARIUM_GOAL_ITEM_ID),
    searchedBreather:
      (state.itemState.searchableContents[AQUARIUM_BREATHER_CORPSE_ITEM_ID]?.length ?? 0) ===
      0,
    searchedProd:
      (state.itemState.searchableContents[AQUARIUM_ELECTRIC_PROD_CORPSE_ITEM_ID]?.length ?? 0) ===
      0,
    octoAware: state.worldState.octopusState.isAware,
    returnChokeActive: state.worldState.octopusState.returnChokeActive === true,
    arms: armSignature,
  });
}

function findWinningAquariumRoute(options: SolverOptions = {}) {
  const maxDepth = options.maxDepth ?? 40;
  const start = createTestState({
    roomId: "VeterinaryCenter",
    visitedRooms: ["VeterinaryCenter", "AqStart"],
  });
  const queue: SolverNode[] = [{ state: start, path: [] }];
  const seen = new Set<string>([getStateSignature(start)]);
  let exploredStates = 0;
  let reachedBreather = false;
  let reachedProd = false;
  let reachedGoal = false;
  let escapedWithNode = false;

  while (queue.length > 0) {
    const node = queue.shift()!;
    exploredStates += 1;

    reachedBreather ||= inventoryHas(node.state, AQUARIUM_BREATHER_ITEM_ID);
    reachedProd ||= inventoryHas(node.state, AQUARIUM_ELECTRIC_PROD_ITEM_ID);
    reachedGoal ||= inventoryHas(node.state, AQUARIUM_GOAL_ITEM_ID);
    escapedWithNode ||=
      node.state.player.roomId === "AqStart" &&
      inventoryHas(node.state, AQUARIUM_GOAL_ITEM_ID);

    if (
      isWinningState(node.state) &&
      (options.requireBreatherInWin !== true ||
        inventoryHas(node.state, AQUARIUM_BREATHER_ITEM_ID)) &&
      (options.requireProdInWin !== true ||
        inventoryHas(node.state, AQUARIUM_ELECTRIC_PROD_ITEM_ID))
    ) {
      return {
        path: node.path,
        exploredStates,
        reachedBreather,
        reachedProd,
        reachedGoal,
        escapedWithNode,
      };
    }

    if (node.path.length >= maxDepth) continue;

    for (const command of getCandidateCommands(node.state, options)) {
      const nextState = runCommand(node.state, command);
      if (didDie(nextState)) continue;

      const signature = getStateSignature(nextState);
      if (seen.has(signature)) continue;
      seen.add(signature);
      queue.push({
        state: nextState,
        path: [...node.path, command],
      });
    }
  }

  return {
    path: null as string[] | null,
    exploredStates,
    reachedBreather,
    reachedProd,
    reachedGoal,
    escapedWithNode,
  };
}

describe("Aquarium solver", () => {
  it("finds a winning route through the aquarium puzzle", () => {
    const result = findWinningAquariumRoute({
      requireBreatherInWin: true,
      requireProdInWin: true,
    });

    expect(result.path).not.toBeNull();
    expect(result.path).toContain("search dead diver");
    expect(result.path).toContain("wear breather");
    expect(result.path).toContain("search dead technician");
    expect(result.path).toContain("use prod on tentacle");
    expect(result.reachedGoal).toBe(true);
    expect(result.escapedWithNode).toBe(true);
  });

  it("does not have a winning route if the player refuses to get the breather", () => {
    const result = findWinningAquariumRoute({
      allowBreather: false,
    });

    expect(result.path).toBeNull();
  });

  it("does not have a winning route if the player refuses to get the prod", () => {
    const result = findWinningAquariumRoute({
      allowProd: false,
    });

    expect(result.path).toBeNull();
  });

  it("warns when a tentacle tip moves into the player's room on the same turn", () => {
    const baseState = createTestState({
      roomId: "AqRock3",
      visitedRooms: ["AqRock3", "AqStart"],
    });
    const baseOcto = createInitialOctopusState();
    const start = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        octopusState: {
          ...baseOcto,
          isAware: true,
          moveEveryTurns: 1,
          turnsUntilMove: 0,
          arms: baseOcto.arms.map((arm, index) =>
            index === 0
              ? { ...arm, path: ["AqRock7", "AqRock6", "AqRock5", "AqRock4", "AqCross"] }
              : arm,
          ),
        },
      },
    };

    const next = runCommand(start, "wait");
    const fullLog = next.log.join("\n");

    expect(fullLog).toContain("lashes in from the north");
    expect(fullLog).toContain("*** You have died ***");
  });
});
