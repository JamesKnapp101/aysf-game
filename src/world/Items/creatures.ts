import { brainSlugItems } from "src/world/Items/creatures/brainSlug";
import { catItems } from "src/world/Items/creatures/cat";
import { octopusItems } from "src/world/Items/creatures/octopus";
import type { Item } from "../../game/types/itemTypes";

export const creatureItems: Item[] = [
  ...catItems,
  ...brainSlugItems,
  ...octopusItems,
];
