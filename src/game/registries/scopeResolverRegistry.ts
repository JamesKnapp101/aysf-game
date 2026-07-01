import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";
import {
  HYDROPONICS_SPIDER_ITEM_ID,
  isAquariumRoom,
  isHydroponicsSpiderNoun,
  isHydroponicsSpiderRoom,
  isHydroponicsSpiderVisibleFromRoom,
  matchesAquariumThreatNoun,
} from "src/world/zoneRegistrations";

type ScopeItemResolverContext = {
  noun: string;
  room: Room;
  state: GameState;
};

type ScopeItemResolver = (ctx: ScopeItemResolverContext) => Item | undefined;

const SCOPE_ITEM_RESOLVERS: ScopeItemResolver[] = [
  ({ noun, room, state }) => {
    if (
      !isHydroponicsSpiderRoom(room.id) ||
      !isHydroponicsSpiderVisibleFromRoom(room.id)
    ) {
      return undefined;
    }

    const spider = state.world.items.find(
      (it) => it.id === HYDROPONICS_SPIDER_ITEM_ID,
    );
    return spider && isHydroponicsSpiderNoun(spider, noun)
      ? spider
      : undefined;
  },
  ({ noun, room, state }) => {
    if (!isAquariumRoom(room.id) || !matchesAquariumThreatNoun(noun)) {
      return undefined;
    }

    return state.world.items.find((it) => it.id === "octopus");
  },
];

export function resolveRegisteredScopeItem(
  ctx: ScopeItemResolverContext,
): Item | undefined {
  for (const resolver of SCOPE_ITEM_RESOLVERS) {
    const item = resolver(ctx);
    if (item) return item;
  }

  return undefined;
}
