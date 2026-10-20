import { getExitDestinationRoomId, getRoomExits } from "@game/helpers/itemHelpers";
import { isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { resolveDoorDestination } from "@game/rules/doors";
import type { GameState } from "@game/types/gameTypes";

/** An encounter must explicitly bound both its territory and sensing range. */
export type OrganismRange = {
  roomIds: ReadonlySet<string>;
  maxTransitions: number;
};

export function isOrganismRoomActive(state: GameState, roomId: string): boolean {
  return state.world.rooms.some(room => room.id === roomId) &&
    !isRoomPhysicallyLit(state, roomId);
}

/** Sensing crosses light/closed doors; locomotion requires open, dark passages.
 * Neither mode opens doors or invokes player navigation/automatic passage.
 */
export function findOrganismRoute(
  state: GameState,
  from: string,
  to: string,
  range: OrganismRange,
  mode: "sense" | "move",
): string[] | undefined {
  if (!range.roomIds.has(from) || !range.roomIds.has(to)) return undefined;
  if (!state.world.rooms.some(room => room.id === from)) return undefined;
  if (mode === "move" && !isOrganismRoomActive(state, from)) return undefined;
  const queue = [[from]];
  const visited = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i];
    const here = path[path.length - 1];
    if (here === to) return path;
    if (path.length - 1 >= range.maxTransitions) continue;
    for (const exit of getRoomExits(state, here)) {
      const destination = getExitDestinationRoomId(state, here, exit);
      if (!destination || visited.has(destination) || !range.roomIds.has(destination) ||
        !state.world.rooms.some(room => room.id === destination)) continue;
      if (exit.doorId) {
        const door = state.world.doors.find(candidate => candidate.id === exit.doorId);
        if (!door || door.kind === "blocked" || resolveDoorDestination(door, here) !== destination) continue;
        const doorState = state.worldState.doors[door.id];
        if (mode === "move" && (!(doorState?.isOpen ?? door.initiallyOpen ?? false) ||
          (doorState?.isLocked ?? door.initiallyLocked ?? false))) continue;
      }
      // Specialized traversal rules require an explicit adapter, never a bypass.
      if (mode === "move" && (exit.preserveRuleId || !isOrganismRoomActive(state, destination))) continue;
      visited.add(destination);
      queue.push([...path, destination]);
    }
  }
  return undefined;
}
