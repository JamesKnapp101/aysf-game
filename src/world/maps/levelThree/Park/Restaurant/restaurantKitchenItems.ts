import type { Item } from "@game/types/itemTypes";

export const restaurantKitchenItems: Item[] = [
  {
    id: "CarvingKnife",
    name: "carving knife",
    description:
      "A long, narrow carving knife with a sharp steel blade and a firm black handle. It was made for taking precise slices from a much larger piece of meat.",
    initialDescription: "A carving knife lies on the kitchen counter.",
    location: "Kitchen",
    vocab: ["knife", "carving knife", "carving", "blade"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 2,
  },
  {
    id: "FridgeDoor",
    name: "steel door",
    description:
      "A heavy insulated steel door marks the entrance to the walk-in freezer. An open padlock hangs loose from its latch.",
    location: "Kitchen",
    vocab: ["steel", "fridge", "refrigerator", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "strayCrap",
    name: "stray food",
    description:
      "Stray bits of food are scattered across the kitchen floor: dried pasta, flour dust, stale crumbs.",
    location: "Kitchen",
    vocab: ["stray", "pasta", "flour", "bread", "crumbs", "pieces", "food"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      taste:
        "If you’re seriously thinking about eating floor pasta, things are worse than you thought.",
    },
  },
  {
    id: "BigASSPadlock",
    name: "heavy padlock",
    description:
      "A large, heavy padlock hangs open from the freezer door's hasp. Its shackle is unfastened.",
    location: "Kitchen",
    vocab: ["heavy", "padlock", "lock"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "The padlock is already open and hanging loose from the hasp.",
      take: "The open padlock is still tethered to the hasp. You leave it hanging there.",
    },
  },
];
