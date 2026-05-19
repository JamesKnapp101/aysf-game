import type { Item } from "@game/types/itemTypes";

export const parkWestItems: Item[] = [
  {
    id: "ParkWestMaintenanceDepotView",
    name: "maintenance depot",
    description:
      "The concrete maintenance structure sits east of here, plain and square beneath its sign.",
    sceneryDescription:
      "To the east you can see a square concrete structure with a sign on top reading 'Park Maintenance', and beyond that the white obelisk stretches up into the air.",
    location: "ParkWest",
    vocab: ["maintenance", "depot", "structure", "concrete", "sign"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 200,
    itemSize: 10,
  },
  {
    id: "DistMarquee",
    name: "distant movie theater",
    description:
      "The theater entrance is visible to the northeast, but the marquee is too far away to read clearly.",
    sceneryDescription:
      "You can see the entrance to a small movie theater to the northeast, but can't make out the marquee from here.",
    location: "ParkWest",
    vocab: ["movie", "theater", "theatre", "marquee", "entrance"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 50,
    itemSize: 8,
  },
  {
    id: "ParkWestRestaurantView",
    name: "restaurant sign",
    description:
      "The sign marks a high-end restaurant southeast of here.",
    sceneryDescription:
      "To the southeast is the entryway to a high-end restaurant whose sign reads 'Saveurs du Passé'.",
    location: "ParkWest",
    vocab: ["restaurant", "sign", "entryway", "saveurs", "passe", "passé"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 20,
    itemSize: 4,
    isReadable: true,
    readableText: "Saveurs du Passé",
  },
  {
    id: "ParkWestSpaArch",
    name: "large spa arch",
    description:
      "A large arch frames the way west into a luxurious-looking spa.",
    sceneryDescription:
      "To the west, the park grass gives way to paved stone where a large arch leads into a luxurious looking spa.",
    location: "ParkWest",
    vocab: ["spa", "arch", "stone", "paved", "luxurious"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 200,
    itemSize: 10,
  },
];
