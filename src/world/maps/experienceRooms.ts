import { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";

export const experienceRooms: Room[] = [
  {
    id: "FallenCorpseMemory",
    name: "Memory: Office",
    description:
      "You're standing inside of a large office, in front of [[SCENERY]]",
    exits: [],
  },
];

export const experienceRoomsItems: Item[] = [
  {
    id: "FallenCorpseMemoryDesk",
    name: "desk",
    description: `The desk looks like it hasn't moved in a hundred years, as obstinate as the man sitting behind it. The different items arranged on it are all related to certifications, awards, or promotions.`,
    sceneryDescription: `a big, heavy-looking wooden desk that's adorned with an array of little awards, along with a fancy engraved nameplate that reads 'Gatchland Umboltz, Chief of Population Logistics.'`,
    location: "FallenCorpseMemory",
    vocab: ["desk", "awards", "nameplate", "wooden", "engraved"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "FallenCorpseMemoryDeskGuy",
    name: "guy",
    description: `He looks like some kind of higher-up, with an expensive suit and a gold watch on one thick wrist. His body is frozen in time, nothing stirring, and his face appears digitally scrambled.`,
    sceneryDescription: `Sitting behind the desk is a broad, heavyset man with thick wrists and fingers. He's wearing a suit and tie, but his face appears digitally scrambled, and his body is frozen.`,
    location: "FallenCorpseMemory",
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
