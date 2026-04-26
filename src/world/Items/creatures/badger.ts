import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { GAME_PRESERVE_STAGING_ROOM_ID } from "src/world/maps/levelFour/gamePreserveRules";

export const BADGER_ROOM_IDS = [
  "OpenSavanna",
  "TallGrass",
  "UnusedPen",
  "Mudflats",
  "RuinedWall",
  "DrainagePipe",
  "DeadOak",
] as const;

export const BADGER_INITIAL_ROOM_ID = GAME_PRESERVE_STAGING_ROOM_ID;
export const BADGER_RETRY_RESPAWN_ROOM_ID = "GamePreservePortal";

export const badgerItems: Item[] = [
  {
    id: "badger",
    name: "muscled black-and-white badger",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "normal",
      hostility: "aggressive",
      trackingModes: ["scent"],
      homeRegion: [...BADGER_ROOM_IDS],
      memories: [],
    },
    description:
      "The badger is compact, brutal-looking, and built like a small industrial accident. Its striped face is almost neat compared with the thick forequarters and digging claws that look more than capable of opening you up.",
    location: BADGER_INITIAL_ROOM_ID,
    vocab: ["badger"],
    itemClass: "solid",
    itemWeight: 80,
    itemSize: 40,
    overrides: {
      tick: ({ state }: TickContext): GameState => state,
    },
  },
];
