import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_STAGING_ROOM_ID } from "src/world/maps/levelFour/gamePreserveRules";

export const BOAR_ROOM_IDS = [
  "OpenSavanna",
  "RockyRidge",
  "TallGrass",
  "Waterhole",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
] as const;

export const BOAR_INITIAL_ROOM_ID = GAME_PRESERVE_STAGING_ROOM_ID;
export const BOAR_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export const boarItems: Item[] = [
  {
    id: "boar",
    name: "bristly brown boar",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "aggressive",
      trackingModes: ["scent"],
      homeRegion: [...BOAR_ROOM_IDS],
      memories: [],
    },
    description:
      "The boar is broad, low to the ground, and packing a pair of sharp tusks that the cuter pink variety don't have. Its about the size of a large dog, with a rugged, muscular body covered in coarse bristles.",
    location: BOAR_INITIAL_ROOM_ID,
    vocab: ["boar", "pig", "hog"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
    overrides: {
      tick: ({ state }: TickContext): GameState => state,
    },
  },
];
