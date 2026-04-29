import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { updateAnimalDisposition } from "@game/preserve/animalStatus";
import {
  createInitialPreserveActorRuntime,
  removePreserveRunItems,
  setPreserveActorRuntime,
} from "@game/preserve/preserveState";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_ANIMAL_PROFILES } from "src/world/maps/levelFour/gamePreserveRules";

export const BADGER_ROOM_IDS = [
  "OpenSavanna",
  "ObservationTower",
  "RockyRidge",
  "TallGrass",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
] as const;

export const BADGER_INITIAL_ROOM_ID =
  GAME_PRESERVE_ANIMAL_PROFILES.badger.initialRoomId;
export const BADGER_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export function resetBadgerEncounter(state: GameState): GameState {
  useUIEffectsStore.getState().triggerTeleportFlash();

  let next = removePreserveRunItems(state);

  next = updateAnimalDisposition(next, "badger", (current) => ({
    ...current,
    statusEffects: [],
  }));
  next = setPreserveActorRuntime(
    next,
    "badger",
    createInitialPreserveActorRuntime("badger"),
  );

  if (next.itemState.itemRoomId.badger) {
    return moveItemToRoom(next, "badger", BADGER_INITIAL_ROOM_ID);
  }

  return {
    ...next,
    itemState: {
      ...next.itemState,
      itemRoomId: {
        ...next.itemState.itemRoomId,
        badger: BADGER_INITIAL_ROOM_ID,
      },
    },
  };
}

export const badgerItems: Item[] = [
  {
    id: "badger",
    name: "muscled black-and-white badger",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "aggressive",
      trackingModes: ["sight"],
      homeRegion: [...BADGER_ROOM_IDS],
      memories: [],
    },
    description:
      "The badger is compact, brutal-looking, and built like a small industrial accident. Its striped face is almost neat compared with the thick forequarters and digging claws that look more than capable of opening you up.",
    location: BADGER_INITIAL_ROOM_ID,
    vocab: ["badger"],
    itemClass: "solid",
    itemWeight: 80,
    itemSize: 40,
  },
];
