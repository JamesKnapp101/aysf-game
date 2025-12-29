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
      onLoad: "You load the soft little projectile into the gas-powered gun.",
      onShoot:
        "You take careful aim and pull the trigger. With very little recoil the pressurized gun fires a sticky little projectile.",
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isContainer: true,
    allowedContentsIds: ["GelRound1", "GelRound2", "GelRound3"],
    capacity: 1,
    isShootable: true,
  },
  {
    id: "GelRound1",
    name: "soft projectile round",
    vocab: ["projectile", "soft", "blue"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky blue gel that has a tiny electronic device of some kind suspended in it.",
    location: "LivingQuartersSixWest",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
  {
    id: "GelRound2",
    name: "soft projectile round",
    vocab: ["projectile", "soft", "yellow"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky yellow gel that has a tiny electronic device of some kind suspended in it.",
    location: "LivingQuartersSixEast",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
  {
    id: "GelRound3",
    name: "soft projectile round",
    vocab: ["projectile", "soft", "red"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky red gel that has a tiny electronic device of some kind suspended in it.",
    location: "LivingQuartersSixEast",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
];
