import type { Item } from "../../game/types/itemTypes";

export const clothingItems: Item[] = [
  {
    id: "inertial_dampener",
    name: "synthetic black harness",
    vocab: ["inertial", "dampener", "harness", "idf"],
    description:
      "A black synthetic harness with an electronic housing labeled 'CLASS TWO IDF'.",
    location: "ARMORY",
    isWearable: true,
    clothingSlot: "wrist",
    meta: {
      clothing: {
        wearMessage:
          "You strap on the harness and tighten it until it fits snugly.",
      },
      protection: {
        zap: 0,
        gauss: 500,
        missile: 100,
      },
      toggleable: true,
      empVulnerable: true,
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 4,
    itemSize: 3,
  },

  {
    id: "gravity_boots",
    name: "pair of gravity boots",
    vocab: ["gravity", "boots"],
    description:
      "Heavy boots with metallic mesh soles and integrated gravity control.",
    location: "seeded", // This will go in the Shuttle's locker
    isWearable: true,
    clothingSlot: "feet",
    meta: {
      clothing: {
        wearMessage:
          "You slip on the boots as the padding adjusts to a perfect fit.",
      },
      gravityControl: true,
      toggleable: true,
      empVulnerable: true,
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 4,
    itemSize: 3,
    scoreId: "obtained_gravity_boots",
  },
];
