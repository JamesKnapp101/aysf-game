import type { HintMenuNode } from "../game/types/hintTypes";
import { levelFiveHints } from "./levelFiveHints";
import { levelFourHints } from "./levelFourHints";
import { levelOneHints } from "./levelOneHints";
import { levelSevenHints } from "./levelSevenHints";
import { levelSixHints } from "./levelSixHints";
import { levelThreeHints } from "./levelThreeHints";
import { levelTwoHints } from "./levelTwoHints";
import { miscHints } from "./miscHints";

export const allHintsRoot: HintMenuNode = {
  kind: "menu",
  id: "hints-root",
  title: "HINTS",
  children: [
    levelOneHints,
    levelTwoHints,
    levelThreeHints,
    levelFourHints,
    levelFiveHints,
    levelSixHints,
    levelSevenHints,
    miscHints,
  ],
};
