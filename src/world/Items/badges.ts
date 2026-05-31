import { isGymWeightlifterPinningBadge } from "src/world/maps/levelThree/Park/Gym/gymWeightlifterPuzzle";
import type { GameState } from "../../game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";

export const badgeItems: Item[] = [
  {
    id: "inframaroonbadge",
    name: "inframaroon plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely inframaroon. It doesn't have any insignia, name, rank, or bar code.",
    location: "seeded",
    vocab: ["badge", "inframaroon", "plastic", "inframaroon badge"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isContainer: false,
    scoreId: "obtained_inframaroon_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "ultravioletbadge",
    name: "ultraviolet plastic badge",
    initialDescription:
      "Peeking out of the Captain's breast pocket is what looks like a black badge.",
    description:
      "This is another slim plastic badge, but it doesn't have a clip like the others. It is a glossy jet black.",
    location: "seeded",
    vocab: ["ultraviolet", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_ultraviolet_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "maroonbadge",
    name: "maroon plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely maroon except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'ORVILLE BRIGGS, BC2' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["badge", "maroon", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_maroon_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "violetbadge",
    name: "violet plastic badge",
    initialDescription:
      "From inside the shredded torso of the space suit, you can see a violet badge peeking out of the corpse's breast pocket.",
    description:
      "This is a slim, rectangular plastic badge that is entirely violet except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'EDWARD GAINS, E1' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["badge", "violet", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_violet_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "bluebadge",
    name: "blue plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely blue except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'KIRA DANKO, 2ME' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["blue", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_blue_badge",
    meta: {
      kind: "security-badge",
    },
  },
  {
    id: "orangebadge",
    name: "orange plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely orange except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name '' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["orange", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_orange_badge",
    overrides: {
      take: ({ state }: { state: GameState }) =>
        isGymWeightlifterPinningBadge(state)
          ? {
              state,
              message:
                "You can get your fingers on the exposed corner of the orange badge, but the pinned weightlifter's body has the rest of it trapped. You'll need to move him first.",
            }
          : undefined,
    },
    meta: {
      kind: "security-badge",
    },
  },
  {
    id: "greenbadge",
    name: "green plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely green except for a white insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'A. RIDDEL, 2BE' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["green", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_green_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "yellowbadge",
    name: "yellow plastic badge",
    initialDescription:
      "The corner of a yellow plastic badge peeks out from under the back of the pinned weightlifter.",
    description:
      "This is a slim, rectangular plastic badge that is entirely yellow except for a black insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'JOHN RAWLINS, EE2' and beneath that a bar code of some kind.",
    location: "GymWeightRoom",
    vocab: ["yellow", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_yellow_badge",
    meta: {
      kind: "security-badge",
    },
  },

  {
    id: "whitebadge",
    name: "white plastic badge",
    description:
      "This is a slim, rectangular plastic badge that is entirely white except for a black insignia of an upside-down isosceles triangle within a circle, with a V shape piercing the triangle's base, its point connecting with the triangle's point. Written in a neutral font in the bottom left is the name 'WILLIAM VESCO, C0' and beneath that a bar code of some kind.",
    location: "seeded",
    vocab: ["white", "badge", "plastic"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_white_badge",
    meta: {
      kind: "security-badge",
    },
  },
];
