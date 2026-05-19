import type { Item } from "@game/types/itemTypes";

export const parkMaintenanceItems: Item[] = [
  {
    id: "ParkMaintenanceConcreteStructure",
    name: "concrete structure",
    description:
      "The concrete structure is roughly fifteen feet on a side and one story tall.",
    sceneryDescription:
      "a concrete structure sits, roughly fifteen feet on a side, and a single story tall. An oval sign mounted on top of the structure reads 'Park Maintenance', though you don't see any door to enter through.",
    location: "ParkMaintenance",
    vocab: ["concrete", "structure", "building", "sign", "maintenance"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 300,
    itemSize: 10,
    isReadable: true,
    readableText: "Park Maintenance",
  },
  {
    id: "ParkMaintenanceMovieTheaterView",
    name: "movie theater front",
    description:
      "The movie theater front is visible to the north, complete with posters and a marquee.",
    sceneryDescription:
      "To the north you see the front of a single screen movie theater, with different movie posters in the windows and a marquee advertising the movie 'OUR JOURNEY HOME: CHAPTER 542'.",
    location: "ParkMaintenance",
    vocab: ["movie", "theater", "theatre", "posters", "marquee", "windows"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 50,
    itemSize: 8,
    isReadable: true,
    readableText: "OUR JOURNEY HOME: CHAPTER 542",
  },
  {
    id: "ParkMaintenanceRestaurantView",
    name: "restaurant entrance",
    description:
      "The entrance to Saveurs du Passé stands south of the maintenance depot.",
    sceneryDescription:
      "To the south is the entrance to an upscale restaurant called 'Saveurs du Passé'.",
    location: "ParkMaintenance",
    vocab: ["restaurant", "entrance", "saveurs", "passe", "passé"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 50,
    itemSize: 8,
    isReadable: true,
    readableText: "Saveurs du Passé",
  },
  {
    id: "ParkMaintenanceObeliskView",
    name: "towering white obelisk",
    description:
      "The central obelisk rises east of here, bright and impossible to miss.",
    sceneryDescription:
      "To the east you can see the towering white obelisk standing over everything.",
    location: "ParkMaintenance",
    vocab: ["obelisk", "white", "towering", "monument"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 500,
    itemSize: 10,
  },
  {
    id: "ParkMaintenanceConcreteSlope",
    name: "concrete slope",
    description:
      "A gentle concrete slope leads from the entryway down to the open floor.",
    sceneryDescription:
      "From the entryway, a gentle concrete slope leads down to an open floor.",
    location: "ParkMaintenanceInterior",
    vocab: ["slope", "concrete", "entryway", "floor"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 100,
    itemSize: 10,
  },
  {
    id: "ParkMaintenanceSortingBins",
    name: "sorting bins",
    description:
      "A series of large bins waits along the southern wall for sorted waste.",
    sceneryDescription:
      "A series of separate large bins are lined up along the southern wall.",
    location: "ParkMaintenanceInterior",
    vocab: [
      "bins",
      "bin",
      "organic",
      "e-waste",
      "paper",
      "metal",
      "glass",
      "plastic",
      "biological",
      "toxic",
      "waste",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 200,
    itemSize: 10,
  },
  {
    id: "ParkDumpster",
    name: "large dumpster",
    description: `It's a large, sunken dumpster, filled with heaps of trash.`,
    sceneryDescription: `The first bin in the sequence contains heaps of trash ranging from discarded candy wrappers and lost toys to things like half eaten food and worse.`,
    location: "ParkMaintenanceInterior",
    vocab: ["dumpster", "trash", "dump"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    isContainer: true,
    isOpenable: false,
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "ParkMaintenanceSorterArms",
    name: "robotic sorting arms",
    description:
      "Robotic arms hang from an overhead runner, powered down in the middle of their sorting route.",
    sceneryDescription:
      "From there, a series of robotic arms on an overhead runner would sort the trash into the different bins; organic waste, e-waste, paper waste, metal and glass waste, plastic waste, biological waste, and toxic waste, but the sorting mechanism is powered down at the moment.",
    location: "ParkMaintenanceInterior",
    vocab: [
      "arms",
      "robotic",
      "runner",
      "sorting",
      "mechanism",
      "sorter",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 100,
    itemSize: 8,
  },
];
