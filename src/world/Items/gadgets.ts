import type { Item } from "../../game/types/itemTypes";

export const specialItems: Item[] = [
  // 1. Flashlight ------------------------------------------------------------
  {
    id: "flashlight",
    name: "LED flashlight",
    description:
      "A compact LED flashlight with a sturdy metal body and a deeply recessed lens for a tight, bright beam.",
    initialDescription: "A metal LED flashlight rests on the dresser.",
    location: "MainEngineering",
    vocab: ["flashlight", "led", "torch"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
  },

  // 2. PLT (portable library terminal) --------------------------------------
  {
    id: "PLT",
    name: "portable library terminal",
    description:
      "A slim, portable library terminal—basically a ruggedized tablet with a matte display and a scattering of status LEDs along one edge.",
    initialDescription:
      "Lying on the bed is a slim electronic device of some kind.",
    location: "SixWestBed",
    vocab: ["plt", "terminal", "library", "device", "portable"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
  },

  // 3. EMP capsule -----------------------------------------------------------
  {
    id: "EMP",
    name: "metallic capsule",
    description:
      "A sleek capsule-shaped metallic device, about seven inches long and three inches in diameter. A subtle seam divides it into two halves, and a recessed LED on one side sits dark above the letters “E.M.P.” etched along the seam.",
    location: "LevelTwoSafe",
    vocab: ["emp", "capsule", "grenade", "device"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: false,
    isOn: false,
  },

  // 4. DNA Reader ------------------------------------------------------------
  {
    id: "DNAReader",
    name: "DNA sampler",
    description:
      "A slim electronic wand about a foot long, ending in a small porous bulb for collecting and analyzing trace samples.",
    initialDescription:
      "A slender wand lies on one of the shelves, about a foot long.",
    location: "MedicalStorage",
    vocab: ["dna", "sampler", "analyzer", "reader", "wand"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: false,
    isOn: false,
  },

  // 5. Scalpel ---------------------------------------------------------------
  {
    id: "Scalpel",
    name: "sleek silver scalpel",
    description:
      "A sleek silver scalpel handle with no visible blade, just a narrow slot where one should be.",
    initialDescription:
      "A sleek silver scalpel lies on the floor near the body.",
    location: "OR",
    vocab: ["scalpel", "knife"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
  },

  // 6. Cooler ----------------------------------------------------------------
  {
    id: "Cooler",
    name: "plastic cooler",
    description:
      "A red-and-white plastic cooler with a folding handle on top and a dial on the front to control the internal temperature.",
    initialDescription: "A red-and-white plastic cooler rests in the corner.",
    location: "LivingQuartersFiveEast", // "Kitchen",
    vocab: ["cooler", "icebox"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 7,
    itemSize: 20,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isSwitchable: false,
    isSettable: true,
    isOn: true,
    meta: {
      settable: {
        off: {
          type: "message",
          text: "You set the cooler to 'off,' and it emits a soft hiss.",
        },
        cool: {
          type: "message",
          text: "You set the cooler to 'cool,' and it emits a low electronic tone.",
        },
        cold: {
          type: "message",
          text: "You set the cooler to 'cold,' and it emits a moderate electronic tone.",
        },
        freeze: {
          type: "message",
          text: "You set the cooler to 'freeze' and it emits a high-pitched electronic tone.",
        },
      },
    },
  },

  // 7. Thermometer -----------------------------------------------------------
  {
    id: "Thermometer",
    name: "thermometer",
    description:
      "A slim digital thermometer with a narrow probe and a tiny display window near the grip.",
    initialDescription: undefined,
    location: "RemoteMedicalTwo",
    vocab: ["thermometer"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: false,
    isOn: false,
  },

  // 8. Bomb chamber headset (blue) ------------------------------------------
  {
    id: "bombHeadSet",
    name: "blue headset",
    description:
      "A sleek blue communications headset that clips over the ear, with a thin boom mic arcing in front of the mouth.",
    initialDescription: undefined,
    location: "BombChamber",
    vocab: ["headset", "blue", "earpiece"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: true,
    isReadable: false,
    isContainer: false,
    isSwitchable: false,
    isOn: true,
  },

  // 9. Tactical headset (black) ---------------------------------------------
  {
    id: "tactHeadSet",
    name: "black headset",
    description:
      "A sleek black communications headset that clips over the ear, with a thin boom mic arcing in front of the mouth.",
    initialDescription: undefined,
    location: "BridgeTact",
    vocab: ["headset", "black", "earpiece"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: true,
    isReadable: false,
    isContainer: false,
    isSwitchable: false,
    isOn: true,
  },

  // 10. Radio ---------------------------------------------------------------
  {
    id: "Radio",
    name: "a two-way radio",
    description:
      "A hand-held two-way radio with a knurled power switch on the left side, a large rectangular push-to-talk button on the right, and a squat black antenna jutting from the top.",
    initialDescription: "A small hand-held walkie-talkie lies near the corpse.",
    location: "StairSix",
    vocab: ["radio", "walkie-talkie", "walkie", "cb"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
    isContagious: true, // held by infected NPC
  },

  // 11. Night Vision Goggles -----------------------------------------------
  {
    id: "NVGoggles",
    name: "night vision goggles",
    description:
      "A pair of high-tech goggles with a black elastic strap. Beside the right eyepiece sits a selector lens that can switch between several imaging modes.",
    initialDescription:
      "Hanging around your twin’s neck is a pair of high-tech goggles.",
    location: "LivingQuartersFiveEast", //"Warehouse",
    vocab: ["goggles", "night", "vision"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    isWearable: true,
    isSwitchable: true,
    clothingSlot: "face",
  },
];
