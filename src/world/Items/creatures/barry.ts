import { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_ANIMAL_PROFILES } from "src/world/maps/levelFour/gamePreserveRules";

export const BARRY_ROOM_IDS = [
  ...GAME_PRESERVE_ANIMAL_PROFILES.barry.patrolRoomIds,
];

export const BARRY_INITIAL_ROOM_ID =
  GAME_PRESERVE_ANIMAL_PROFILES.barry.initialRoomId;
export const BARRY_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export const barryItems: Item[] = [
  {
    id: "barry",
    name: "baffled bewildered barry",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "hostile",
      homeRegion: [...BARRY_ROOM_IDS],
      memories: [],
    },
    description:
      "As far as you can tell it's another normal human, albeit a naked one. He has a head of wavy black hair, and appears to be a little confused.",
    location: BARRY_INITIAL_ROOM_ID,
    vocab: ["barry", "person", "man"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
  },
];
