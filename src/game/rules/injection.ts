import type { GameState, StatusId } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { RuleResult } from "./result";
import { applyStatusEffectToPlayer } from "./status";

export function applyInjectionEffect(
  state: GameState,
  target: Item,
): RuleResult {
  const effectId = target.injectionEffectId;

  if (!effectId) {
    return { state, message: "Nothing happens." };
  }

  return {
    state,
    message: `You inject the ${target.name.toLowerCase()}, but nothing seems to happen.`,
  };
}

export function buildPlayerInjectionMessage(
  state: GameState,
  cartridgeEffectId: StatusId
): string {
  let injectionMessage =
    "You grit your teeth and plunge the needle into your arm, slowly depressing the plunger. As the serum floods through your bloodstream, ";

  switch (cartridgeEffectId) {
    case "trixophine":
      injectionMessage +=
        "you feel an almost immediate giddiness in your stomach which floods out to the rest of your body...";
      break;

    case "vanitrax":
      injectionMessage +=
        "you feel a bitter taste fill your mouth...a second later, a wave of fatigue slams into you. Your legs buckle, and your vision gets a little blurry. You take a step forward, but your body feels like it's turned to rubber; you take a few shambling steps forward and just manage to lower yourself face down onto the floor before you fall fast asleep...";
      break;

    case "seritroxin":
    case "radiation":
      if (state.player.statusEffects.some((se) => se.id === "radiation")) {
        injectionMessage +=
          "you feel a pervading giddy warmth, and a moment later the nausea begins to leave you. You take a deep breath...the symptoms of radiation sickness are subsiding.";
      } else {
        injectionMessage +=
          "you feel a pervading giddy warmth, but nothing more.";
      }
      break;

    case "pentatrosin":
      injectionMessage +=
        "you feel a dull heat permeate your body, causing a crippling wave of intense nausea..!";
      break;

    case "xantophol":
      injectionMessage +=
        "you feel a slight fuzziness which passes in a few seconds. Otherwise, you don't feel any effects at all.";
      break;

    case "innoculant":
      injectionMessage +=
        "you feel a warmth which quickly turns to an uncomfortable heat pervading your body. You feel a surge of nausea and for a moment you think you might vomit, but then it begins to pass. The heat subsides into a warm feeling, then disappears, leaving you feeling tired, but otherwise okay.";
      break;

    default:
      injectionMessage += "you don't really feel any different.";
      break;
  }

  return injectionMessage;
}

export function applyInjectionEffectToPlayer(
  state: GameState,
  cartridgeEffectId: StatusId,
  turns: number
): RuleResult {
  const next = applyStatusEffectToPlayer(state, cartridgeEffectId, 1, turns);
  const message = buildPlayerInjectionMessage(state, cartridgeEffectId);
  return { state: next, message };
}
