import type { Item } from "../../game/types/itemTypes";

export const badgeItems: Item[] = [
  {
    id: "pinkbadge",
    name: "pink plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely pink. It doesn't have any insignia, name, rank, or bar code.",
    location: "INVENTORY",
    vocab: ["badge", "pink", "plastic", "pink badge"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText:
      "This pink badge entitles the carrier to one free pink badge.",
    scoreId: "obtained_pink_badge",
  },

  {
    id: "blackbadge",
    name: "black plastic badge",
    initialDescription:
      "Peeking out of the Captain's breast pocket is what looks like a black badge.",
    description:
      "This is another slim plastic badge, but it doesn't have a clip like the others. It is a glossy jet black.",
    location: "INVENTORY",
    vocab: ["black", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_black_badge",
  },

  {
    id: "greybadge",
    name: "grey plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely grey except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'ORVILLE BRIGGS, BC2' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["badge", "grey", "gray", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_grey_badge",
  },

  {
    id: "brownbadge",
    name: "brown plastic badge",
    initialDescription:
      "From inside the shredded torso of the space suit, you can see a brown badge peeking out of the corpse's breast pocket.",
    description:
      "This is a slim, rectangular plastic badge that is entirely brown except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'EDWARD GAINS, E1' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["badge", "brown", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_brown_badge",
  },

  {
    id: "bluebadge",
    name: "blue plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely blue except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'KIRA DANKO, 2ME' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["blue", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_blue_badge",
  },

  {
    id: "greenbadge",
    name: "green plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely green except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'A. RIDDEL, 2BE' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["green", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_green_badge",
  },

  {
    id: "yellowbadge",
    name: "yellow plastic badge",
    initialDescription: "Lying in the damp grass is a sooty yellow badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely yellow except for a black insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'JOHN RAWLINS, EE2' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["yellow", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_yellow_badge",
  },

  {
    id: "whitebadge",
    name: "white plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely white except for a black insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'WILLIAM VESCO, C0' and beneath that a bar code of some kind.",
    location: "INVENTORY",
    vocab: ["white", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_white_badge",
  },
];
