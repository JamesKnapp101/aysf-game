import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { isRoomAmbientlyLit } from "@game/registries/roomLightRegistry";
import { updateItemLocation } from "@game/rules/items";
import type { ScriptedEvent } from "@game/types/eventTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const WALK_IN_ORGANISM_ID = "WalkInOrganism";

export function isWalkInFreezerOn(state: GameState): boolean {
  return state.worldState.powerRestoredSections["restaurant-freezer"] ?? true;
}

/** Power is reversible; the chef's transformation is not. Also upgrades old saves.
 * Placements are recorded even before Level Three's world chunk is loaded.
 */
export function synchronizeWalkInFreezer(state: GameState): GameState {
  const on = isWalkInFreezerOn(state);
  const transformed = state.worldState.walkInChefTransformed === true || !on;
  let next = state;
  if (state.worldState.powerRestoredSections["restaurant-freezer"] === undefined ||
      state.worldState.walkInChefTransformed !== transformed ||
      state.worldState.darkRooms.WalkIn !== (on ? undefined : true)) {
    const darkRooms = { ...state.worldState.darkRooms };
    if (on) delete darkRooms.WalkIn;
    else darkRooms.WalkIn = true;
    next = {
      ...state,
      worldState: {
        ...state.worldState,
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          "restaurant-freezer": on,
        },
        walkInChefTransformed: transformed,
        darkRooms,
      },
    };
  }
  const placements: [string, string][] = transformed
    ? [["DoomedChef", "seeded"], [WALK_IN_ORGANISM_ID, "WalkIn"]]
    : [[WALK_IN_ORGANISM_ID, "seeded"]];
  for (const [itemId, roomId] of placements) {
    if (!transformed && !next.world.items.some(item => item.id === itemId)) continue;
    if (next.itemState.itemRoomId[itemId] !== roomId) {
      next = updateItemLocation(next, itemId, roomId);
    }
  }
  return next;
}

export const walkInOrganism: Item = {
  id: WALK_IN_ORGANISM_ID,
  name: "organism",
  named: (state) => isRoomAmbientlyLit(state, "WalkIn") ? "deep red sculpture" : "organism",
  description: "A mass of dark red flesh lies where the chef once lay.",
  describe: (state, item) => isRoomAmbientlyLit(state, "WalkIn")
    ? "A deep red, glassy sculpture lies rigid in the light, its surface covered in intricate folds."
    : item.description,
  initialDescription: "A deep red, glassy sculpture lies where the chef once lay.",
  describeInitial: (state, item) => isRoomAmbientlyLit(state, "WalkIn")
    ? item.initialDescription!
    : item.description,
  location: "seeded",
  vocab: ["organism", "creature", "sculpture", "red sculpture"],
  itemClass: "solid",
  itemCategory: "animate",
  itemWeight: 8,
  itemSize: 2,
  meta: { isAlive: true, canMove: false, vision: "dark", hostility: "hostile" },
  overrides: { take: "You leave the organism alone." },
};

export const walkInFreezerEvents: ScriptedEvent[] = [
  {
    id: "walk_in_organism_entry",
    once: false,
    when: (state, ctx) => ctx.kind === "onEnterRoom" &&
      ctx.roomId === "WalkIn" && ctx.fromRoomId !== ctx.roomId &&
      state.player.roomId === "WalkIn" &&
      state.worldState.walkInChefTransformed === true && !isWalkInFreezerOn(state),
    run: (state) => triggerPlayerDeath(
      state,
      "In the dark, the organism touches you and your body goes rigid. Everything is washed away by a stark, bright light, then sudden, final darkness.",
      "organism",
    ),
  },
];
