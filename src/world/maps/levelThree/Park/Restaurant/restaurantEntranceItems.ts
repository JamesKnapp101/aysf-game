import type { Item } from "@game/types/itemTypes";

export const restaurantEntranceItems: Item[] = [
  {
    id: "PatioTablesChairs",
    name: "patio furniture",
    description:
      "A scattering of wrought-iron patio tables and chairs occupies the space outside the restaurant.",
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
    location: "RestaurantEntrance",
    vocab: ["rustic", "sign", "wooden", "eatery"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: true,
    readableText: "Saveurs du Passé",
    isContainer: false,
  },
  {
    id: "EATERYDOOR",
    name: "glass door",
    description:
      "A glass-fronted automatic door forms the main entrance to the restaurant.",
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
      open: "The doors are already stuck open.",
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
