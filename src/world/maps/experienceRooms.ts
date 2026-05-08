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
