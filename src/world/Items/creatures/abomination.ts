import { appendLog } from "@game/engine/log";
import {
  getExitDestinationRoomId,
  getRoomExits,
  moveItemToRoom,
} from "@game/helpers/itemHelpers";
import { applyPlayerDamage } from "@game/rules/damage";
import { inventoryHas, removeFromAllBuckets } from "@game/rules/state";
import type { TickContext } from "@game/types/context";
import type { AbominationState, GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { Direction } from "@game/types/roomTypes";

export const ABOMINATION_ID = "abomination";
export const MED_STORAGE_DOOR_ID = "MedStorageDoor";
export const ABOMINATION_GROWTH_TURNS = 20;

const MEDICAL_STORAGE_ROOM_ID = "MedicalStorage";
const TISSUE_VATS_ROOM_ID = "TissueVats";
const FORBIDDEN_ROOM_IDS = new Set(["LevelTwoStairAccess"]);
const LIMB_COUNT_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
] as const;

export function createInitialAbominationState(): AbominationState {
  return {
    attachedLimbIds: [],
    containmentFieldOn: true,
    growthTurnsRemaining: 0,
    phase: "trapped",
    storageDoorBroken: false,
  };
}

function getAbominationState(state: GameState): AbominationState {
  return state.worldState.abomination ?? createInitialAbominationState();
}

function setAbominationState(
  state: GameState,
  abomination: AbominationState,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      abomination,
    },
  };
}

function randomIndex(rng: () => number, length: number): number {
  return Math.min(length - 1, Math.floor(rng() * length));
}

function rollDamage(rng: () => number, min: number, max: number): number {
  return min + randomIndex(rng, max - min + 1);
}

function formatLimbCount(count: number): string {
  return LIMB_COUNT_WORDS[count] ?? String(count);
}

function isAbominationLimb(item: Item): boolean {
  return item.meta?.abominationLimb === true;
}

function getLimbRoomId(state: GameState, limbId: string): string | undefined {
  if (inventoryHas(state.player.inventory, limbId)) {
    return state.player.roomId;
  }
  return state.itemState.itemRoomId[limbId];
}

function getAvailableLimbs(state: GameState): Item[] {
  const attached = new Set(getAbominationState(state).attachedLimbIds);
  return state.world.items.filter(
    (item) => isAbominationLimb(item) && !attached.has(item.id),
  );
}

function attachLimb(state: GameState, limb: Item, roomId: string): GameState {
  const abomination = getAbominationState(state);
  const wasCarried = inventoryHas(state.player.inventory, limb.id);
  let next: GameState = {
    ...state,
    player: wasCarried
      ? {
          ...state.player,
          inventory: removeFromAllBuckets(state.player.inventory, limb.id),
        }
      : state.player,
    itemState: {
      ...state.itemState,
      attachedTo: {
        ...state.itemState.attachedTo,
        [limb.id]: ABOMINATION_ID,
      },
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [limb.id]: roomId,
      },
    },
  };

  next = setAbominationState(next, {
    ...abomination,
    attachedLimbIds: [...abomination.attachedLimbIds, limb.id],
  });

  if (state.player.roomId === roomId) {
    const message = wasCarried
      ? `The abomination rushes you, several hands pawing through your inventory and plucking out the ${limb.name}. It attaches the limb to itself, pressing the ragged end into its own flesh. Tendrils stitch it into place; a moment later the dead limb flexes and begins to move.`
      : `The abomination snatches up the ${limb.name} and presses the ragged end into its own flesh. Tendrils stitch it into place; a moment later the dead limb flexes and begins to move.`;

    next = appendLog(
      next,
      message,
    );
  }

  return next;
}

function getReachableLevelTwoRoomIds(state: GameState): Set<string> {
  const reachable = new Set<string>(["Lab"]);
  const queue = ["Lab"];

  while (queue.length > 0) {
    const roomId = queue.shift()!;
    for (const exit of getRoomExits(state, roomId)) {
      const destination = getExitDestinationRoomId(state, roomId, exit);
      if (!destination || FORBIDDEN_ROOM_IDS.has(destination)) continue;
      if (reachable.has(destination)) continue;
      reachable.add(destination);
      queue.push(destination);
    }
  }

  return reachable;
}

