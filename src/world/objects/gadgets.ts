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
    itemSize: 3, // medium-ish; adjust if you have a stricter scale
    isWearable: false,
    isReadable: false,
    isContainer: false, // original allowed container/openable; you can flip this if you support battery objects later
    isSwitchable: true,
    isOn: false,
    // Inform had:
    // when_off: "There is a halogen flashlight lying nearby."
    // when_on:  "There is a halogen flashlight lying nearby, casting a beam..."
    // battery_in, power_remaining, turns_on, gravity, class MEDIUM
    // TODO: use isOn + power_remaining equivalent if you reintroduce battery logic.
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
    isReadable: false, // interaction will be via custom commands, not generic READ
    isContainer: false,
    isSwitchable: true,
    isOn: false,
    // Inform: isConnected 0, has switchable animate.
    // TODO: gate PLT query commands on isOn and isConnected equivalent.
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
    // Inform: charged 1, countdown 5.
    // TODO: implement arming / countdown / effect logic as needed.
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
    // Inform: inert 0.
    // TODO: add a custom "scan" / "sample" command if you want puzzle use.
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
    // Inform: inert 0, class SMALL.
    // TODO: use as a cutting tool in puzzles if needed.
  },

  // 6. Cooler ----------------------------------------------------------------
  {
    id: "Cooler",
    name: "plastic cooler",
    description:
      "A red-and-white plastic cooler with a folding handle on top and a dial on the front to control the internal temperature.",
    initialDescription: "A red-and-white plastic cooler rests in the corner.",
    location: "Kitchen",
    vocab: ["cooler", "icebox"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 7,
    itemSize: 20,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isSwitchable: false,
    isOn: true, // starts cold; interpret temp=2 as 'on' if you care
    // Inform:
    // off 0, cool 0, cold 1, freezing 0, temp 2, inert 0, can_hold 40,
    // first_freezified 0, size 20, has container openable, class MEDIUM.
    // TODO: if you implement temperature puzzles, map temp/freezing states into GameState.
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
    // Inform:
    // before: Use -> TakeTemp(); Taste -> <<Use self>>;
    // TODO: implement a USE command that routes to a TakeTemp-equivalent behavior.
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
    isSwitchable: false, // powered, but not explicitly switchable in Inform
    isOn: true,
    // Inform:
    // has clothing scenery, isOn 1
    // before:
    //   Take: custom text, clears scenery.
    //   Listen: if worn, passive; otherwise twoWay();
    //   Wear: if tactHeadSet worn -> feedback whine.
    // TODO: implement two-way comms + feedback interaction when both headsets are worn.
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
    // Inform:
    // has clothing scenery, isOn 1
    // before:
    //   Take: custom text, clears scenery.
    //   Listen: same as bombHeadSet.
    //   Wear: handles pairing / feedback with bombHeadSet.
    // TODO: mirror comms behavior here; keep worn state in GameState.
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
    location: "Warehouse",
    vocab: ["goggles", "night", "vision"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    isWearable: true,
    isReadable: false,
    isContainer: false,
    isSwitchable: false, // modes rather than simple on/off
    isOn: false,
    // Inform:
    // nv 1, xray 0, magnify 0, on_twin 1, has clothing.
    // description varied based on nv/xray/magnify.
    // TODO: store mode state in GameState and customize vision / descriptions accordingly.
  },
];
