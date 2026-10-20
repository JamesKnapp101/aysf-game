import type { GameState } from "@game/types/gameTypes";
import { corpseItems } from "src/world/Items/bodies";
import { levelThreeItems } from "src/world/Items/levelThreeMisc";
import { threeEastItems } from "../LivingQuarters/ThreeEast";
import { restaurantKitchenItems } from "./Restaurant/restaurantKitchenItems";
import { spaItems } from "./Spa";

/** Refresh authored content retained by older snapshots, preserving placement and progress. */
export function migrateSpaContentSnapshot(state: GameState): GameState {
  const definitions = [
    ...spaItems.filter((item) => item.itemCategory === "scenery"),
    ...restaurantKitchenItems.filter((item) =>
      ["CarvingKnife", "FridgeDoor", "BigASSPadlock"].includes(item.id)),
    ...threeEastItems.filter((item) =>
      ["SecretLabWhiteboard", "SecretLabOrganismDiagrams"].includes(item.id)),
    ...corpseItems.filter((item) => item.id === "saunacorpse"),
    ...levelThreeItems.filter((item) =>
      ["JACQUZZI", "portholeSpa", "portholeSauna", "saunacorpsepurse"].includes(item.id)),
  ];
  const byId = new Map(definitions.map((item) => [item.id, item]));
  const itemRoomId = { ...state.itemState.itemRoomId };
  const items = state.world.items.map((item) => {
    const authored = byId.get(item.id);
    if (!authored) return item;

    itemRoomId[item.id] ??= item.location;
    return {
      ...item,
      name: authored.name,
      description: authored.description,
      itemClass: authored.itemClass,
      initialDescription: authored.initialDescription,
      sceneryDescription: authored.sceneryDescription,
      lookThroughDescription: authored.lookThroughDescription,
      vocab: authored.vocab,
      overrides: authored.overrides,
    };
  });

  return {
    ...state,
    world: { ...state.world, items },
    itemState: { ...state.itemState, itemRoomId },
  };
}
