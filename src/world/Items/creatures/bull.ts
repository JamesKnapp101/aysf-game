import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { updateAnimalDisposition } from "@game/preserve/animalStatus";
import {
  createInitialPreserveActorRuntime,
  removePreserveRunItems,
  setPreserveActorRuntime,
  syncLegacyBullEncounter,
  updatePreserveStructures,
} from "@game/preserve/preserveState";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_ANIMAL_PROFILES } from "src/world/maps/levelFour/gamePreserveRules";

const BULL_DESCRIPTION =
  "The bull is huge, with a thick, black hide and a powerful, muscular frame. Its horns curve menacingly from its head, and its dark eyes glint, never leaving you for long. It stands with a low, threatening posture, ready to charge at any perceived threat.";

const BULL_BROKEN_HORN_DESCRIPTION =
  "The bull is huge, with a thick, black hide and a powerful, muscular frame. One horn still curves menacingly from its head; the other is now a jagged stub where the rest broke off. Its dark eyes glint, never leaving you for long.";

export const BULL_ROOM_IDS = [
  ...GAME_PRESERVE_ANIMAL_PROFILES.bull.patrolRoomIds,
];

export const BULL_INITIAL_ROOM_ID =
  GAME_PRESERVE_ANIMAL_PROFILES.bull.initialRoomId;
export const BULL_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export function createInitialBullEncounterState(): GameState["worldState"]["bullEncounter"] {
  return {
    chargeCooldown: 3,
    pendingCharge: undefined,
    stunnedTurns: 0,
  };
}

export function resetBullEncounter(state: GameState): GameState {
  useUIEffectsStore.getState().triggerTeleportFlash();

  let next = removePreserveRunItems(state);

  next = updatePreserveStructures(next, (structures) => ({
    ...structures,
    ruinedWallState: "intact",
  }));

  next = updateAnimalDisposition(next, "bull", (current) => ({
    ...current,
    statusEffects: [],
  }));

  next = setPreserveActorRuntime(
    next,
    "bull",
    createInitialPreserveActorRuntime("bull"),
  );
  next = syncLegacyBullEncounter(next);

  if (next.itemState.itemRoomId.bull) {
    return moveItemToRoom(next, "bull", BULL_INITIAL_ROOM_ID);
  }

  return {
    ...next,
    itemState: {
      ...next.itemState,
      itemRoomId: {
        ...next.itemState.itemRoomId,
        bull: BULL_INITIAL_ROOM_ID,
      },
    },
  };
}

function describeBull(state: GameState): string {
  return state.worldState.gamePreserve.run?.structures.ruinedWallState ===
    "toppled"
    ? BULL_BROKEN_HORN_DESCRIPTION
    : BULL_DESCRIPTION;
}

export const bullItems: Item[] = [
  {
    id: "bull",
    name: "big black bull",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "hostile",
      trackingModes: ["sight"],
      homeRegion: [...BULL_ROOM_IDS],
      memories: [],
    },
    description: BULL_DESCRIPTION,
    describe: describeBull,
    location: BULL_INITIAL_ROOM_ID,
    vocab: ["bull", "steer"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
  },
];
