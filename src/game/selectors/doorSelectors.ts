import type { DoorDefinition, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";
import type { Exit } from "../types/roomTypes";
import { getCurrentRoom } from "./roomSelectors";

export function getDoorById(
  state: GameState,
  id: string
): DoorDefinition | undefined {
  return state.world.doors.find((d) => d.id === id);
}

export function getDoorState(
  state: GameState,
  id: string
): DoorState | undefined {
  // worldState.doors is treated as a map: Record<string, DoorState>
  return state.worldState.doors[id];
}

/**
 * Resolve a door from a noun like "door" / "hatch" / "airlock"
 * scoped to the exits of the *current* room.
 */
export function resolveDoorByNoun(
  state: GameState,
  noun: string
): { def: DoorDefinition; state: DoorState } | null {
  const room = getCurrentRoom(state);
  const lower = noun.toLowerCase();

  // Doors attached to exits from THIS room
  const doorIds = room.exits
    .map((e: Exit) => e.doorId)
    .filter((id): id is string => Boolean(id));

  for (const doorId of doorIds) {
    const def = state.world.doors.find((d) => d.id === doorId);
    const doorState = state.worldState.doors[doorId];

    if (!def || !doorState) continue;

    const matches =
      def.name.toLowerCase() === lower ||
      (Array.isArray(def.vocab) &&
        def.vocab.some((v: string) => v.toLowerCase() === lower));

    if (matches) {
      return { def, state: doorState };
    }
  }

  return null;
}
