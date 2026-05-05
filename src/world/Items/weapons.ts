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
    location: "INVENTORY",
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
  // The Mind Gun, not really a weapon but gun-like
  {
    id: "MindGun",
    name: "electronic scanner",
    vocab: ["cylinder", "antenna", "sensor", "reader", "scanner", "electronic"],
    description:
      "It's not immediately clear what the device does. It has a grip at one end, and at the other end is a cylinder wrapped in a fine wire mesh that seems like it's meant to be pointed at things, so perhaps a scanner of some sort. Printed on one side is a logo for 'NexiCorp'. It appears to contain a lot of wires and circuitry.",
    location: "seeded",
    meta: {
      onLoad: "It doesn't seem to take any ammo, nor does it have a barrel.",
      onLink:
        "The strangest feeling washes over you and you feel a wave of intense dizziness which passes almost instantly. In your head, a soft voice which is not your own says 'Link established...', and before you can even wonder what that means you suddenly sense a flood of thoughts pouring into your mind...thoughts which are not yours...",
      onShootNoCap:
        "As you pull the trigger the gun lets out a extremely low hum that sets your teeth on edge, but nothing else seems to happen.",
      onShootWithCap:
        "As you pull the trigger the gun lets out a extremely low hum that sets your teeth on edge, and you feel your scalp tingle underneath the electronic cap.",
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isShootable: true,
  },
  {
    id: "MindCap",
    name: "wired cap",
    vocab: ["cap", "headdress", "squid"],
    description:
      "The cap consists of a series of silvery components meshed together in a web with some kind of metallic filaments all run through a stretchy fabric which can be fitted over the head. The logo 'NexiCorp' is printed on one side of it.",
    location: "LivingQuartersThreeEast",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: true,
    clothingSlot: "head",
  },
];
