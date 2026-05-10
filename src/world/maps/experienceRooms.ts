import { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";

export const experienceRooms: Room[] = [
  {
    id: "FallenCorpseMemory",
    name: "Memory: Stairwell",
    description:
      "You're in midair, wind rushing in your ears as you fall down the center of a building stairwell that dissolves into darkness at the edges.",
    exits: [],
  },
  {
    id: "HalvedCorpseMemory",
    name: "Memory: Sanyi Residence: Living Area",
    description: `You're standing in a spacious living area that doubles as an entryway and den. The interior is carpeted in a warm mocha, and on one wall is a holographic image of three identical-looking young men. Arranged around an impressive entertainment center is a large, U-shaped sectional with wooden trim and cream-colored upholstery. Across from the sectional is a large flat-screen television, currently dark and reflecting the room back at itself. Between the sectional and the television is a squat, glass-topped coffee table.`,
    exits: [],
  },
  {
    id: "SpinInstructorSpinStageMemory",
    name: "Memory: Spin Stage",
    description:
      "You're standing on a small podium overlooking the west side of the gym where you can make out the frantic movement of other people in the gym but everything beyond the stage is fuzzy and indistinct. Atop the podium sits a fancy-looking electronic stationary bike facing toward the east side of the gym its console still lit and waiting. A second speed dial is mounted beside the instructor bike, currently set to 20.",
    exits: [],
  },
  {
    id: "CrushedWeightlifterGymMemory",
    name: "Memory: Gymnasium: Weight Room",
    description:
      "This is the weight room portion of the gymnasium. Various weight machines fill one side of the room, their adjustable seats and cable stacks set at different heights. Benches and racks of free weights range from tiny all the way up to massive. Several large mirrors are mounted on the walls. The floor is covered in thick rubber matting to absorb the impact of dropped weights.",
    exits: [],
  },
];

export const experienceRoomsItems: Item[] = [
  {
    id: "HalvedCorpseMemoryClone",
    name: "clone",
    description: `The man looks angry, but also tired, even distraught. He looks like he hasn't slept in a while.`,
    sceneryDescription: `A young man, fit with short black hair but looking disheveled in a stained t-shirt and sweatpants. He stands in the doorway to the bedroom as if he's worried the woman will try and force her way in.`,
    location: "HalvedCorpseMemory",
    vocab: ["man", "clone", "gim"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "HalvedCorpseMemoryClone2",
    name: "guy",
    description: `He looks like some kind of higher-up, with an expensive suit and a gold watch on one thick wrist. His body is frozen in time, nothing stirring, and his face appears digitally scrambled.`,
    sceneryDescription: `Sitting behind the desk is a broad, heavyset man with thick wrists and fingers. He's wearing a suit and tie, but his face appears digitally scrambled, and his body is frozen.`,
    location: "",
    vocab: ["guy", "suit", "gold", "watch", "scrambled", "man"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 2,
    itemSize: 3,
  },
];
