import type { GameState } from "../../game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";

function pushPowerStationButton({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  if (
    !state.itemState.containerContents["PowerStationKeyhole"]?.includes(
      "PowerStationKey",
    ) ||
    !state.worldState.powerRestoredSections["power-key-turned"]
  ) {
    return {
      state,
      message: "You push the red button with a firm click, but nothing happens.",
    };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          ["power-initialized"]: true,
        },
        roomAudioLevel: {
          ...state.worldState.roomAudioLevel,
          PowerGrid: 3,
        },
      },
    },
    message:
      "You push the flashing red button with a firm click, and you hear a loud snap from inside the panel. A beat later you hear a heavy clunk, then a fan somewhere inside the station begins to wind up, and the whole thing thrums to life. A series of lights blink on all across the surface of the panel, and from the shadows around the room until the entire chamber is bathed in a flickering electric glow. The viewscreen mounted above the keyboard flashes then blinks on, and the button now remains solidly lit.",
  };
}

export const levelFourItems: Item[] = [
  {
    id: "FIRE",
    name: "roaring flames",
    description:
      "A wall of fire is chewing through what’s left of the hydroponic foliage, sending distorted heat ripples through the air.",
    sceneryDescription:
      "The flames crawl across blackened soil and half-melted irrigation rigs, flaring brighter whenever they find something new to eat. Heat rolls off the blaze in waves, like someone left hell’s space heater on max.",
    location: "HydroponicsOne",
    vocab: ["fire", "flames", "flame"],
    itemClass: "gas",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      take: "Don’t stick your hand in it.",
      smell:
        "Your nose hairs singe the moment you inhale. It smells like smoke, burning plants, and bad decisions.",
      listen:
        "A dull roar with a constant crackle fills the room, like the ship is quietly being barbecued.",
    },
    isRadioactive: false,
    isContagious: false,
  },
  {
    id: "HydroGreenIND",
    name: "indicator light",
    description:
      "A circular status disk is set into the wall, glowing with a soft, ghostly green light.",
    initialDescription:
      "The disk is glowing with a ghostly green light, pulsing faintly against the metal.",
    sceneryDescription:
      "The green glow washes the nearby piping and foliage in sickly color, like an exit sign that has given up on actually helping anyone exit.",
    location: "HydroponicsOne",
    vocab: ["glow", "indicator", "light", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "GasMask",
    name: "gas mask",
    description:
      "A lightweight gas mask with a flexible face seal and twin filter cartridges. Straps at the back are designed to cinch over the head.",
    initialDescription:
      "Lying over by the fertilizer is what looks like some kind of face mask, half-dusted in chemical grit.",
    sceneryDescription:
      "The mask looks recently used, the inner seal still faintly smudged where it pressed against someone’s skin. The filters carry that faint, metallic reek of air you really shouldn’t have been breathing in the first place.",
    location: "HydroponicsCellar",
    vocab: ["gas", "mask", "gasmask"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 2,
    isWearable: true,
    clothingSlot: "head",
    isReadable: false,
    isContainer: false,
    overrides: {
      wear: "You’d need to get out of the cold suit first; the hood and helmet don’t really leave room for additional fashion accessories.",
      remove:
        "You unstrap the mask and let it hang loose. The air feels thicker and a lot less trustworthy.",
    },
  },
  {
    id: "Pipes",
    name: "pipes",
    description:
      "A network of industrial pipes snakes out from the large machine, following the walls before disappearing through the ceiling.",
    sceneryDescription:
      "Thick main lines and thinner feeder pipes form a ribcage around the room, carrying whatever cocktail the hydroponics system used to feed into the sprinklers—and, if things go wrong, probably into places it really shouldn’t.",
    location: "HydroponicsCellar",
    vocab: ["pipe", "pipes", "network"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PipeT",
    name: "pipe T-connector",
    description:
      "A heavy T-shaped connector joins the two main units of the machine to the large central pipe. An electronic gauge with an LCD display is mounted on it.",
    sceneryDescription:
      "The junction feels like the system’s throat—everything passes through here, monitored by a compact digital gauge that quietly judges the pressure situation.",
    location: "HydroponicsCellar",
    vocab: ["t", "connector", "pipe", "junction"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MasterValve",
    name: "large metal valve",
    description:
      "A large circular metal valve, roughly three feet across, is bolted to one of the bigger pipes. It looks like the kind of thing you turn when you want something important to happen, or explode.",
    initialDescription:
      "Connected to one of the large pipes is a big metal valve, its wheel bright against the stained metal around it.",
    sceneryDescription:
      "The valve’s grip is worn smooth in a few places, suggesting someone has already had a very intense conversation with it.",
    location: "HydroponicsCellar",
    vocab: ["large", "big", "metal", "master", "valve", "wheel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MixValve",
    name: "small metal valve",
    description:
      "A smaller circular metal valve with a rubber grip, only a couple of inches across, is mounted on the main connecting pipe.",
    initialDescription:
      "Mounted on the large pipe connecting the two loading bays is a small metal valve with a rubberized handwheel.",
    sceneryDescription:
      "The little valve looks harmless, the rubber grip invitingly textured. The fact that it’s tied into a system that sprays chemicals around the room is probably fine.",
    location: "HydroponicsCellar",
    vocab: ["small", "smaller", "metal", "mix", "valve"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "Gauge",
    name: "pressure gauge",
    description:
      "A compact pressure gauge with a small LCD display is mounted near the T-connector.",
    sceneryDescription:
      "The face of the gauge glows orange against a black background, a thin needle and digital readout collaborating to tell you just how close you are to breaking something important.",
    location: "HydroponicsCellar",
    vocab: ["pressure", "gauge", "needle", "electronic", "lcd", "display"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MACHINE",
    name: "manual sprinkler override machine",
    description:
      'A large, heavy-looking machine dominates one wall: two upright rectangular units joined at the base and connected by a broad pipe. Each housing has a bay door that hinges downward at an angle. A black LCD gauge is mounted on the connecting pipe, and stenciled across the chassis are the words: "Manual Sprinkler System Override."',
    sceneryDescription:
      "The machine looks like someone tried to build a fire suppression system and a bomb loader out of the same hardware, then called it a safety feature.",
    location: "HydroponicsCellar",
    vocab: [
      "large",
      "machine",
      "manual",
      "sprinkler",
      "override",
      "system",
      "unit",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "CylindricalOpeningOne",
    name: "large cylindrical opening",
    description:
      "A large cylindrical opening inside the left bay, about a foot in diameter and roughly three feet deep, waits to be fitted with a pressurized canister.",
    sceneryDescription:
      "The interior walls are smooth and lined with locking grooves, clearly designed to accept only a very specific shape of canister.",
    location: "HydroponicsCellar",
    vocab: ["cylindrical", "opening", "left", "one", "large"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "CylindricalOpeningTwo",
    name: "narrow cylindrical opening",
    description:
      "A narrower cylindrical opening inside the right bay, about four inches in diameter and about three feet deep, clearly intended for a different type of canister.",
    sceneryDescription:
      "The bore here is tight and precise, ringed with smaller locking channels—this one expects a perfectly matched payload.",
    location: "HydroponicsCellar",
    vocab: ["cylindrical", "opening", "right", "two", "narrow"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "BayOne",
    name: "left loading bay",
    description:
      "The left loading bay is built into the first upright housing of the machine. Its heavy door hinges downward at a forty-five degree angle to reveal a large cylindrical opening when open.",
    sceneryDescription:
      "Scuff marks and faint chemical stains along the bay’s lip suggest it’s seen a lot of canisters in its time, most of them probably uncomfortably pressurized.",
    location: "HydroponicsCellar",
    vocab: ["loading", "bay", "one", "left", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 1,

    overrides: {
      insert:
        "Whatever you’re trying to load doesn’t seem to seat correctly in the bay. The opening looks keyed to a very specific canister.",
      open: "You swing the bay door down at an angle, exposing the large cylindrical opening inside.",
      close:
        "You push the bay door back up until it latches with a solid, mechanical thunk.",
    },
  },
  {
    id: "BayTwo",
    name: "right loading bay",
    description:
      "The right loading bay mirrors the left, but the opening inside is narrower, clearly designed for a different canister profile.",
    sceneryDescription:
      "The right bay’s interior is cleaner, its walls showing fewer scuffs—either it saw less use, or what it dispensed was more polite about leaving residue.",
    location: "HydroponicsCellar",
    vocab: ["loading", "bay", "two", "right", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 1,

    overrides: {
      insert:
        "The canister grinds awkwardly and refuses to sit in place. This bay is keyed to something else.",
      open: "The bay door folds down at an angle, revealing a narrow cylindrical opening inside.",
      close:
        "You push the bay door back into place until the locking mechanism clicks shut.",
    },
  },
  {
    id: "RemoteYellowIND",
    name: "indicator light",
    description:
      "A circular status disk mounted to the wall, its surface glowing with a hard, electric yellow light.",
    initialDescription:
      "The disk is glowing with an electric yellow light that cuts sharply through the shadows.",
    sceneryDescription:
      "The yellow glow gives the surrounding bulkhead a jaundiced cast, like the whole station is running on borrowed power and bad health.",
    location: "RemotePowerStation",
    vocab: ["glow", "indicator", "light", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "GridYellowIND",
    name: "indicator light",
    description: "The disk is glowing with an electric yellow light.",
    sceneryDescription: "",
    location: "PowerGrid",
    vocab: ["glow", "indicator", "light", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "PowerStation",
    name: "power station",
    description:
      "It looks like the ship’s nervous system, all blinking indicators and quiet hums.",
    sceneryDescription:
      "A massive control station for the ship’s power grid dominates the room, a dizzying forest of gauges and lights covering its surface. The lights are a mixture of greens, yellows, and reds, and you can see that some of the gauges needles are moving into the warning zone but don't have a clear idea what they all mean.",
    location: "PowerGrid",
    vocab: ["grid", "power", "station", "console", "panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 0,
    },
    itemWeight: 800,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PowerStationKeyboard",
    name: "power station keyboard",
    description: "The legends on some of the keys are half-worn away.",
    sceneryDescription:
      "In the middle of the main panel is a well-used keyboard, its keys slightly polished from long hours of nervous typing,",
    location: "PowerGrid",
    vocab: ["keyboard", "keypad"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PowerStationMonitor",
    name: "view screen",
    description:
      "The viewscreen is mounted above the power station keyboard. This must be how you access the ship's power systems.",
    sceneryDescription: `and mounted above the keyboard is a flat nineteen-inch viewscreen.`,
    location: "PowerGrid",
    vocab: ["view", "screen", "monitor", "video", "viewscreen"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
      onNoPower: "The viewscreen is currently dark.",
    },
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "PowerStationKeyhole",
    name: "large keyhole",
    description:
      "The receptacle seems to be for a key, presumably needed in order to activate the console.",
    sceneryDescription: `Next to the keyboard is a large, round silver receptacle, like a keyhole for a large key. Markings show two positions: one labeled "O" and one labeled "I".`,
    location: "PowerGrid",
    vocab: ["power", "keyhole", "receptacle", "slot"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      onInsertKey:
        "You insert the black and yellow key into the panel's keyhole.",
      onWrongKey: "It doesn't fit in the panel's keyhole.",
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
    allowedContentsIds: ["PowerStationKey"],
  },
  {
    id: "PowerStationButton",
    name: "square red button",
    description:
      "Next to the keyhole there is a square, raised red button. In idle mode it’s dark; when the key is turned it flashes, and once power is fully engaged it glows with a steady, solid light.",
    sceneryDescription:
      "Next to the receptable is a square, raised red button.",
    location: "PowerGrid",
    vocab: ["square", "red", "button"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      onPowered: "The red button is lit solid.",
      powerKey: "power-initialized",
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 1,
    itemSize: 1,
    isPushable: true,
    overrides: {
      push: pushPowerStationButton,
    },
  },

  {
    id: "ShedCellarKey",
    name: "rusted metal key",
    description: "A rusted metal padlock key.",
    location: "seeded",
    vocab: ["shed", "key", "shed key"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "key",
    },
  },
  {
    id: "ShackCellarKey",
    name: "rusted metal key",
    description: "A rusted metal padlock key.",
    location: "seeded",
    vocab: ["shack", "key", "shack key"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "key",
    },
  },
  {
    id: "GamePreserveControlPanel",
    name: "preserve control panel",
    description:
      "A compact CRT control panel is mounted into the wall beside the staging pad. A heavy rotary dial dominates the left side of the faceplate, while a square button labeled HUNT sits to the right beneath a short status readout.",
    sceneryDescription:
      "Mounted beside the staging area is a preserve control panel with a difficulty selector, a tiny CRT readout, and a square button labeled BEGIN.",
    location: "GamePreservePortal",
    vocab: [
      "preserve",
      "control",
      "panel",
      "console",
      "crt",
      "screen",
      "dial",
      "difficulty",
      "button",
      "hunt",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: {
      kind: "game-preserve-terminal",
    },
  },
];
