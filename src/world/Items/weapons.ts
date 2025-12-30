import type { Item } from "../../game/types/itemTypes";

export const weaponItems: Item[] = [
  // The camera gun and its ammo
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
  // The Mind Gun, not really a weapon but gun-like
  {
    id: "MindGun",
    name: " gun",
    vocab: [
      "high-tech gun",
      "electronic gun",
      "mindgun",
      "high-tech",
      "electronic",
    ],
    description:
      "It looks kind of like a pistol, in that it clearly has a grip, a trigger, and what looks like a barrel, but it doesn't look like a projectile weapon; the barrel is rectangular and it isn't hollow.  The end is fitted with some kind of small panel or cell, and the body of it is non-symetrical and a little cumbersome.  Printed on one side is the logo 'NexiCorp'.  It appears to contain a lot of wires and circuitry.",
    initialDescription:
      "Lying in the middle of the floor is what looks like some kind of strange, high-tech pistol.",
    location: "LivingQuartersFiveEast",
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
    name: "stretchy, wired cap",
    vocab: ["cap", "headdress", "squid"],
    description:
      "The cap consists of a series of silvery components meshed together in a web with some kind of metallic filaments. It can be draped over the head almost like a wig. The logo 'NexiCorp' is printed on one of the components.",
    location: "LivingQuartersFiveEast",
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: true,
    clothingSlot: "head",
  },
];
