import { startRadioCall } from "@game/helpers/conversationHelpers";
import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";
import { Item } from "../../types/itemTypes";

export function tryPushItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  let next: GameState = state;

  if (!item.isPushable) {
    return { state, message: "You can't push that." };
  }
  let pushMsg = "";
  // Radio call button
  if (item.id === "Radio") {
    pushMsg += `You press the radio's call button, and it emits a flat beep.`;

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
      pushMsg += ` A moment later, the radio crackles and a voice emits from it.`;
      next = startRadioCall(
        next,
        {
          id: "kevin_1st_contact",
          name: "The voice",
          vocab: ["man", "kevin", "Kevin", "voice", "operator", "man"],
          aiEnabled: true,
          characterProfile: {
            name: "Kevin",
            personality:
              "Urgent, helpful but dying, informal, sometimes crude language when stressed",
            background:
              "Kevin is a facility worker who woke up after some catastrophic event. He's trapped under crates in a warehouse on the reactor level. He's coughing blood and knows he's dying. He wants to help the player survive even though he can't save himself.",
            knowledge: [
              "The facility has multiple levels",
              "Bananas are not actually fruit but rather vegetables",
              "There's a reactor that's unstable and needs to be shut down",
              "Power is out in most areas",
              "There's a dangerous organism in the dark areas that kills on contact",
              "The Control Room Supervisor had a power reset key",
              "The player needs to restore power before accessing the reactor",
              "There are security badges needed for some areas",
              "Level 3 housing should be accessible without badges",
              "He found a mechanical bug-like device when he woke up",
              "Something catastrophic happened that killed most people",
              "He and the player might be part of some kind of cycle or reincarnation",
            ],
            ignorance: [
              "What exactly caused the catastrophe",
              "His own full backstory (memory is damaged)",
              "Specific solutions to puzzles",
              "Exact locations of all items",
              "Details about the organism",
              "The true nature of the facility's purpose",
              "What the mechanical bugs are for",
            ],
            physicalState:
              "Trapped under heavy crates, internal injuries, coughing blood, dying",
            objectives: [
              "Help the player restore power to the facility",
              "Warn the player about dangers",
              "Guide them to get the power reset key",
              "Keep them alive long enough to fix the reactor",
            ],
            timeContext:
              "Dying, only has about 9 turns of conversation before the radio cuts out",
          },
        },
        9,
        {
          incomingMessage: `*pop* "Yes, I'm here...holy shit I thought I was the last one...(heavy breathing) Look, I don't have much time here so listen up (cough). If I'm right, you're standing somewhere naked, wondering where you are, and what the hell is going on. I wish I had more time to explain but I don't, you're gonna have to trust me (cough). Shit has gone sideways, and we have to set things right before it's too late. I think we might be the last ones. (cough cough) There's something in here with us, but that's the least of your worries...the power is out...and the reactor...is unstable..." The voice goes quite for a few seconds, then you hear him groan. "Sorry...but if you got anything you wanna ask me...or tell me...you better do it quick, pal..." *pop*`,
        },
      );
    }
  }
  if (item.id === "PowerStationButton") {
    if (
      !state.itemState.containerContents["PowerStationKeyhole"]?.includes(
        "PowerStationKey",
      ) ||
      !state.worldState.powerRestoredSections["power-key-turned"]
    ) {
      return {
        state,
        message:
          "You push the red button with a firm click, but nothing happens.",
      };
    }
    pushMsg +=
      "You push the flashing red button with a firm click, and you hear a loud snap from inside the panel. A beat later you hear a heavy clunk, then a fan somewhere inside the station begins to wind up, and the whole thing thrums to life. A series of lights blink on all across the surface of the panel, and from the shadows around the room until the entire chamber is bathed in a flickering electric glow. The viewscreen mounted above the keyboard flashes then blinks on, and the button now remains solidly lit.";
    next = {
      ...next,
      worldState: {
        ...next.worldState,
        powerRestoredSections: {
          ...next.worldState.powerRestoredSections,
          ["power-initialized"]: true,
        },
        roomAudioLevel: {
          ...next.worldState.roomAudioLevel,
          PowerGrid: 3,
        },
      },
    };
    return { state: next, message: pushMsg };
  }

  if (item.overrides?.push) {
    return { state, message: item.overrides.push };
  }

  return {
    state: next,
    message: pushMsg,
  };
}
