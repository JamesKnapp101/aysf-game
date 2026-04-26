import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_STAGING_ROOM_ID } from "src/world/maps/levelFour/gamePreserveRules";

export const BEAR_ROOM_IDS = [
  "OpenSavanna",
  "RockyRidge",
  "TallGrass",
  "Waterhole",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
  "Thicket",
] as const;

export const BEAR_INITIAL_ROOM_ID = GAME_PRESERVE_STAGING_ROOM_ID;
export const BEAR_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export const bearItems: Item[] = [
  {
    id: "bear",
    name: "big brown bear",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "aggressive",
      trackingModes: ["sight", "scent"],
      homeRegion: [...BEAR_ROOM_IDS],
      memories: [],
    },
    description:
      "The bear is large, its big head level with your chest when on all fours, with a hulking, hairy body that looks like it could lift a car. Its mouth has plenty of sharp teeth, and long, thick black claws jut out from its massive paws.",
    location: BEAR_INITIAL_ROOM_ID,
    vocab: ["bear", "brown"],
    itemClass: "solid",
    itemWeight: 600,
    itemSize: 400,
    overrides: {
      tick: ({ state }: TickContext): GameState => state,
    },
  },
];
