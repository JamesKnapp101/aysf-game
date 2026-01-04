import type { Item } from "../../game/types/itemTypes";

export const clothingItems: Item[] = [
  {
    id: "warren_tank_top",
    name: "grungy tank top",
    vocab: ["grungy", "tank", "top"],
    description:
      "It's a white tank top that looks a little lived in; although efforts have clearly been made to at least keep it somewhat clean, it's never going to see truly white again.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You pull on the tank top. It's worn, but comfortable.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "warren_blue_jeans",
    name: "pair of faded blue jeans",
    vocab: ["faded", "blue", "jeans"],
    description:
      "Whoever owns these jeans must live in them. Literally. They’re so worn, faded, patched, and repaired that they might have been used as a sail at some point. They look pretty comfortable.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage:
          "You slip on the jeans...hey, these are really comfortable!",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "warren_tshirt",
    name: "concert T-shirt",
    vocab: ["concert", "t", "shirt", "t-shirt"],
    description:
      "Once black, now a mottled gray from bleach stains and fading. The band logo is barely visible.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You pull on the faded concert T-shirt.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "briggs_boots",
    name: "pair of black combat boots",
    vocab: ["black", "combat", "boots"],
    description:
      "Heavy black military-style boots, polished to a mirror shine.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "feet",
    meta: {
      clothing: {
        wearMessage:
          "They're a little snug, but you manage to slip them on and lace them.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
  },

  {
    id: "briggs_black_tshirt",
    name: "black T-shirt",
    vocab: ["black", "t", "shirt", "t-shirt"],
    description: "A crisp, clean, solid black T-shirt.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You pull on the clean black T-shirt.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "briggs_sweater",
    name: "grey sweater",
    vocab: ["grey", "gray", "military", "sweater"],
    description:
      "It looks like it's made of gray wool, with pads on the shoulders. It looks military issue.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage:
          "You slip on the sweater. The sleeves are a little short, but otherwise it's not a bad fit.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "briggs_fatigues",
    name: "pair of fatigues",
    vocab: ["military", "fatigues", "legs"],
    description: "A pair of military or police fatigues.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage:
          "You slip on the fatigues. They're a little short in the leg, but otherwise it's not a bad fit.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "your_slacks",
    name: "pair of slacks",
    vocab: ["slacks", "khaki", "legs"],
    description: "A pair of khaki slacks. Business casual.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage: "You slip into the slacks. They fit reasonably well.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "your_silk_shirt",
    name: "silk shirt",
    vocab: ["silk", "shirt"],
    description: "A patterned silk shirt. It's pretty nice.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You carefully pull on the silk shirt.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "your_black_shoes",
    name: "pair of black shoes",
    vocab: ["black", "shoes"],
    description: "A pair of polished black shoes.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "feet",
    meta: {
      clothing: {
        wearMessage:
          "You slip the shoes on. As fate would have it, they're a perfect fit.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "kira_skirt",
    name: "tight skirt",
    vocab: ["tight", "skirt"],
    description: "Whoever owns this skirt is either a size zero, or not shy.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage:
          "The skirt is made of a stretchy material; with some squirming you manage to squeeze into it.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "kira_cat_sweatshirt",
    name: "cat sweatshirt",
    vocab: ["cat", "sweatshirt", "shirt"],
    description: "A soft sweatshirt with a black cat printed on the front.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You pull on the cat sweatshirt. It's warm and soft.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "alice_gi_top",
    name: "gi top",
    vocab: ["gi", "top", "jacket"],
    description:
      "The top of a black martial arts gi, made of heavy canvas and heavily repaired.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage: "You slip on the gi top and tighten it into place.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "alice_gi_pants",
    name: "pair of gi pants",
    vocab: ["gi", "legs"],
    description: "Black martial arts gi pants with a drawstring waist.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage: "You step into the gi pants and cinch the drawstring.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "black_belt",
    name: "black belt",
    vocab: ["black", "belt"],
    description: "A frayed, well-worn black belt.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "waist",
    meta: {
      clothing: {
        wearMessage: "You wrap the black belt around your waist and tie it.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "alice_sneakers",
    name: "pair of canvas sneakers",
    vocab: ["canvas", "sneakers"],
    description: "A pair of white canvas sneakers.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "feet",
    meta: {
      clothing: {
        wearMessage:
          "They're a little snug, but you manage to slip them on and lace them.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "ed_white_shirt",
    name: "starched white shirt",
    vocab: ["starched", "white", "shirt"],
    description:
      "An aggressively starched white shirt of near-mythical whiteness.",
    location: "seeded",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage:
          "You try to put on the shirt, instantly ruining its pristine perfection. It still doesn't fit.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

  {
    id: "ed_pressed_pants",
    name: "pair of pressed pants",
    vocab: ["pressed", "legs"],
    description: "A neat, clean pair of pressed pants.",
    location: "seeded",
    isWearable: false,
    clothingSlot: "legs",
    meta: {
      clothing: {
        wearMessage:
          "You try to pull on the pants, but they're just too small.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
  },

  {
    id: "wool_vest",
    name: "wool vest",
    vocab: ["wool", "vest"],
    description: "A gray-and-white wool vest. Nicely made, but far too small.",
    location: "seeded",
    isWearable: false,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage:
          "You get your arms into the vest, but you can't button it and remove it again.",
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },

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
    id: "soldier_vest",
    name: "armored vest",
    vocab: ["armored", "armor", "vest", "pba"],
    description: "A plated armored vest labeled 'CLASS THREE PBA'.",
    location: "ARMORY",
    isWearable: true,
    clothingSlot: "torso",
    meta: {
      clothing: {
        wearMessage:
          "You slip on the armored vest and fasten it snugly against your torso.",
      },
      protection: {
        zap: 500,
        gauss: 100,
        missile: 30,
      },
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 5,
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
