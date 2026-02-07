import type { DoorDefinition, DoorState } from "../types/doorTypes";
import type { GameState } from "../types/gameTypes";

export function getDoorById(
  state: GameState,
  id: string,
): DoorDefinition | undefined {
  return state.world.doors.find((d) => d.id === id);
}

export function getDoorState(
  state: GameState,
  id: string,
): DoorState | undefined {
  return state.worldState.doors[id];
}

export function getVisibleDoorsInRoom(
  state: GameState,
  roomId: string,
): DoorDefinition[] {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return [];

  const doorIds = room.exits
    .map((e) => e.doorId)
    .filter((id): id is string => Boolean(id));

  const uniqueDoorIds = [...new Set(doorIds)];

  return uniqueDoorIds
    .map((id) => state.world.doors.find((d) => d.id === id))
    .filter((d): d is DoorDefinition => Boolean(d));
}

export function getDoorDescriptionForRoom(
  state: GameState,
  doorDef: DoorDefinition,
  roomId: string,
): string | undefined {
  const { connects } = doorDef;

  if (roomId === connects.roomAId) {
    return (
      doorDef.describeFromA?.(state, {
        kind: "door",
        doorId: doorDef.id,
        roomId: roomId,
      }) ??
      doorDef.descriptionFromA ??
      doorDef.description
    );
  }

  if (roomId === connects.roomBId) {
    return (
      doorDef.describeFromB?.(state, {
        kind: "door",
        doorId: doorDef.id,
        roomId: roomId,
      }) ??
      doorDef.descriptionFromB ??
      doorDef.description
    );
  }

  return doorDef.description;
}