function getNeighborRooms(
  state: GameState,
  roomId: string,
  allowedRooms: Set<string>,
  canEnterStorage: boolean,
): string[] {
  return getRoomExits(state, roomId)
    .map((exit) => getExitDestinationRoomId(state, roomId, exit))
    .filter((destination): destination is string => Boolean(destination))
    .filter((destination) => allowedRooms.has(destination))
    .filter(
      (destination) =>
        canEnterStorage ||
        (destination !== MEDICAL_STORAGE_ROOM_ID &&
          destination !== TISSUE_VATS_ROOM_ID),
    );
}

function findFirstStepToward(
  state: GameState,
  fromRoomId: string,
  targets: Set<string>,
  allowedRooms: Set<string>,
  canEnterStorage: boolean,
  rng: () => number,
): string | undefined {
  const visited = new Set([fromRoomId]);
  const queue: Array<{ firstStep?: string; roomId: string }> = [
    { roomId: fromRoomId },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.firstStep && targets.has(current.roomId)) {
      return current.firstStep;
    }

    const neighbors = getNeighborRooms(
      state,
      current.roomId,
      allowedRooms,
      canEnterStorage,
    );

    for (let index = neighbors.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(rng, index + 1);
      [neighbors[index], neighbors[swapIndex]] = [
        neighbors[swapIndex],
        neighbors[index],
      ];
    }

    for (const destination of neighbors) {
      if (visited.has(destination)) continue;
      visited.add(destination);
      queue.push({
        roomId: destination,
        firstStep: current.firstStep ?? destination,
      });
    }
  }

  return undefined;
}

function getDoorIdBetween(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): string | undefined {
  return getRoomExits(state, fromRoomId).find(
    (exit) => getExitDestinationRoomId(state, fromRoomId, exit) === toRoomId,
  )?.doorId;
}

function getDirectionBetweenRooms(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): Direction | undefined {
  return getRoomExits(state, fromRoomId).find(
    (exit) =>
      getExitDestinationRoomId(state, fromRoomId, exit) === toRoomId,
  )?.direction;
}

function formatAbominationAudioLocale(direction: Direction): string {
  if (direction === "down") return "down below";
  if (direction === "up") return "up above";
  if (direction === "in") return "inside";
  if (direction === "out") return "outside";
  return `off to the ${direction}`;
}

function openDoorForAbomination(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): GameState {
  const doorId = getDoorIdBetween(state, fromRoomId, toRoomId);
  if (!doorId) return state;

  const doorState = state.worldState.doors[doorId];
  if (!doorState || (doorState.isOpen && !doorState.isLocked)) return state;

  let next: GameState = {
    ...state,
    worldState: {
      ...state.worldState,
      doors: {
        ...state.worldState.doors,
        [doorId]: {
          ...doorState,
          isLocked: false,
          isOpen: true,
        },
      },
    },
  };

  if (doorId === MED_STORAGE_DOOR_ID) {
    next = setAbominationState(next, {
      ...getAbominationState(next),
      storageDoorBroken: true,
    });
    if (
      state.player.roomId === fromRoomId ||
      state.player.roomId === toRoomId
    ) {
      next = appendLog(
        next,
        "The abomination hurls its accumulated mass against the medical storage door. Wood and hardware explode inward, and the creature shoulders through the ruined opening.",
      );
    }
  }

  return next;
}

function moveAbomination(
  state: GameState,
  fromRoomId: string,
  toRoomId: string,
): GameState {
  const opened = openDoorForAbomination(state, fromRoomId, toRoomId);
  return moveItemToRoom(opened, ABOMINATION_ID, toRoomId);
}

function appendNearbyAbominationAudioCue(
  state: GameState,
  abominationRoomId: string,
): GameState {
  const playerRoomId = state.player.roomId;
  if (playerRoomId === abominationRoomId) return state;

  const direction = getDirectionBetweenRooms(
    state,
    playerRoomId,
    abominationRoomId,
  );
  if (!direction) return state;

  return appendLog(
    state,
    `You hear the abomination crashing around ${formatAbominationAudioLocale(
      direction,
    )}.`,
  );
}

function applyRampageDamage(
  state: GameState,
  rng: () => number,
  empowered: boolean,
  passing: boolean,
): GameState {
  if (passing && rng() >= 0.5) return state;

  const amount = empowered ? rollDamage(rng, 10, 22) : rollDamage(rng, 2, 5);
  const message = passing
    ? `As you and the abomination lunge past one another, a stray claw rakes across you for ${amount} damage.`
    : empowered
      ? `The swollen abomination crashes into you with a forest of grasping limbs and spines, dealing ${amount} damage.`
      : `The abomination's flailing limbs and spines batter you for ${amount} damage.`;

  return appendLog(applyPlayerDamage(state, amount), message);
}

