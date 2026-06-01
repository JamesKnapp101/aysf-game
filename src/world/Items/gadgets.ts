import { startRadioCall } from "@game/helpers/conversationHelpers";
import {
  getCurrentRadioFrequency,
  getCurrentRadioFrequencyDisplay,
} from "@game/helpers/radioHelpers";
import { YOU_FIRST_CONTACT_ID } from "@game/npcRegistry";
import { applyRegisteredRadioCallEffects } from "@game/registries/radioCallEffectRegistry";
import type { GameState } from "../../game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";

const FIRST_RADIO_CALL_MESSAGE = `*pop* "Yes, I'm here...holy shit I thought I was the last one...(heavy breathing) Look, I don't have much time here so listen up (cough). If I'm right, you're standing somewhere naked, wondering where you are, and what the hell is going on. I wish I had more time to explain but I don't, you're gonna have to trust me (cough). Shit has gone sideways, and we have to set things right before it's too late. I think we might be the last ones. (cough cough) There's something in here with us, but that's the least of your worries...the power is out...and the reactor...is unstable..." The voice goes quite for a few seconds, then you hear him groan. "Sorry...but if you got anything you wanna ask me...or tell me...you better do it quick, pal..." *pop*`;

function pushRadioCallButton({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  let next = state;
  const frequency = getCurrentRadioFrequency(state);
  const frequencyDisplay = getCurrentRadioFrequencyDisplay(state);
  let message = `You press the radio's call button, and it emits a beep at frequency ${frequencyDisplay}.`;

  const radioEffects = applyRegisteredRadioCallEffects(next, {
    frequency,
    frequencyDisplay,
  });
  next = radioEffects.state;
  if (radioEffects.message) {
    message += ` ${radioEffects.message}`;
  }

  if (!state.worldState.conditionalTriggers.radioFirstCall) {
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        conditionalTriggers: {
          ...next.worldState.conditionalTriggers,
          radioFirstCall: true,
        },
      },
    };
    message += ` A moment later, the radio crackles and a voice emits from it.`;
    next = startRadioCall(next, YOU_FIRST_CONTACT_ID, 9, {
      incomingMessage: FIRST_RADIO_CALL_MESSAGE,
    });
  }

  return { state: next, message };
}

function describePrimaryRadio(state: GameState, item: Item): string {
  return `${item.description} It is currently set to frequency ${getCurrentRadioFrequencyDisplay(state)}.`;
}

function openRadioFrequencyDisplay({ state }: { state: GameState }) {
  return {
    state,
    message: "You open the radio's frequency display.",
    overlay: { kind: "radio-frequency" as const },
  };
}

export const specialItems: Item[] = [
  // 1. Flashlight ------------------------------------------------------------
  {
    id: "flashlight",
    name: "LED flashlight",
    description:
      "A compact LED flashlight with a sturdy metal body and a deeply recessed lens for a tight, bright beam.",
    initialDescription: "A metal LED flashlight rests on the dresser.",
    location: "seeded", //"MainReactorPlatform",
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

  // 2. Comet terminal ---------------------------------------------------------
  {
    id: "Comet",
    name: "Comet terminal",
    description:
      "A slim, portable library terminalÃ¢â‚¬â€basically a ruggedized tablet with a matte display and a scattering of status LEDs along one edge.",
    initialDescription:
      "Lying on the bed is a slim electronic device of some kind.",
    location: "INVENTORY", //"SixWestBed",
    vocab: ["comet"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
    meta: {
      kind: "comet-viewer",
    },
  },

  // 3. EMP capsule -----------------------------------------------------------

  // 4. DNA Reader ------------------------------------------------------------

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
    location: "ReactorCore",
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
      "A hand-held two-way radio with a knurled power switch on the left side, a large rectangular push-to-talk button on the right, a small green frequency display above the speaker grille, and a squat black antenna jutting from the top. The casing is cracked on one corner, but it still works. There's a red call button on one side of it.",
    initialDescription:
      "Laying on the floor near the young man's body is some kind of small, hand-held walkie-talkie.",
    location: "StairSix",
    vocab: [
      "radio",
      "walkie-talkie",
      "walkie",
      "cb",
      "call",
      "button",
      "frequency",
      "display",
    ],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isContagious: true,
    isPushable: true,
    isSettable: true,
    describe: describePrimaryRadio,
    overrides: {
      push: pushRadioCallButton,
      set: openRadioFrequencyDisplay,
    },
  },
  {
    id: "RadioTwo",
    name: "a two-way radio",
    description:
      "A hand-held two-way radio with a knurled power switch on the left side, a large rectangular push-to-talk button on the right, and a squat black antenna jutting from the top. The casing is cracked on one corner, but it still works.",
    initialDescription:
      "Laying on the floor near the man is a hand-held walkie-talkie.",
    location: "Warehouse",
    vocab: ["radio", "walkie-talkie", "walkie", "cb"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isSwitchable: true,
    isOn: true,
    meta: {
      remoteRadio: "Radio",
    },
  },
  // 11. Night Vision Goggles -----------------------------------------------
  {
    id: "NVGoggles",
    name: "night vision goggles",
    description:
      "A pair of high-tech goggles with a black elastic strap. Beside the right eyepiece sits a selector lens that can switch between several imaging modes.",
    initialDescription:
      "Hanging around your twin's neck is a pair of high-tech goggles.",
    location: "Warehouse",
    vocab: ["goggles", "night", "vision"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    isWearable: true,
    isSwitchable: true,
    clothingSlot: "face",
    scoreId: "obtained_nv_goggles",
  },
];
