import { flashlightOn } from "@game/helpers/gameHelpers";
import type { TickContext } from "@game/types/context";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { organismLQOverrideTick } from "src/world/Items/creatures/livingQuartersThreeWestOrganisms";

export const barBasementItems: Item[] = [
  {
    id: "BarBasementLiquorBoxes",
    name: "liquor boxes",
    description:
      "The boxes are stacked tight along the walls, each packed with bottles and labeled by brand, proof, and optimistic inventory codes.",
    sceneryDescription:
      "Stacks of boxes containing liquor bottles are arranged along the walls, along with drink garnishes like olives, cocktail onions, fruit, and celery, and crates containing replacement glassware.",
    location: "BarBasement",
    vocab: [
      "boxes",
      "liquor",
      "bottles",
      "garnishes",
      "olives",
      "onions",
      "fruit",
      "celery",
      "glassware",
      "crates",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 12,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarBasementSteps",
    name: "wooden steps",
    description:
      "The wooden steps lead back up to the bar through the open panel above.",
    sceneryDescription:
      "A set of wooden steps leads back up to the bar, visible through the open panel above.",
    location: "BarBasement",
    vocab: ["steps", "stairs", "wooden steps", "panel", "open panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarBasementStainedClothing",
    name: "stained clothing",
    description:
      "The clothing is strewn on the basement floor, stained brown and red.",
    sceneryDescription:
      "Near one edge of the hatch above, the floor is strewn articles of clothing, all stained brown and red.",
    location: "BarBasement",
    vocab: ["clothing", "clothes", "stained clothing", "stains"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 4,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarBasementTornPants",
    name: "torn pants",
    description:
      "The pants are torn and stained, lying on the floor. Two feet sprout from the otherwise empty legs, heels pointing toward the hatch above.",
    sceneryDescription:
      "A pair of torn, stained pants lie on the floor, with two feet sprouting from the otherwise empty legs, toes pointing up toward the hatch.",
    location: "BarBasement",
    vocab: ["pants", "torn pants", "feet", "legs", "heels"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 4,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarBasementShirtApron",
    name: "torn t-shirt and apron",
    description:
      "The t-shirt is torn and bloodstained. The apron beside it still has its ties knotted, which is somehow worse.",
    sceneryDescription:
      "Next to thant is a torn t-shirt, stained with blood, along with an apron with the ties still knotted.",
    location: "BarBasement",
    vocab: ["shirt", "t-shirt", "torn shirt", "apron", "ties", "blood"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "BarBasementHead",
    name: "man's head",
    description:
      "The man's face is slack and ashen. The stump of the neck shows signs of some sort of burning, or melting.",
    sceneryDescription:
      "[[newline]]Resting against the wall opposite the stairs is a man's head, face slack and ashen. The stump of the neck shows signs of some sort of burning, or melting.",
    location: "BarBasement",
    vocab: ["head", "man's head", "man", "corpse", "body", "neck"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 6,
    itemSize: 3,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "bar_basement_head_memory",
      },
      sceneryDescriptionOrder: 6,
    },
  },
  {
    id: "BarBasementOrganism",
    name: "organism-bar-basement",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      moveChance: 0,
    },
    description: "You can't see it...",
    initialDescription:
      "Between two stacks of boxes is a tall, vaguely humanoid mannequin made from a glassy, black material. It stands in the approximate position of someone on their toes, peeking up over something.",
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return "The shape is definitely humanoid, with spindly limbs and a head like the end of a burned matchstick. The surface is black like volcanic glass but the surface is covered in fine, complex ridges and wrinkles.";
      }
      return "...you can't see it.";
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return "Between two stacks of boxes is a tall, vaguely humanoid mannequin made from a glassy, black material. It stands in the approximate position of someone on their toes, peeking up over something.";
      }
      return "...you can't see it.";
    },
    location: "BarBasement",
    vocab: ["sculpture", "mannequin", "statue", "organism"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void =>
        organismLQOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        ),
    },
  },
];
