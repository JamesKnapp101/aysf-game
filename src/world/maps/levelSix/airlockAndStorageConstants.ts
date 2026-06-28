export const LEVEL_SIX_AIRLOCK_ROOM_ID = "LevelSixCorridor";
export const LEVEL_SIX_BREACH_ITEM_ID = "LevelSixStorageHullBreach";
export const LEVEL_SIX_BREACH_SCORE_ID = "sealed_level_six_breach";
export const LEVEL_SIX_BREACH_SEALED_TRIGGER =
  "LevelSixStorageBreachSealed";
export const LEVEL_SIX_FLEX_PLUG_ID = "LevelSixFlexPlug";
export const LEVEL_SIX_SPACE_SUIT_ID = "LevelSixSpaceSuit";

export const LEVEL_SIX_STORAGE_ROOM_IDS = [
  "StorageQuadOne",
  "StorageQuadTwo",
  "StorageQuadThree",
  "StorageQuadFour",
  "StorageQuadOneMid",
  "StorageQuadTwoMid",
  "StorageQuadThreeMid",
  "StorageQuadFourMid",
  "StorageQuadOneTop",
  "StorageQuadTwoTop",
  "StorageQuadThreeTop",
  "StorageQuadFourTop",
  "RIFT",
] as const;

export const LEVEL_SIX_INITIAL_VACUUM_ROOM_IDS = [
  LEVEL_SIX_AIRLOCK_ROOM_ID,
  ...LEVEL_SIX_STORAGE_ROOM_IDS,
] as const;
