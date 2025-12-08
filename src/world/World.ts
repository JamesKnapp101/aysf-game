import { LEVEL_FIVE } from "./maps/LevelFive";
import { LEVEL_FOUR } from "./maps/LevelFour";
import { LEVEL_ONE } from "./maps/LevelOne";
import { LEVEL_SEVEN } from "./maps/LevelSeven";
import { LEVEL_SIX } from "./maps/LevelSix";
import { LEVEL_THREE } from "./maps/LevelThree";
import { LEVEL_TWO } from "./maps/LevelTwo";
import { STAIRWELL } from "./maps/Stairwell";
import type { World, WorldChunk } from "./types";

function mergeWorldChunks(...chunks: WorldChunk[]): World {
  return {
    rooms: chunks.flatMap((c) => c.rooms),
    items: chunks.flatMap((c) => c.items),
    doors: chunks.flatMap((c) => c.doors),
  };
}

export const WORLD: World = mergeWorldChunks(
  LEVEL_ONE,
  LEVEL_TWO,
  LEVEL_THREE,
  LEVEL_FOUR,
  LEVEL_FIVE,
  LEVEL_SIX,
  LEVEL_SEVEN,
  STAIRWELL
);