function finishMove(
  state: GameState,
  startRoomId: string,
  destinationRoomId: string | undefined,
  rng: () => number,
  empowered: boolean,
): GameState {
  let next = state;
  if (destinationRoomId && destinationRoomId !== startRoomId) {
    next = moveAbomination(next, startRoomId, destinationRoomId);
  }

  const finalRoomId = next.itemState.itemRoomId[ABOMINATION_ID] ?? startRoomId;
  next = appendNearbyAbominationAudioCue(next, finalRoomId);

  const lastPlayerMove = state.player.recentMoves?.[0];
  const crossedPaths =
    Boolean(destinationRoomId) &&
    lastPlayerMove?.atTurn === state.moves &&
    lastPlayerMove.fromRoomId === destinationRoomId &&
    lastPlayerMove.toRoomId === startRoomId;
  const leftPlayerRoom =
    state.player.roomId === startRoomId && finalRoomId !== startRoomId;
  const passing = crossedPaths || leftPlayerRoom;
  const sharesRoom = state.player.roomId === finalRoomId;

  if (passing) {
    return applyRampageDamage(next, rng, empowered, true);
  }
  if (sharesRoom) {
    return applyRampageDamage(next, rng, empowered, false);
  }
  return next;
}

function tickGrowing(state: GameState): GameState {
  const abomination = getAbominationState(state);
  const remaining = Math.max(0, abomination.growthTurnsRemaining - 1);
  let next = setAbominationState(state, {
    ...abomination,
    growthTurnsRemaining: remaining,
    phase: remaining === 0 ? "empowered" : "growing",
  });

  if (remaining === 0 && state.player.roomId === TISSUE_VATS_ROOM_ID) {
    next = appendLog(
      next,
      "The vat ruptures. A vastly larger abomination unfolds from the spilling tissue medium and hauls itself onto the floor.",
    );
  }
  return next;
}

function tickAbomination({ state, item, rng }: TickContext): GameState {
  const abomination = getAbominationState(state);
  const roomId = state.itemState.itemRoomId[item.id] ?? item.location;

  if (abomination.phase === "trapped") return state;
  if (abomination.phase === "growing") return tickGrowing(state);

  const limbs = getAvailableLimbs(state);
  const limbIdsInRoom = limbs.filter(
    (limb) => getLimbRoomId(state, limb.id) === roomId,
  );

  if (limbIdsInRoom.length > 0) {
    const limb = limbIdsInRoom[randomIndex(rng, limbIdsInRoom.length)];
    const attached = attachLimb(state, limb, roomId);
    return finishMove(
      attached,
      roomId,
      undefined,
      rng,
      abomination.phase === "empowered",
    );
  }

  const allowedRooms = getReachableLevelTwoRoomIds(state);
  const allLimbsAttached =
    state.world.items.some(isAbominationLimb) && limbs.length === 0;
  const seekingTissueVats =
    abomination.phase === "collecting" && allLimbsAttached;

  if (seekingTissueVats && roomId === TISSUE_VATS_ROOM_ID) {
    let next = setAbominationState(state, {
      ...abomination,
      growthTurnsRemaining: ABOMINATION_GROWTH_TURNS,
      phase: "growing",
    });
    if (state.player.roomId === roomId) {
      next = appendLog(
        next,
        "The abomination vaults over the rim of a tissue vat and disappears into the cloudy nutrient gel. The whole tank begins to throb.",
      );
    }
    return next;
  }

  let destinationRoomId: string | undefined;
  if (seekingTissueVats) {
    destinationRoomId = findFirstStepToward(
      state,
      roomId,
      new Set([TISSUE_VATS_ROOM_ID]),
      allowedRooms,
      true,
      rng,
    );
  } else if (abomination.phase === "collecting") {
    const limbRooms = new Set(
      limbs
        .map((limb) => getLimbRoomId(state, limb.id))
        .filter((candidate): candidate is string => Boolean(candidate)),
    );
    destinationRoomId = findFirstStepToward(
      state,
      roomId,
      limbRooms,
      allowedRooms,
      false,
      rng,
    );
  }

  if (!destinationRoomId) {
    const neighbors = getNeighborRooms(
      state,
      roomId,
      allowedRooms,
      seekingTissueVats || abomination.phase === "empowered",
    );
    if (neighbors.length > 0) {
      destinationRoomId = neighbors[randomIndex(rng, neighbors.length)];
    }
  }

  const moved = finishMove(
    state,
    roomId,
    destinationRoomId,
    rng,
    abomination.phase === "empowered",
  );
  const finalRoomId = moved.itemState.itemRoomId[item.id] ?? roomId;

  if (seekingTissueVats && finalRoomId === TISSUE_VATS_ROOM_ID) {
    let next = setAbominationState(moved, {
      ...getAbominationState(moved),
      growthTurnsRemaining: ABOMINATION_GROWTH_TURNS,
      phase: "growing",
    });
    if (moved.player.roomId === finalRoomId) {
      next = appendLog(
        next,
        "The abomination vaults over the rim of a tissue vat and disappears into the cloudy nutrient gel. The whole tank begins to throb.",
      );
    }
    return next;
  }

  return moved;
}

