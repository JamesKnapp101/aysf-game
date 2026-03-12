import { startRadioCall } from "@game/helpers/conversationHelpers";
import { KEVIN_FIRST_CONTACT_ID } from "@game/npcRegistry";
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
        KEVIN_FIRST_CONTACT_ID,
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
