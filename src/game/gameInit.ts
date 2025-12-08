import type {
  DoorDefinition,
  DoorState,
  GameState,
  World,
} from "../world/types";

export const createInitialState = (world: World): GameState => ({
  world,
  // TODO: set to your real starting room id
  playerRoomId: "LivingQuartersFiveEast",
  inventory: [],
  log: [],
  score: 0,
  memory: 0,
  rating: 0,
  moves: 0,
  health: 100,
  doorStates: initDoorStates(world.doors),
});

function initDoorStates(doorDefs: DoorDefinition[]): DoorState[] {
  return doorDefs.map((def) => ({
    id: def.id,
    isOpen: def.initiallyOpen ?? false,
    isLocked: def.initiallyLocked ?? false,
  }));
}
