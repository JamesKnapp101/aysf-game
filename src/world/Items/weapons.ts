import type { Item } from "../../game/types/itemTypes";

export const weaponItems: Item[] = [
  // The camera gun and its ammo
  {
    id: "CameraGun",
    name: "lightweight pistol",
    vocab: ["gel", "gun", "viewer"],
    description:
      "A small, silvery gas-powered gun of some sort that has a little oval view-screen mounted on it.",
    location: "seeded",
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
    name: "blue projectile round",
    vocab: ["projectile", "soft", "blue", "round", "gelround", "gel", "camera"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky blue gel that has a tiny electronic device of some kind suspended in it.",
    location: "seeded",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
  {
    id: "GelRound2",
    name: "yellow projectile round",
    vocab: [
      "projectile",
      "soft",
      "yellow",
      "round",
      "gelround",
      "gel",
      "camera",
    ],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky yellow gel that has a tiny electronic device of some kind suspended in it.",
    location: "seeded",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
  {
    id: "GelRound3",
    name: "red projectile round",
    vocab: ["projectile", "soft", "red", "round", "gelround", "gel", "camera"],
    description:
      "It's some sort of small, soft projectile. It contains a blob of sticky red gel that has a tiny electronic device of some kind suspended in it.",
    location: "seeded",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isOn: false,
  },
];