export function pushContainmentFieldButton({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  const abomination = getAbominationState(state);
  const containmentFieldOn = !abomination.containmentFieldOn;
  const released = abomination.phase === "trapped" && !containmentFieldOn;

  return {
    state: setAbominationState(state, {
      ...abomination,
      containmentFieldOn,
      phase: released ? "collecting" : abomination.phase,
    }),
    message: released
      ? "The red light goes dark. The globe of energy collapses with a sharp crack, and the abomination springs from the platform in a frenzy of flailing limbs."
      : containmentFieldOn
        ? "The button lights red. A globe of crackling energy reforms above the platform, but the abomination is no longer inside it."
        : "The red light goes dark and the containment field dissolves.",
  };
}

function describeAbomination(state: GameState): string {
  const abomination = getAbominationState(state);
  const limbCount = abomination.attachedLimbIds.length;

  if (abomination.phase === "trapped") {
    return "A shambling, vaguely humanoid hybrid crouches inside the crackling field. A smaller third arm twitches beneath its shoulder, and its face has split vertically into a bulging, bloody eye.";
  }
  if (abomination.phase === "growing") {
    return "The abomination is submerged in the tissue vat. Its silhouette pulses beneath the cloudy gel, visibly larger each time it presses against the glass.";
  }
  if (abomination.phase === "empowered") {
    return "The thing has grown monstrously large. Stolen arms and legs work along its swollen body while its split face gapes like one enormous, bloodshot eye.";
  }

  const additions =
    limbCount === 0
      ? ""
      : ` ${formatLimbCount(limbCount)} crudely grafted ${limbCount === 1 ? "limb works" : "limbs work"} alongside its original arms and legs.`;
  return `It is a shambling human-organism hybrid with a small third arm and a face split vertically into a bulging, bloody eye.${additions}`;
}

function describeAbominationPresence(state: GameState): string {
  const abomination = getAbominationState(state);
  const limbCount = abomination.attachedLimbIds.length;

  if (abomination.phase === "trapped") {
    return "Inside the crackling containment field a shambling humanoid creature crouches on the platform, mismatched arms and legs straining as it struggles to get loose.";
  }
  if (abomination.phase === "growing") {
    return "Inside one of the tissue vats, the abomination's silhouette pulses beneath the cloudy gel, sending thick ripples as it swells larger by the moment.";
  }
  if (abomination.phase === "empowered") {
    return "A towering abomination dominates the room, its stolen limbs flexing through a skin of raw new tissue as it stares down at you.";
  }

  const additions =
    limbCount === 0
      ? ""
      : ` ${formatLimbCount(limbCount)} stolen ${limbCount === 1 ? "limb twitches" : "limbs twitch"} from its body.`;
  return `Lurking in the corner is a shambling humanoid figure with mismatched limbs and a face that is split vertically down the center.${additions}`;
}

export const abominationItems: Item[] = [
  {
    id: ABOMINATION_ID,
    name: "horrid abomination",
    named: (state) =>
      getAbominationState(state).phase === "empowered"
        ? "towering abomination"
        : "horrid abomination",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      canUseDoors: true,
      vision: "dark",
      hostility: "aggressive",
      homeRegion: [],
      memories: [],
    },
    description:
      "A shambling human-organism hybrid whose face has split open vertically.",
    describe: (state) => describeAbomination(state),
    npcDescribe: (state) => describeAbominationPresence(state),
    location: "Lab",
    vocab: ["creature", "abomination", "monster", "thing", "experiment"],
    itemClass: "solid",
    itemWeight: 180,
    itemSize: 7,
    overrides: {
      tick: tickAbomination,
    },
  },
];
