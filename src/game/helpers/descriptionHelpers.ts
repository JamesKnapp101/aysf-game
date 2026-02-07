import { GameState } from "@game/types/gameTypes";
import { DescriptionContext, Item } from "@game/types/itemTypes";

export function getItemDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describe) return item.describe(state, item, ctx);
  return item.description ?? "";
}

export function getItemSceneryDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describeScenery) return item.describeScenery(state, item, ctx);
  return item.sceneryDescription ?? "";
}

export function getItemInitialDescription(
  state: GameState,
  item: Item,
  ctx: DescriptionContext,
): string {
  if (item.describeInitial) return item.describeInitial(state, item, ctx);
  return item.initialDescription ?? "";
}
