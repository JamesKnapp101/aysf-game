import type { Item } from "@game/types/itemTypes";

export const restaurantKitchenItems: Item[] = [
  {
    id: "FridgeDoor",
    name: "steel door",
    description:
      "A heavy steel door marks the entrance to a walk-in fridge. A solid-looking padlock hangs from the latch.",
    sceneryDescription:
      "The door is all business: thick insulated metal with a recessed handle and a rubber gasket sealing it against the cold inside. The padlock on the latch is big enough to belong on a storage crate, its body scarred by years of use and more than a few frustrated attempts to bypass it.",
    location: "Kitchen",
    vocab: ["steel", "fridge", "refridgerator", "refrigerator", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "The door doesn’t budge. As long as that padlock is in place, the fridge is just an especially unfriendly wall.",
    },
  },
  {
    id: "strayCrap",
    name: "stray food",
    description:
      "Stray bits of food are scattered across the kitchen floor: dried pasta, flour dust, stale crumbs. None of it is remotely useful anymore.",
    sceneryDescription:
      "The floor is a map of recent chaos—smears of sauce, broken bits of bread, a dusting of flour that turns footprints into ghostly negatives. A few strands of pasta have fused themselves to the tiles, fossilized mid-spill.",
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
      "A large, heavy padlock secures the fridge door, its hardened shackle threaded through a steel hasp.",
    sceneryDescription:
      "The padlock is the kind of over-engineered hardware you buy when you don’t trust people or the universe. The metal is scarred and pitted, but the keyway is clean, suggesting it’s been used regularly. If there’s a combination etched anywhere, it’s not on the outside.",
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
      open: "Without a key or some very creative problem solving, that padlock isn’t going anywhere.",
      take: "You tug on the padlock, but it’s firmly attached to both the hasp and the problem of your life right now.",
    },
  },
];
