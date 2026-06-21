import { getFlashlightSettings } from "@game/helpers/flashlightHelpers";
import {
  createPlayerHuskMeta,
  getPlayerHuskNumberVocab,
  getPlayerHuskPlateDescription,
} from "@game/helpers/playerHuskHelpers";
import type { Item } from "../../game/types/itemTypes";
import {
  removeDeepStorageSuit,
  wearDeepStorageSuit,
} from "../maps/levelSeven/deepStorage";

const LEVEL_SEVEN_MISC_ITEMS: Item[] = [
  {
    id: "MysteriousNote",
    name: "mysterious note",
    initialDescription:
      "Near the body's lifeless hand lies a folded piece of paper marked with a dried, bloody thumbprint.",
    description:
      "A folded piece of paper with a thumbprint in dried blood in the bottom right corner. It's covered in handwritten notes, scribbled hastily.",
    location: "StairWellSeven",
    vocab: ["note", "scrap", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isLoggable: true,
    isReadable: true,
    readableTitle: `Note Found on Body: Stairwell Bottom`,
    readableText: `Rules:\n\n- Stay in the light, they won't come into the light\n- In time even casual contact will be fatal\n- Can pass through even tiny openings\n- I think they can follow thermal signatures, need to prove.\n\nLocation: some kind of facility or campus. Self contained?\n\nSEARCH EVERY BODY YOU FIND! I'll try to keep notes.\n\nMany dead bodies, cause of death unclear in many cases but at least some have been either eaten, dissolved, or absorbed entirely. No survivors found so far. Whatever happened is widespread and acted fast.\n\nTO DO LIST:\n\n\tHeard warning re: reactor overload, look into that\n\tGet power back on in several areas\n\tAccess lab to find more info on nature of threat\n\tFind out what caused those strange holes\n\n\tOther notes:\n\n\t\t- Wtf was that weird spider thing?\n\t\t- Is anyone left alive?\n\t\t- Watch those stairwell railings, they seem unstable.`,
  },
  {
    id: "StoredStairwellStuff",
    name: "stacks of old, dusty boxes",
    description:
      "The old boxes are bound with metal bands both vertically and horizontally. You're not sure how you'd open them, but it looks like they maybe contain spare parts or something.",
    sceneryDescription:
      "Tucked beneath the last flight of stairs are several stacks of boxes that are bound with metal bands, each covered in dust and looking affected by mold, or mildew. Nothing down here has been touched in a long time.",
    location: "StairWellSeven",
    vocab: ["boxes", "storage"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "damagedFlashlight",
    name: "broken flashlight",
    location: "StairWellSeven",
    vocab: [
      "flashlight",
      "broken flashlight",
      "damaged flashlight",
      "broken",
      "damaged",
    ],
    initialDescription:
      "Near the wall, amidst scattered pieces of broken plastic, you see a flashlight with a cracked housing.",
    description:
      "It sustained a pretty hard impact, cracking the housing and the lens cover, but the lens seems to be intact.",
    describe: (state) => {
      const damagedFlashlightState = getFlashlightSettings(
        state,
        "damagedFlashlight",
      );
      const chargeText =
        damagedFlashlightState &&
        Number.isInteger(damagedFlashlightState.currentCharge)
          ? String(damagedFlashlightState.currentCharge)
          : (damagedFlashlightState?.currentCharge.toFixed(2) ?? "0");

      let desc = `It sustained a pretty hard impact, cracking the housing and the lens cover, but the lens seems to be intact. The battery is damaged, though, and seems only capable of holding a tiny fraction of its charge, with a little charge meter on one side that reads 'Battery: ${chargeText}%' The flashlight is currently ${damagedFlashlightState?.isOn ? "on, " : "off."}`;
      if (damagedFlashlightState?.isOn) {
        if (damagedFlashlightState.currentCharge >= 3) {
          desc += `and casting a reasonably bright beam.`;
        }
        if (damagedFlashlightState.currentCharge === 2) {
          desc += `and casting a sallow beam of light.`;
        }
        if (damagedFlashlightState.currentCharge === 1) {
          desc += `but it's flickering, and doesn't look like it's going to be on much longer.`;
        }
        if (damagedFlashlightState.currentCharge < 1) {
          desc += `but it isn't casting any light.`;
        }
      }

      return desc;
    },
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isSwitchable: true,
    isOn: false,
    providesLight: true,
  },
  {
    id: "seed",
    name: "spider-like shell",
    location: "StairWellSeven",
    vocab: [
      "spider",
      "shell",
      "spider-like",
      "bug",
      "husk",
      ...getPlayerHuskNumberVocab(8),
    ],
    initialDescription:
      "There's some sort of large bug or spider on the floor near the body, laying on its back with its many legs curled inward.",
    description:
      `It’s a small metallic shell shaped vaguely like a spider, with segmented limbs arranged around a rounded abdomen. The abdomen has split open along a perfect seam, exposing an olive-sized cavity smeared with greasy residue. ${getPlayerHuskPlateDescription(8)}`,
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    doses: 0,
    meta: {
      playerHusk: createPlayerHuskMeta(8),
    },
    overrides: {
      smell: "It has a faint organic smell, but you can't place it.",
      taste:
        "You dab a fingertip in the greasy film and taste it. It’s a little salty, and bitter.",
    },
    isSwitchable: false,
    isOn: false,
    providesLight: false,
    isContagious: false,
    isRadioactive: false,
  },
  {
    id: "CryoWhiteIND",
    name: "indicator light",
    description:
      "A flat, circular indicator disk is set into the wall, its surface washed in a cold, uniform white. It doesn’t flicker or pulse, just glows with the steady, clinical calm of a system that knows something you don’t.",
    initialDescription:
      "A circular indicator disk glows with a flat, white light.",
    sceneryDescription:
      "Set into the wall, a pale indicator disk burns with a steady white glow, bleaching the nearby metal in ghost-light.",
    location: "CryoLab",
    vocab: ["glow", "indicator", "light", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "LabChambers",
    name: "lab chambers",
    description:
      "Along the wall stand several metal cryogenic chambers, each fitted with a viewing window and its own temperature monitor. The displays still have power from somewhere, fluctuating between 77 and 101 K, numbers that twitch by a digit or two at random intervals.\nBehind the glass, human organic samples float or rest in nests of sterile hardware: one chamber holds petrie dishes full of disembodied eyeballs, another displays neatly arranged severed hands, and a third cradles multiple hearts side by side. The remaining chambers are filled with organ clusters you can’t immediately identify, and you’re not sure you want to stare long enough to try.",
    sceneryDescription:
      "A row of cryogenic chambers lines the wall, each one lit from within and filled with carefully organized human anatomy.",
    location: "CryoLab",
    vocab: ["chamber", "chambers", "glass", "window", "windows"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isOpenable: true,

    overrides: {
      open: "You search for latches or handles, but the chambers appear sealed—no obvious way to open them without the proper tools or codes.",
      take: "They’re bolted into the lab’s structure and weigh more than you and your conscience combined.",
    },
  },
  {
    id: "Eyes",
    name: "eyeballs",
    description:
      "Inside one of the chambers sit twelve individual eyeballs, each resting in a shallow petrie dish filled with frozen medium. None of them form a matching pair. Browns, blues, greens—and one disturbingly soft pink, the eerie iris of an albino. Each optic nerve trails away like a snapped cable, frozen in mid-curl.",
    sceneryDescription:
      "In one chamber, a dozen assorted eyeballs stare blindly through the glass, their optic nerves frozen in delicate arcs.",
    location: "CryoLab",
    vocab: ["eyes", "eye", "eyeball", "eyeballs", "peepers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "The eyeballs are sealed behind the chamber glass. Honestly, that’s probably for the best.",
      touch:
        "You slide your hands into the thick black gloves and reach in through the access ports. The eyeballs are rock-hard, frozen solid, their surfaces smooth and unyielding.",
    },
  },
  {
    id: "LabHands",
    name: "hands",
    description:
      "Another chamber holds eight severed hands, each cleanly cut at the wrist. Half look male, half female, skin tones ranging from pale to deep black. Each hand is mounted upright on a small silvery pylon, palms facing the viewing window as if in silent appeal.",
    sceneryDescription:
      "A separate chamber displays a neat gallery of severed hands, palms turned outward in a frozen, wordless request.",
    location: "CryoLab",
    vocab: ["hands", "hand"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "The hands are locked behind the chamber glass, out of reach and exactly where they should stay.",
      touch:
        "Through the black gloves, each hand feels like stone—perfectly preserved and utterly dead.",
    },
  },
  {
    id: "Hearts",
    name: "hearts",
    description:
      "A third chamber contains four hearts of different sizes: two large, one smaller, and a final tiny specimen that must have come from an infant. Each rests in its own petrie dish, their surfaces slightly glossy, as if waiting for a signal to start beating again.",
    sceneryDescription:
      "Four hearts rest in a chamber, varying in size from broad-chested adult to something heartbreakingly small.",
    location: "CryoLab",
    vocab: ["heart", "hearts"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "The hearts sit behind reinforced glass, untouchable and somehow still oppressive.",
      touch:
        "Inside the chamber, each heart feels as hard and cold as carved stone. Perfectly intact, perfectly lifeless.",
    },
  },
  {
    id: "LabCanisters",
    name: "canisters",
    description:
      "The entire eastern wall is occupied by six massive black metal canisters, each mounted vertically and secured with heavy brackets. Warning glyphs and text shout about extreme pressure and hazardous contents, their edges worn but still legible. Thick pipes attach to valves at their crowns, feeding something unseen deeper into the lab’s infrastructure.",
    sceneryDescription:
      "Six tall, black canisters loom along the eastern wall, their hazard warnings still crisp despite the ship’s decay.",
    location: "CryoLab",
    vocab: ["canisters", "canister", "pressurized"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "They’re larger and heavier than you are, and bolted to the wall for good measure.",
      attack:
        "You consider hitting one and then picture what ‘extreme pressure, hazardous contents’ might look like on the outside. You rethink.",
      open: "Each canister’s top is locked into a valve assembly tied into the pipe network. There’s no ‘open’ in any sane sense of the word.",
      close:
        "Whatever control mechanism exists, it’s not here. These systems were designed to be managed remotely, not by curious bystanders.",
    },
  },
  {
    id: "LabPipes",
    name: "pipes",
    description:
      "From the top of each canister, a valve assembly feeds into a network of metal pipes that run along the corner of the ceiling. They split, merge, and branch again, most of them disappearing in the direction of the cryogenic chambers. A few turn off toward other parts of the ship, carrying whatever passes for lifeblood in this place.",
    sceneryDescription:
      "A lattice of pipes spiders out from the canisters, threading across the ceiling toward the cryo chambers and beyond.",
    location: "CryoLab",
    vocab: ["pipe", "pipes", "valve"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "LabInstruments",
    name: "instruments",
    description:
      "Each chamber contains its own set of slender medical instruments—delicate, precise tools whose functions you can only guess at. Some are hooked, some bladed, some needle-fine. They look like they were designed for operations on a scale just shy of microscopic.",
    sceneryDescription:
      "Through the glass you can see trays of fine medical instruments, sharp and inscrutable.",
    location: "CryoLab",
    vocab: ["medical", "instruments", "instrument", "tools"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "The instruments are sealed inside the individual chambers. Someone decided you shouldn’t play with them, and—for once—you agree.",
    },
  },
  {
    id: "BlackGloves",
    name: "black gloves",
    description:
      "Thick, rubbery black gloves protrude from airtight seals on each chamber, hanging limp when not in use. They’re long, reaching almost to the elbow, the inside surfaces faintly dusted with something that might be powder—or frost.",
    sceneryDescription:
      "Twin black gloves hang from each chamber, connected via airtight ports like empty, waiting hands.",
    location: "CryoLab",
    vocab: ["black", "glove", "gloves"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 2,
    isWearable: false, // you don't wear them, you use them attached
    isReadable: false,
    isContainer: false,
    overrides: {
      take: "The gloves are fixed into the chamber ports; they’re not going anywhere without heavy tools and a worse idea.",
      use: "You slide your hands into the black gloves. The rubber clings uncomfortably as the world narrows to whatever’s waiting inside the chamber.",
    },
  },
  {
    id: "StasisChambers",
    name: "stasis chambers",
    description:
      "A bank of coffin-sized stasis pods is mounted into the walls, each one outlined by a thick seal that runs around its outer rim. They look solid, heavy, and self-contained, built to endure anything the ship can’t. Power still hums faintly through their conduits, bathing the seams in a muted glow.\nNear the top of each pod, a small rectangular LCD display peers out of the dark like a soft green eye, tracking data you can’t read from this distance. Whatever—or whoever—is inside, the pods haven’t let go yet.",
    sceneryDescription:
      "Sturdy stasis pods line the room, each one sealed tight and quietly powered, their LCDs glowing like watchful eyes.",
    location: "Stasis",
    vocab: ["chamber", "chambers", "pod", "sleep"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isOpenable: true,

    overrides: {
      take: "They’re mounted into the ship itself. If they move at all, it’ll be because a system you don’t control decided they should.",
      open: "You run your hands along the seams, but there’s no visible latch or release. If there’s a way to open these, it’s encoded somewhere you can’t see.",
      close:
        "They’re already sealed, every edge pressed into place with machine-perfect precision.",
    },
  },
  {
    id: "StasisLCDs",
    name: "stasis LCD display",
    description:
      "Up close, each pod’s LCD panel scrolls through a tight block of data: name, sex, birthdate, age, occupation, and a series of vital statistics. The life-sign graph doesn’t look like a heartbeat or pulse, more like the slow, stuttering rhythm of a brainwave or something stranger. The lines move, but not in a way you find comforting.",
    sceneryDescription:
      "Green LCD panels on each pod quietly report names, stats, and alien-looking life-sign traces.",
    location: "Stasis",
    vocab: ["lcd", "panel", "display"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "GridWhiteIND",
    name: "indicator light",
    description:
      "Another circular indicator disk is mounted here, glowing with the same flat, unblinking white as the cryo systems. It gives off a sense of quiet authority, like a status light that has never, ever changed color—and might not know how.",
    initialDescription: "A circular disk is glowing with a flat, white light.",
    sceneryDescription:
      "A white indicator disk glows calmly, washing nearby surfaces in a sterile halo.",
    location: "Stasis",
    vocab: ["glow", "indicator", "light", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    overrides: {
      examine:
        "The light doesn’t flicker, doesn’t dim, doesn’t acknowledge you at all. It’s like staring into the concept of ‘OK’ with no idea what that actually means.",
      switch:
        "If there’s any way to shut this thing down, it’s buried behind plating you can’t reach.",
    },
  },

  // ---------------------------------------------------------------------------
  // SPACESUIT (CRYONIC SUIT)
  // ---------------------------------------------------------------------------

  {
    id: "SpaceSuit",
    name: "cryonic suit",
    description:
      "A silvery cold suit lies crumpled on the floor, its skin a dull reflective sheen that drinks in the room’s pale light. The gloves and helmet are integrated, forming a single airtight shell from head to toe. The feet end in flexible, form-fitting booties designed to seal perfectly against the rest of the suit.\nMounted on the back is a self-contained oxygen unit, its casing scuffed but intact. A thin black tube snakes down one arm, ending at a wrist-mounted gauge with a tiny, stubborn-looking readout.",
    initialDescription:
      "A large metal harness stands near the Deep Storage entrance, nearly brushing the ceiling. Hanging in the harness is a heavy environmental suit, fitted with tubes and a pressurized tank mounted on the back. The front of the suit is open, and the docking cradle has a little raised platform to help you slip into and wear it.",
    sceneryDescription:
      "A silvery cryonic suit sprawls on the deck, helmet, gloves, and booties all fused into a single sealed shell.",
    location: "Stasis",
    vocab: ["suit", "space", "gague", "gauge", "cryonic", "cold"],
    itemClass: "solid",
    itemCategory: "static",
    itemWeight: 10,
    itemSize: 101,
    isWearable: true,
    clothingSlot: "body",
    isReadable: false,
    isContainer: false,
    overrides: {
      take: "The suit is too bulky to carry around. It needs to stay docked until you are wearing it.",
      wear: wearDeepStorageSuit,
      remove: removeDeepStorageSuit,
      examine:
        "The heavy skin is scarred with use, but the seams look intact. The rear-mounted oxygen pack is still connected, and the wrist gauge shows your reserve of breathable air.",
    },
    providesLight: false,
    isRadioactive: false,
  },
  {
    id: "DUCTTAPE",
    name: "roll of duct tape",
    description:
      "A big roll of gray duct tape, the adhesive edge faintly grimy but still tacky. It’s the universal fix-it solution: ugly, stubborn, and capable of holding together things that really shouldn’t be.",
    initialDescription: "Lying on the floor is a big roll of grey duct tape.",
    sceneryDescription:
      "A fat roll of gray duct tape sits where someone must have dropped it mid-emergency.",
    location: "CryoLab",
    vocab: ["duct", "tape", "roll"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      use: "You peel back a strip of tape. The rip is loud in the quiet lab, and the adhesive smell is harsh and reassuringly mundane.",
      examine:
        "It’s standard-issue duct tape: wide, gray, and strong enough to cover holes you’re not emotionally prepared to admit exist.",
    },
  },
];

export const stairwellBottomItems: Item[] = LEVEL_SEVEN_MISC_ITEMS.filter(
  (item) => item.location === "StairWellSeven",
);

export const levelSevenItems: Item[] = LEVEL_SEVEN_MISC_ITEMS.filter(
  (item) => item.location !== "StairWellSeven",
);
