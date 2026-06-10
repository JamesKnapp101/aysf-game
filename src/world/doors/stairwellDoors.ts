import { GameState } from "@game/types/gameTypes";
import { DescriptionContext } from "@game/types/itemTypes";
import type { DoorDefinition } from "../../game/types/doorTypes";
import { hasLevelTwoBombDetonated } from "../maps/levelTwo/levelTwoBomb";

export const stairwellDoors: DoorDefinition[] = [
  {
    id: "StairDoorTwo",
    name: "stairwell access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairTwo"
          ? `It's a heavy door painted slate gray, with a horizontal blue stripe at eye level, across which is printed the word 'MEDICAL'. Underneath that are the words 'COMMUNITY/RECREATIONAL'.`
          : `It's a heavy gray door that leads to the stairwell.`;
      return description;
    },
    descriptionFromA:
      "There is a door to the west painted slate gray, with a blue horizontal stripe at eye level, across which is printed the word 'MEDICAL'. Underneath that are the words 'COMMUNITY/RECREATIONAL'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    describeFromA: (state) =>
      hasLevelTwoBombDetonated(state)
        ? "There is a door to the west painted slate gray, with a horizontal blue stripe at eye level, across which is printed the word 'MEDICAL'. Underneath that are the words 'COMMUNITY/RECREATIONAL'. The doorframe is scorched around the edges."
        : "There is a door to the west painted slate gray, with a horizontal blue stripe at eye level, across which is printed the word 'MEDICAL'. Underneath that are the words 'COMMUNITY/RECREATIONAL'. A warning panel beside it flashes red.",
    describeFromB: (state) =>
      hasLevelTwoBombDetonated(state)
        ? "To the east is a plain metal door labeled 'STAIRS', warped, and marred with soot."
        : "To the east is a plain metal door labeled 'STAIRS'. A warning panel beside it flashes red.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairTwo", roomBId: "LevelTwoStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorThree",
    name: "stairwell access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairThree"
          ? `It's a heavy door painted slate gray, with the words 'COMMUNITY/RECREATIONAL' printed on it.`
          : `It's a heavy gray door that leads to the stairwell.`;
      return description;
    },
    descriptionFromA:
      "There is a door to the west painted slate gray, with the words 'COMMUNITY/RECREATIONAL' printed on it.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairThree", roomBId: "LevelThreeStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorFour",
    name: "stairwell access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairFour"
          ? `It's a heavy door painted slate gray, with three horizontal stripes at eye level; one orange, one yellow, and one green. The orange stripe has 'ZOOLOGICAL' printed across it, the yellow stripe has the words 'POWER GRID', and the green stripe has the word 'BOTANICAL'.`
          : `It's a heavy gray door that leads to the stairwell.`;
      return description;
    },
    descriptionFromA:
      "There is a heavy door to the west, painted slate gray with three horizontal stripes at eye level; one orange, one yellow, and one green. The orange stripe has 'ZOOLOGICAL' printed across it, the yellow stripe has the words 'POWER GRID', and the green stripe has the word 'BOTANICAL'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    kind: "standard",
    vocab: ["door"],
    connects: { roomAId: "StairFour", roomBId: "LevelFourStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "StairDoorSix",
    name: "stairwell access door",
    describe: (state: GameState, ctx: DescriptionContext) => {
      const description =
        ctx.roomId === "StairSix"
          ? `The door is painted slate gray, with a green horizontal stripe at eye level, across which is printed the word 'HYDROPONICS'. Beneath the stripe is the word 'STORAGE'.`
          : `It's a heavy gray door that leads to the stairwell.`;
      return description;
    },
    descriptionFromA:
      "There is a heavy door to the west, painted slate gray with a green horizontal stripe at eye level. Printed across the green stripe is the word 'HYDROPONICS', and underneath the stripe is printed the word 'STORAGE'.",
    descriptionFromB: "To the east is a plain metal door labeled 'STAIRS'.",
    description: `It's a sturdy-looking door, but doesn't appear to have any sort of lock or security scanner.`,
    kind: "standard",
    vocab: ["door", "stairwell door"],
    connects: { roomAId: "StairSix", roomBId: "LevelSixStairAccess" },
    directions: { fromA: "west", fromB: "east" },
    initiallyOpen: false,
    initiallyLocked: false,
  },
];
