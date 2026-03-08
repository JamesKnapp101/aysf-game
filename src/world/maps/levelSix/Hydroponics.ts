import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const hydroponicsRooms: Room[] = [
  {
    id: "HydroponicsPlatform",
    name: "Hydroponics: Central Platform Top",
    description: `You're standing on a huge, circular platform suspended near the top of a massive, metal silo. [[SCENERY]]`,
    exits: [
      { direction: "north", doorId: "HydroponicsDoor" },
      { direction: "west", toRoomId: "HydroponicsPlatformAdmin" },
      { direction: "down", toRoomId: "HydroponicsPlatformMid" },
    ],
  },
  {
    id: "HydroponicsPlatformAdmin",
    name: "Hydroponics: Admin Office",
    description: `This is an enclosed office space that looks out across the platform to walls of lush green. The office is a utilitarian affair, tiled floor and plain white walls, with a [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "HydroponicsPlatform" }],
  },
  {
    id: "HydroponicsPlatformMid",
    name: "Hydroponics: Central Platform Middle",
    description: `This narrow middle platform is half-lost beneath webbing anchored to railings, pipes, and the underside of the upper deck. The air is hot, damp, and rank with plant rot. [[SCENERY]] The platform continues up toward the entry level and down into the shadowed space beneath the web canopy.`,
    exits: [
      { direction: "up", toRoomId: "HydroponicsPlatform" },
      { direction: "down", toRoomId: "HydroponicsPlatformBottom" },
    ],
  },

  {
    id: "HydroponicsPlatformBottom",
    name: "Hydroponics: Underneath Web",
    description: `You stand beneath the main Hydroponics platform where the chamber opens into a humid hollow of hanging roots, draped leaves, and ropes of silk. The web canopy above filters the light into a pale, greasy glow. [[SCENERY]] Passages through the webbing branch away in all four diagonal directions, while the central platform rises back up above you.`,
    exits: [
      { direction: "up", toRoomId: "HydroponicsPlatformMid" },
      { direction: "northwest", toRoomId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "UnderWebTwo" },
      { direction: "southwest", toRoomId: "UnderWebThree" },
      { direction: "southeast", toRoomId: "UnderWebFour" },
    ],
  },

  {
    id: "UnderWebOne",
    name: "Web Underhang",
    description: `This pocket beneath the canopy is hemmed in by drooping sheets of silk attached to bent grow frames and dead stalks. Moisture beads on every strand, making the whole place glisten when the light catches it. [[SCENERY]] Narrow ways lead east, south, and back southeast toward the central space.`,
    exits: [
      { direction: "east", doorId: "UnderWebTwo" },
      { direction: "southeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebThree" },
    ],
  },
  {
    id: "UnderWebTwo",
    name: "Web Corner",
    description: `The canopy bunches thickly here in a corner of torn foliage and web-choked support struts. The air feels close, and every shift of your weight sends small tremors through the silk overhead. [[SCENERY]] Paths run west, south, and back southwest toward the area beneath the central platform.`,
    exits: [
      { direction: "west", doorId: "UnderWebOne" },
      { direction: "southwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebThree",
    name: "Web Pocket",
    description: `The webbing dips low here between clusters of withered growth trays and dangling roots, forming a cramped recess that smells of wet vegetation and something sharper underneath. [[SCENERY]] The silk-wrapped passages continue north, east, and back northeast toward the center.`,
    exits: [
      { direction: "north", doorId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "east", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebFour",
    name: "Web Grotto",
    description: `This far pocket of Hydroponics feels almost cave-like, enclosed by sheeted web and curtains of dead vines. The filtered light is dimmer here, leaving the silk overhead with a dull pearly sheen. [[SCENERY]] The only ways out are west, north, or back northwest toward the center beneath the canopy.`,
    exits: [
      { direction: "west", doorId: "UnderWebThree" },
      { direction: "northwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "north", toRoomId: "UnderWebThree" },
    ],
  },
];

export const hydroponicsItems: Item[] = [
  // Platform top
  {
    id: "HydroponicsDome",
    name: "domed ceiling",
    description:
      "The dome looms overhead, reaching up into the shadows. You can see sheets of translucent webbing crossing the gap, up there, moving in the convected warmth.",
    sceneryDescription: " Above is a high, domed ceiling ",
    location: "HydroponicsPlatform",
    vocab: ["dome", "ceiling", "silo"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "HydroponicsDomeWebs",
    name: "dome webbing",
    description: "The sheets of translucent webbing stir in the rising warmth.",
    sceneryDescription:
      "where some sort of fabric or webbing hangs in layers, like giant hammocks that billow occasionally when the air currents shift. ",
    location: "HydroponicsPlatform",
    vocab: ["fabric", "webbing", "hammock", "hammocks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "HydroponicsPipesTop",
    name: "hydroponic pipes",
    description:
      "The pipes start at the base of the platform and are about a half-meter in diameter, running the circumference of the platform. Each ring is stacked upon the last, with a half-meter gap between them to give the plants room to grow. Each pipe has openings at regular intervals where different plants sprout.",
    sceneryDescription:
      "Circling the edges of the platform are layers upon layers of thick piping, with a half-meter gap between them, ",
    location: "HydroponicsPlatform",
    vocab: ["pipes", "pipe", "piping", "wall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "HydroponicsPlantsTop",
    name: "hydroponic plants",
    description:
      "You couldn't even begin to identify all of them, but you do recognize some, such as what looks like a wall of carrot greens, then feathery fennel greens. They seem to be exclusively food crops.",
    sceneryDescription:
      "and sprouting from openings in the pipes at regular intervals are a staggering array of plant life. The plants from each row drape down toward the next to form a continuous wall of lush green that circles the platform, stirring in a gentle updraft from below. ",
    location: "HydroponicsPlatform",
    vocab: ["plants", "plant", "vegetation", "carrot", "greens", "fennel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "HydroponicsFloorTop",
    name: "floor",
    description:
      "The floor consists of a metal grate that is sturdy but still offers some view of what is going on below.",
    sceneryDescription:
      "The floor is all metal grating, allowing a view down to the platform beneath it.[[newline]]",
    location: "HydroponicsPlatform",
    vocab: ["floor", "grate", "platform"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "HydroponicsAdminTop",
    name: "floor",
    description:
      "It's a small enclosed structure with an open doorway that looks inside. It looks like some kind of office in there.",
    sceneryDescription:
      "[[newline]]To the west is a small, enclosed structure with an open door on its east wall. Over the door is a sign that reads 'Admin'",
    location: "HydroponicsPlatform",
    vocab: ["structure", "office", "admin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 100,
    },
  },
  // Admin Office
  {
    id: "AdminOfficeDesk",
    name: "admin desk",
    description:
      "The desk is old, and worn. It looks like it hasn't moved from that spot in a long time.",
    sceneryDescription:
      "single large desk that looks out toward the exit from the northwestern corner of the room. ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["desk", "large", "old"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "AdminOfficeTerminal",
    name: "admin terminal",
    description:
      "The computer terminal looks as old as the desk itself, but is quite alive, with green readout visible on the black screen.",
    sceneryDescription:
      "Sitting on the desk is a computer terminal, next to which is ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["computer", "terminal"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "AdminOfficeDeskKitsch",
    name: "desk kitsch",
    description: "It's cute, if you're into that sort of thing.",
    sceneryDescription:
      "a little sculpture of three plants with smiling faces sprouting from a section of hydroponics pipe, and a little sign that reads 'I'm Always Wetting My Plants'. ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["sculpture", "kitsch"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "AdminOfficeWastebin",
    name: "waste bin",
    description: "It's a black plastic waste bin, with no liner.",
    sceneryDescription:
      "[[newline]]Next to the desk is a plastic waste bin with no liner.",
    location: "HydroponicsPlatformAdmin",
    vocab: ["trash", "waste", "bin", "wastebin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 4,
    },
    isContainer: true,
    isOpenable: false,
  },
  {
    id: "AdminOfficeWastebinNote",
    name: "Crumpled Note",
    description: "It's a wrinkled piece of paper with writing on it.",
    readableText: `This is a note found in the trash of the admin office`,
    location: "seeded",
    vocab: ["note", "paper", "wrinkled"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
    isLoggable: true,
  },
  {
    id: "AdminOfficeBinder",
    name: "three-ring binder",
    description: "It's a binder that holds a small stack of papers.",
    initialDescription: `Sitting on the desk next to the terminal is a binder containing a thin stack of papers.`,
    readableText: `This is all the juicy binder data.`,
    location: "HydroponicsPlatformAdmin",
    vocab: ["binder", "three-ring"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
  },
];
