import type { Item } from "../../game/types/itemTypes";

export const weaponItems: Item[] = [
  {
    id: "CameraGun",
    name: "gas gun",
    vocab: ["gel", "gun", "viewer"],
    description:
      "A small, silvery dart gun of some sort that fires sticky gel projectiles.",
    location: "LivingQuartersFiveEast",
    meta: {
      kind: "camera-gun-viewer",
      weapon: {
        onLoad: "You load the soft little projectile into the gas-powered gun.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isContainer: true,
    capacity: 1,
  },
  {
    id: "GelRound1",
    name: "soft projectile round",
    vocab: ["projectile", "soft"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky gel that has a tiny electronic device of some kind suspended in it.",
    location: "LivingQuartersSixWest",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
];
