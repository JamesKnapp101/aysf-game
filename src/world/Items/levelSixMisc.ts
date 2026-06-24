import type { GameState } from "@game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";
import { lookThroughSpiderGap } from "./creatures/giantSpider";

export const levelSixItems: Item[] = [
  {
    id: "LevelSixCorridorEndDoorGap",
    name: "gap",
    description:
      "The damaged door has warped just enough to leave a narrow gap along one side. The metal around it is scorched and pitted, and something about the darkness beyond feels attentive.",
    sceneryDescription:
      "A narrow gap runs along the damaged door's edge, exposing only darkness and the occasional twitch of shadow beyond.",
    location: "LevelSixCorridorEnd",
    vocab: ["gap", "door", "opening"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
    overrides: {
      lookthrough: ({ state }: { state: GameState }) =>
        lookThroughSpiderGap(state),
    },
  },
  {
    id: "LevelSixStairRailing",
    name: "metal railing",
    description:
      "A smooth, polished metal railing. The blood spatter may have come from the man who fell, below.",
    sceneryDescription: "flanked by a metal railing spattered with blood.",
    location: "StairSix",
    vocab: ["rail", "railing"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "LevelSixElevators",
    name: "elevators",
    description: `'Cable Fault Detected' doesn't sound good. Something must have gotten seriously damaged.`,
    sceneryDescription: `There is a row of three elevator doors to the north, but the lights are currently off and the display mounted above each doors is red, with the message 'Out of Order: Cable Fault Detected'.`,
    location: "LevelSixStairAccess",
    vocab: ["elevator", "elevators", "elevator doors"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 50,
    isOpenable: true,
    isContainer: true,
    meta: {
      sceneryDescriptionOrder: 1,
      isUnopenableDoor: true,
    },
    overrides: {
      open: `They're stuck shut, you can't even sneak your fingers into the seam to pull them apart.`,
    },
  },
  {
    id: "AirlockStatusDisplay",
    name: "status display",
    description: `It's a large, flat panel display mounted in the wall over the door.`,
    sceneryDescription: `Z`,
    location: "LevelSixCorridorBend",
    vocab: ["display", "door display"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 50,
    meta: {
      sceneryDescriptionOrder: 2,
    },
    describeScenery: (state) => {
      let desc = `A flat panel display is mounted in the wall over a large steel door that looms at the end of the short corridor. The display is `;
      const outerDoorState = state.worldState.doors?.["OuterDoor"];
      if (outerDoorState.isOpen) {
        desc += `currently lit up red, and displaying a warning message that reads: 'DEPRESSURIZED'`;
      }
      if (outerDoorState.isOpen === false) {
        desc += `currently lit up green, and displaying the message 'ENTRY PERMITTED'`;
      }
      return desc;
    },
    describe: (state) => {
      let desc = `The flat panel display is `;
      const outerDoorState = state.worldState.doors?.["OuterDoor"];
      if (outerDoorState.isOpen) {
        desc += `currently lit up red, and displaying a warning message that reads: 'DEPRESSURIZED'`;
      }
      if (outerDoorState.isOpen === false) {
        desc += `currently lit up green, and displaying the message 'ENTRY PERMITTED'`;
      }
      return desc;
    },
  },
  {
    id: "AirlockPanel",
    name: "airlock panel",
    description:
      "A blank, flat panel is mounted above the heavy steel door to the south. A single embedded indicator glows an unwavering red, throwing a thin wash of color across the surrounding metal. There are no switches, no buttons—just the quiet, stubborn statement that the airlock is not interested in cooperating.",
    sceneryDescription:
      "Above the southern airlock door, a featureless panel glows a steady, accusing red.",
    location: "LevelSixCorridor",
    vocab: ["panel", "lit", "red", "airlock"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isOpenable: false,

    overrides: {
      push: "You press your palm against the panel. It’s warm, but unmoved.",
      use: "The panel offers no obvious interface. It simply glows, like a warning light that thinks it’s smarter than you.",
    },
  },
  {
    id: "SPACEEnv",
    name: "empty space",
    description:
      "You are adrift in the ink-black vacuum, with no frame of reference except the ship rotating somewhere ahead of you. The stars are brutally sharp and indifferent, each one a cold pinprick against a background that looks more like absence than sky. There is no up or down here—just the slow, nauseating sensation of spinning while the Deus Ex Machina turns lazily in your field of view, shrinking a little more every time you blink.",
    sceneryDescription:
      "Around you, the inky void stretches in every direction, the ship spiraling slowly against a backdrop of uncaring stars.",
    location: "SPACE",
    vocab: ["space", "void", "vacuum"],
    itemClass: "gas",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: false,

    overrides: {
      move: "You thrash your arms and legs, but in hard vacuum there’s nothing to push against. Space doesn’t care how badly you want to be somewhere else.",
      drop: "Letting go of anything out here is essentially setting it free. It won’t fall—it’ll just keep going, the way everything does once it slips loose.",
    },
  },
  {
    id: "SHIP",
    name: "ship",
    description:
      "From out here the Deus Ex Machina looks wrong in ways you never noticed from inside. Blocky, asymmetrical modules jut at odd angles, stitched together for endurance rather than elegance. It turns slowly in a lazy, clockwise spiral, but you know it’s you who’s really drifting. Some structure juts from one flank—an appendage or wound, it’s hard to tell from this distance. The whole ship feels impossibly large, an indifferent bulk receding, cell by cell, into the dark.",
    sceneryDescription:
      "The Deus Ex Machina spins slowly in the distance, a massive, asymmetrical hulk built for long hauls and bad decisions.",
    location: "SPACE",
    vocab: ["ship", "deus", "ex", "machina", "space"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "From out here, the ship is a shrinking silhouette against the stars. You’re not taking it; it’s taking you, piece by piece, and leaving you behind.",
    },
  },
  {
    id: "EngineRoomKey",
    name: "large orange and black key",
    description:
      "A large industrial key spins slowly in mid-air, its rectangular grip molded in alternating bands of orange and black. The shaft is thick and machined with oddly asymmetrical teeth, meant for a receptacle that has no patience for improvisation.",
    initialDescription:
      "Floating nearby in a slow end-over-end spin is a key with a rectangular orange and black grip.",
    sceneryDescription:
      "A heavy orange-and-black key drifts just out of easy reach, rotating lazily in the air.",
    location: "AboveTheQuadThree",
    vocab: ["large", "key", "black", "orange", "rectangular"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    scoreId: "obtained_engine_room_key",
    meta: {
      kind: "key",
    },
    overrides: {
      take: "You reach out and carefully pluck the spinning key from the air, feeling its weight settle uncomfortably in your hand.",
    },
  },
  {
    id: "TinyGlintingObject_SQ3",
    name: "tiny glinting object",
    description:
      "Far above, almost swallowed by the shadows near the ceiling, something small catches the light every few seconds. You can’t tell what it is—metal, glass, maybe just a polished corner of some forgotten component—but each flash feels like an eye half-opening and then closing again.",
    sceneryDescription:
      "High overhead, a tiny object flashes intermittently as light glances off its surface, maddeningly out of reach.",
    location: "StorageQuadThree",
    vocab: ["tiny", "light", "glinting", "object"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: false,

    overrides: {
      take: "You stretch upward, but it’s far, far above you—easily sixty feet in the air. All you can do is watch it flash.",
    },
  },
  {
    id: "TinyGlintingObject_Q3Stack",
    name: "tiny glinting object",
    description:
      "From the top of the stack you’re closer, but the object still hangs high above, suspended in a pocket of still air. Each faint flash of reflected light is a reminder that sometimes “almost reachable” is still another forty feet away.",
    sceneryDescription:
      "Even from up here, the tiny glinting object remains a distant, taunting point of light.",
    location: "QuadThreeStack",
    vocab: ["tiny", "light", "glinting", "object"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: false,

    overrides: {
      take: "You edge toward the very limit of safety and reach, but it’s still a good forty feet out of reach. Physics is not on your side.",
    },
  },
  {
    id: "QuadThreeDoor",
    name: "large metal door",
    description:
      "A massive metal door dominates the wall, tall and wide enough to swallow entire cargo assemblies in one slow gulp. The surface is scarred by impact marks and loading accidents, its paint worn down to dull raw metal in places. There are no handles, no obvious controls—just the quiet, oppressive certainty that whatever opens this is bigger than you.",
    sceneryDescription:
      "A huge cargo door looms over the deck, featureless and handleless, built to move bulk freight and nothing as small as you.",
    location: "StorageQuadThree",
    vocab: ["large", "huge", "heavy", "metal", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isOpenable: true,

    overrides: {
      open: "You brace yourself and push. The door doesn’t flinch. This is a cargo seal, not a suggestion.",
      enter:
        "You stare at the sealed door and imagine walking through it. That’s about as close as you’re going to get without electronic help.",
    },
  },

  {
    id: "YellowEmergencyLights",
    name: "yellow emergency lights",
    description:
      "On either side of the cargo door stand two squat pylons topped with plastic yellow domes. Inside each dome is a strobe unit, currently dead and dark. Dust has gathered along their bases, as if nothing worth evacuating has happened here in a long time. Or as if something did, and they never bothered to reset them.",
    sceneryDescription:
      "Two yellow-domed emergency strobes flank the big cargo door, inert and a little too quiet.",
    location: "StorageQuadThree",
    vocab: ["yellow", "emergency", "lights", "light"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,

    overrides: {
      switch:
        "You look for a switch or manual override. There isn’t one. If these lights wake up, it’ll be because the ship decides you’re in trouble.",
    },
  },

  {
    id: "StoragePallettes_SQ1",
    name: "storage pallettes",
    description:
      "Stacks of plastic pallets rise in uneven columns, each loaded with heavy crates and boxes. The entire assembly is shrink-wrapped in a layer of tough, clear film that crackles faintly when disturbed. It looks like someone tried to make chaos behave by wrapping it in plastic.",
    sceneryDescription:
      "Tall stacks of palletized crates loom over the deck, each load cocooned in tight plastic wrap.",
    location: "StorageQuadOne",
    vocab: ["storage", "pallettes", "pallette", "pallet", "plastic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You plant your hands against the load and push. It doesn’t move. You’d need machinery, or a death wish, or both.",
      push: "The pallet stack barely creaks under the strain. These aren’t meant to be budged by hand.",
      lookunder:
        "There’s no meaningful space under there—just compressed plastic and several tons of regret.",
      climb:
        "You grab hold of the wrapped plastic and haul yourself upward, boots sliding for purchase as you scurry up the side.",
      attack:
        "You fling yourself at one of the boxes with a raw, frustrated shout. The impact hurts, but there’s a brief, stupid satisfaction in hitting something that can’t hit back.",
    },
  },
  {
    id: "StoragePallettes_SQ2",
    name: "storage pallettes",
    description:
      "Here the pallets are stacked even higher, a precarious skyline of crates and containers bound in tight plastic. Labels are half-peeled, corners crushed, and the whole pile leans just slightly, like it’s considering falling but hasn’t found a good enough reason yet.",
    sceneryDescription:
      "Another wall of plastic-wrapped pallets crowds the floor space, threatening an avalanche made of logistics.",
    location: "StorageQuadTwo",
    vocab: ["storage", "pallettes", "pallette", "pallet", "plastic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You might be able to tug a single crate free, if you didn’t mind the rest collapsing onto you like a very practical funeral.",
      push: "You give the stack a testing shove. It groans ominously, then settles back into place. You decide not to press your luck.",
      lookunder:
        "There’s nothing under the pallets but floor, plastic, and the vague promise of a disabling injury.",
      climb:
        "You sink your fingers into the stretched wrap and climb, the whole stack complaining in low creaks with every movement.",
      attack:
        "You slam a shoulder into the nearest crate. Dust rains down. The pallets, mercifully, stay upright.",
    },
  },
  {
    id: "StoragePallettes_SQ3",
    name: "storage pallettes",
    description:
      "Massive pallets here are stacked with oversized cargo containers, all mummified in cloudy wrap. Procurement stickers and hazard warnings peek through in random patches, most of them faded, some clawed at and half-removed as if someone changed their mind halfway through obeying protocol.",
    sceneryDescription:
      "A dense block of palletized cargo crowds this section, shrink-wrapped into uneasy stillness.",
    location: "StorageQuadThree",
    vocab: ["storage", "pallettes", "pallette", "pallet", "plastic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You tug at a crate and feel the whole stack whisper against itself. Whatever’s under there isn’t worth dying for.",
      push: "The pallets shift a fraction of an inch and then lock again, like the ship itself is holding them in place.",
      lookunder:
        "There’s no clean gap under the pallets, just a hint of dark and the certainty of crushed fingers.",
      climb:
        "You grab a double handful of plastic and pull yourself up onto the stack, the wrap stretching and complaining around your weight.",
      attack:
        "You slam into the shrink-wrapped cargo. The impact rattles through the crates with a hollow thump that echoes longer than it should.",
    },
  },
  {
    id: "StoragePallettes_SQ4",
    name: "storage pallettes",
    description:
      "These pallets are older, judging by the torn plastic and dust build-up. Some of the wrap has split, revealing the bare, dented corners of crates beneath. The stack tilts just enough to make your neck itch when you stand too close.",
    sceneryDescription:
      "A weary-looking stack of pallets leans ever so slightly, held together by old wrap and bad decisions.",
    location: "StorageQuadFour",
    vocab: ["storage", "pallettes", "pallette", "pallet", "plastic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You consider trying to free a crate and picture the stack following it down onto your spine. You reconsider.",
      push: "You give the leaning stack the smallest nudge. It creaks like an old shipboard ghost and decides—for now—to stay put.",
      lookunder:
        "Bending down doesn’t reveal anything new beneath the pallets, just scuffed floor and accumulated grit.",
      climb:
        "You scale the slanting stack, each movement rewarded with an unnerving symphony of creaks.",
      attack:
        "You hurl yourself at the pallets. They shudder, remind you how heavy they are, and then settle back into tired silence.",
    },
  },
  {
    id: "DarkCorner",
    name: "dark corner",
    description:
      "In the far corner of the storage quad, the light simply gives up. Shadows pool there in a thick, velvety tangle that swallows detail. You can make out the suggestion of shapes—angular, maybe, or just stacked junk—but every time you lean in to focus, the darkness seems to lean back.",
    sceneryDescription:
      "One corner of the storage quad is drowned in shadow, a patch of darkness that feels less like an absence of light and more like an occupation.",
    location: "StorageQuadFour",
    vocab: ["dark", "corner", "darkness", "shadows", "shadow"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      examine:
        "You move closer and peer into the murk, but the dark just thickens, turning shapes into suggestions and suggestions into nothing.",
      search:
        "You extend a hand into the shadows and feel only cold air and the creeping sense that something could be watching from just beyond your reach.",
    },
  },
];
