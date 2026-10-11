import { getContainerContentsItems } from "../selectors/containerSelectors";
import { getItemById } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

/** Match the tote's stored category counts; visible children are not extra entries. */
export function getInventoryCounts(state: GameState) {
  const { general, badges, keys } = state.player.inventory;
  return {
    general: general.length,
    badges: badges.length,
    keys: keys.length,
    total: general.length + badges.length + keys.length,
  };
}

function withIndefiniteArticle(name: string): string {
  const n = name.trim();
  if (!n || /^(a|an|the|some|your)\b/i.test(n)) return n;
  const word = n.toLowerCase();
  const vowelSound = /^(hour|honest|heir|led)/.test(word) ||
    (!/^(uni|use|euro)/.test(word) && /^[aeiou]/.test(word));
  return `${vowelSound ? "an" : "a"} ${n}`;
}

/** Labels contain only information shown by the inventory, never ID fallbacks. */
export function getInventoryItemLabel(state: GameState, itemId: string): string | null {
  const item = getItemById(state, itemId);
  if (!item) return null;
  const name = (item.named?.(state, item) ?? item.name)?.trim();
  if (!name) return null;
  let label = withIndefiniteArticle(name);
  const liquidId = state.itemState.containerFilled[itemId]?.[0];
  if (liquidId) {
    const liquid = getItemById(state, liquidId);
    const liquidName = (state.itemState.frozenItems[liquidId]
      ? liquid?.meta?.liquid?.frozenName
      : undefined) ?? liquid?.named?.(state, liquid) ?? liquid?.name;
    label += `, which is filled with ${liquidName ?? "an unidentified liquid"}`;
  }
  if (item.isWearable && item.clothingSlot && state.itemState.wornByPlayer[item.clothingSlot] === item.id) {
    label += ` (worn on your ${item.clothingSlot})`;
  }
  const settings = state.itemState.itemSettings?.[itemId];
  if (settings && "isOn" in settings && settings.isOn === true) label += " (which is on)";
  return label;
}

/** Inventory contents are shown only for open containers, including nested ones. */
export function getInventoryVisibleContents(state: GameState, item: Item): Item[] {
  return item.isContainer && state.itemState.openItems?.[item.id]
    ? getContainerContentsItems(state, item)
    : [];
}
