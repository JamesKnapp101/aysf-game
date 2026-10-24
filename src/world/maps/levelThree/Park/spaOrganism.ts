import { appendLog } from "@game/engine/log";
import { isAnyFlashlightOn } from "@game/helpers/flashlightHelpers";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { getItemPlacementContext } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import {
  findOrganismRoute,
  isOrganismRoomActive,
  type OrganismRange,
} from "@game/rules/organismMovement";
import type { TickContext } from "@game/types/context";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  getAccessibleChefSampleRoom,
  removeChefSample,
} from "./Restaurant/chefSample";

export const SPA_ORGANISM_ID = "SpaOrganism";
const LEFT_SAUNA = "SpaOrganismLeftSauna";
// Command-local intent survives immutable spreads, but is never serialized.
const LIGHTS_OFF_TURN = Symbol("Spa lights switched off this turn");
type SpaTurnState = GameState & { [LIGHTS_OFF_TURN]?: number };

export function queueSpaLightsOffEncounter(state: GameState): GameState {
  return { ...state, [LIGHTS_OFF_TURN]: state.moves } as SpaTurnState;
}

function moveOrganism(state: GameState, destination: string): GameState {
  const next = updateItemLocation(state, SPA_ORGANISM_ID, destination);
  return {
    ...next,
    worldState: {
      ...next.worldState,
      conditionalTriggers: {
        ...next.worldState.conditionalTriggers,
        [LEFT_SAUNA]: true,
      },
    },
  };
}

function absorbSample(state: GameState, narrate: boolean): GameState {
  const next = removeChefSample(state);
  return narrate
    ? appendLog(
        next,
        "The organism engulfs the sample. The fragment disappears into its body.",
      )
    : next;
}
export const SPA_ORGANISM_RANGE: OrganismRange = {
  roomIds: new Set(["Sauna", "Spa", "SteamRoom"]),
  maxTransitions: 2,
};

export function getSpaOrganismReaction(state: GameState) {
  const roomId = getItemPlacementContext(state, SPA_ORGANISM_ID).roomId;
  const baitRoomId = getAccessibleChefSampleRoom(state);
  const active = Boolean(roomId && isOrganismRoomActive(state, roomId));
  const sensedRoute =
    roomId && baitRoomId
      ? findOrganismRoute(
          state,
          roomId,
          baitRoomId,
          SPA_ORGANISM_RANGE,
          "sense",
        )
      : undefined;
  const movementRoute =
    sensedRoute && roomId && baitRoomId
      ? findOrganismRoute(state, roomId, baitRoomId, SPA_ORGANISM_RANGE, "move")
      : undefined;
  return { roomId, baitRoomId, active, sensedRoute, movementRoute };
}

function contactDeath(state: GameState): GameState {
  // Use the same retirement path as sample contact, without granting bait immunity.
  return triggerPlayerDeath(
    state.worldState.chefSample ? removeChefSample(state) : state,
    "In the dark, something touches you and your body goes rigid. You feel the sensation of something cold and sticky brushing over your bare skin, then a tingle, then everything gets washed away with stark, bright light. You stare into the blinding white void for only a second before being all at once replaced by sudden, final darkness.",
    "organism",
  );
}

/** The sole contact exception: an initial, fully validated two-room lure. */
function resolveSpaLightsOffEncounter(state: GameState): GameState | undefined {
  if (
    state.player.roomId !== "Spa" ||
    state.worldState.darkRooms.Spa !== true ||
    state.worldState.conditionalTriggers[LEFT_SAUNA] ||
    getItemPlacementContext(state, SPA_ORGANISM_ID).roomId !== "Sauna"
  )
    return undefined;
  const approach = findOrganismRoute(
    state,
    "Sauna",
    "Spa",
    SPA_ORGANISM_RANGE,
    "move",
  );
  if (!approach) {
    if (isAnyFlashlightOn(state))
      return appendLog(
        state,
        "Your flashlight still illuminates the Spa. The organism cannot rush through its beam.",
      );
    return state;
  }
  const route =
    getAccessibleChefSampleRoom(state) === "SteamRoom"
      ? findOrganismRoute(
          state,
          "Sauna",
          "SteamRoom",
          SPA_ORGANISM_RANGE,
          "move",
        )
      : undefined;
  if (route?.join("/") === "Sauna/Spa/SteamRoom") {
    let next = appendLog(
      state,
      "The organism rushes out of the Sauna, passes close beside you, and plunges into the Steam Room, drawn to the sample.",
    );
    next = moveOrganism(next, "Spa");
    next = moveOrganism(next, "SteamRoom");
    return appendLog(
      absorbSample(next, true),
      "It is still in the Steam Room. The light switch is within reach.",
    );
  }
  return contactDeath(
    moveOrganism(
      appendLog(
        state,
        "Something large and with an uncertain form comes rushing out of the sauna to investigate the newfound darkness, but it doesn't find anything more compelling than you, unfortunately, and so it lunges like a wet, organic wave.",
      ),
      "Spa",
    ),
  );
}

