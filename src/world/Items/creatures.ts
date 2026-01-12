import { catItems } from "src/world/Items/creatures/cat";
import { gorillaItems } from "src/world/Items/creatures/gorilla";
import { octopusItems } from "src/world/Items/creatures/octopus";
import type { Item } from "../../game/types/itemTypes";

export const creatureItems: Item[] = [
  ...catItems,
  ...gorillaItems,
  ...octopusItems,
];
