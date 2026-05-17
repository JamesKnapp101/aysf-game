import type { Item } from "@game/types/itemTypes";

export const restaurantEntranceItems: Item[] = [
  {
    id: "PatioTablesChairs",
    name: "patio furniture",
    description:
      "A scattering of wrought-iron patio tables and chairs occupies the space outside the restaurant.",
    sceneryDescription:
      "The furniture is all curls and scrollwork, black-painted iron that has weathered into a patchy mix of matte and shine. Chairs are pushed back at odd angles as if their owners stood up mid-conversation and never came back. A few tabletops still bear the circular scars of long-gone drinks.",
    location: "RestaurantEntrance",
    vocab: ["patio", "table", "tables", "chair", "chairs", "furniture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 6,

    overrides: {
      siton:
        "You settle into one of the wrought-iron chairs. It creaks slightly, but otherwise pretends nothing’s wrong.",
    },
  },
  {
    id: "EATERYSIGN",
    name: "rustic sign",
    description:
      "A weathered, rustic-looking sign hangs over the entrance, the lettering clearly done by hand.",
    sceneryDescription:
      "The sign is carved from a single slab of wood, its edges rough-hewn and uneven. Hand-painted letters announce the restaurant’s name in a style that’s trying hard to be charming and just about gets there. Faint cracks radiate out from the mounting bolts, like the sign has been quietly protesting its workload for years.",
    location: "RestaurantEntrance",
    vocab: ["rustic", "sign", "wooden", "eatery"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: true,
    readableText: "THE EATERY AT HUB SQUARE",
    isContainer: false,
  },
  {
    id: "EATERYDOOR",
    name: "glass door",
    description:
      "A glass-fronted automatic door forms the main entrance to the restaurant.",
    sceneryDescription:
      "The door panels are mostly clear, smudged here and there with old fingerprints and the faint streaks of hurried cleaning. A thin sensor strip runs along the top, its status light dark now. The whole assembly looks poised to glide open at the slightest approach, but nothing moves.",
    location: "RestaurantEntrance",
    vocab: ["glass", "door", "automatic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "You give the door a shove. Without power, it fights you like a stubborn elevator, but it’ll move if you really insist.",
    },
  },
  {
    id: "ROOF",
    name: "roof",
    description:
      "The restaurant’s roof extends out in a shallow overhang, sheltering the entrance and patio.",
    sceneryDescription:
      "From underneath, the roof is a grid of support beams and panels, painted a soft neutral color that tries not to draw attention to itself. Recessed lights stare down like tired eyes, several of them dark, leaving uneven pools of illumination on the ground below.",
    location: "RestaurantEntrance",
    vocab: ["roof", "overhang", "awning"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
];