/** One ordinary item tick owns both the initial rush and subsequent biology. */
export function tickSpaOrganism(input: GameState): GameState {
  const pendingTurn = (input as SpaTurnState)[LIGHTS_OFF_TURN];
  const state: SpaTurnState = pendingTurn === undefined ? input : { ...input };
  delete state[LIGHTS_OFF_TURN];
  const organism = state.world.items.find(
    (item) => item.id === SPA_ORGANISM_ID,
  );
  if (
    !organism?.meta?.isAlive ||
    !organism.meta.canMove ||
    state.worldState.gameOver
  )
    return state;
  if (pendingTurn === state.moves) {
    const resolved = resolveSpaLightsOffEncounter(state);
    if (resolved) return resolved; // The entire action is spent, including on death.
  }
  const reaction = getSpaOrganismReaction(state);
  const { roomId, baitRoomId, active, sensedRoute, movementRoute } = reaction;
  if (!roomId || !SPA_ORGANISM_RANGE.roomIds.has(roomId)) return state;
  if (active && roomId === state.player.roomId) return contactDeath(state);
  if (!sensedRoute) {
    if (!active) return state;
    const pursuit = findOrganismRoute(
      state,
      roomId,
      state.player.roomId,
      SPA_ORGANISM_RANGE,
      "move",
    );
    const destination = pursuit?.[1];
    if (!destination) return state;
    const next = moveOrganism(state, destination);
    return destination === state.player.roomId ? contactDeath(next) : next;
  }

  let next = state;
  const nearby = Boolean(
    findOrganismRoute(
      state,
      roomId,
      state.player.roomId,
      SPA_ORGANISM_RANGE,
      "sense",
    ),
  );
  // Chittering carries between these rooms; a rigid sculpture's pulse is only
  // visible when the player shares its physically illuminated room.
  if (nearby && (active || roomId === state.player.roomId)) {
    next = appendLog(
      next,
      active
        ? "Excited chittering rises from the organism as it senses the sample."
        : "A dark pulse shows beneath the organism's rigid red surface as it senses the sample, but the light holds it inert.",
    );
    if (active && !movementRoute) {
      const flashlightBlocks =
        isAnyFlashlightOn(state) && sensedRoute.includes(state.player.roomId);
      next = appendLog(
        next,
        flashlightBlocks
          ? "Your flashlight illuminates its route. The organism cannot approach through the beam."
          : "The organism cannot reach the sample through the light or a closed passage.",
      );
    }
  }
  if (!active || !movementRoute) return next;
  const destination = movementRoute[1] ?? roomId;
  if (destination !== roomId) next = moveOrganism(next, destination);
  if (destination === next.player.roomId) return contactDeath(next);
  if (destination === baitRoomId) {
    next = absorbSample(next, nearby);
  }
  return next;
}

export const spaOrganism: Item = {
  id: SPA_ORGANISM_ID,
  name: "organism",
  named: (state) =>
    getSpaOrganismReaction(state).active ? "organism" : "deep red sculpture",
  description: "A mass of dark red flesh bristles with restless cilia.",
  describe: (state) =>
    getSpaOrganismReaction(state).active
      ? "A mass of dark red flesh bristles with restless cilia."
      : "A deep red, glassy sculpture stands rigid in the light, its surface covered in intricate folds.",
  location: "Sauna",
  vocab: ["organism", "sculpture", "red sculpture", "creature"],
  itemClass: "solid",
  itemCategory: "animate",
  itemWeight: 8,
  itemSize: 2,
  meta: { isAlive: true, canMove: true, vision: "dark", hostility: "hostile" },
  overrides: {
    tick: ({ state }: TickContext) => tickSpaOrganism(state),
    take: "You leave the organism alone.",
  },
};

/** Older snapshots have no placement for this newly authored creature. */
export function migrateSpaOrganismSnapshot(state: GameState): GameState {
  if (!state.world.items.some((item) => item.id === SPA_ORGANISM_ID))
    return state;
  const room = state.itemState.itemRoomId[SPA_ORGANISM_ID];
  if (room === undefined)
    return updateItemLocation(state, SPA_ORGANISM_ID, "Sauna");
  // Stage 5 saves already placed outside Sauna have already left the initial encounter.
  if (room !== "Sauna" && SPA_ORGANISM_RANGE.roomIds.has(room))
    return moveOrganism(state, room);
  return state;
}
