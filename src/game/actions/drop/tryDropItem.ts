import { CAT_ID, clearCatHeldTurns, isCatHeld, isCatNoun } from "@game/helpers/catHelpers";
import { updateItemLocation } from "@game/rules/items";
import { RuleResult } from "@game/rules/result";
import { removeFromInventory } from "@game/rules/state";
import { getItemsInInventory } from "@game/selectors/itemSelectors";
import { getCurrentRoom } from "@game/selectors/roomSelectors";
import { GameState } from "@game/types/gameTypes";

export function tryDropItem(state: GameState, noun: string): RuleResult {
  if (isCatNoun(noun) && isCatHeld(state)) {
    const next = clearCatHeldTurns({
      ...state,
      itemState: {
        ...state.itemState,
        attachedTo: {
          ...state.itemState.attachedTo,
          [CAT_ID]: undefined,
        },
        itemRoomId: {
          ...state.itemState.itemRoomId,
          [CAT_ID]: state.player.roomId,
        },
      },
    });

    return { state: next, message: "You set the cat gently back down." };
  }

  const invItems = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = invItems.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower),
  );

  if (!item) {
    return { state, message: "You aren't carrying that." };
  }

  const room = getCurrentRoom(state);

  let next = updateItemLocation(state, item.id, room.id);
  next = removeFromInventory(next, item.id);

  return { state: next, message: "Dropped." };
}
