import type { ParsedCommand } from "../../parse/parser";
import { appendLog } from "../engine";
import type { GameState, StatusId } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import { getItemById, resolveItemInScopeByNoun } from "./itemSelectors";
import { applyStatusEffectToPlayer } from "./statusSelectors";

export function applyInjectionEffect(
  state: GameState,
  target: Item,
  cartridgeId: string
): GameState {
  const effectId = target.injectionEffectId;

  if (!effectId) {
    return state;
  }

  // TODO: wire into your status effect system:
  // return addStatusEffect(state, effectId, target.id);

  return state;
}

export function applyInjectionEffectToPlayer(
  state: GameState,
  cartridgeEffectId: StatusId,
  turns: number
): GameState {
  // Hook into your status effect system here:
  // e.g. return addStatusEffect(state, effectId, target.id);
  const withEffect = applyStatusEffectToPlayer(state, cartridgeEffectId, turns);

  let injectionMessage =
    "You grit your teeth and plunge the needle into your arm, slowly depressing the plunger.  As the serum floods through your bloodstream, ";
  switch (cartridgeEffectId) {
    case "trixophine":
      injectionMessage +=
        "you feel an almost immediate giddiness in your stomach which floods out to the rest of your body...";
      break;
    case "vanitrax":
      injectionMessage +=
        "you feel a bitter taste fill your mouth...a second later, a wave of fatigue slams into you.  Your legs buckle, and your vision gets a little blurry.  You take a step forward, but your body feels like it's turned to rubber; you take a few shambling steps forward and just manage to lower yourself face down onto the floor before you fall fast asleep...";
      break;
    case "seritroxin":
      if (state.player.statusEffects.some((se) => se.id === "radiation")) {
        injectionMessage +=
          "you feel a pervading giddy warmth, and a moment later the nausea begins to leave you. You take a deep breath...the symptoms of radiation sickness are subsiding.";
      } else {
        injectionMessage +=
          "you feel a pervading giddy warmth, but nothing more.";
      }
      injectionMessage +=
        "you feel a calming sensation spreading through your body.";
      break;
    case "pentatrosin":
      injectionMessage +=
        "you feel a dull heat permeate your body, causing a crippling wave of intense nausea..!";
      break;
    case "xantophol":
      injectionMessage +=
        "you feel a slight fuzziness which passes in a few seconds.  Otherwise, you don't feel any effects at all.";
      break;
    case "innoculant":
      injectionMessage +=
        "you feel a warmth which quickly turns to an uncomfortable heat pervading your body. You feel a surge of nausea and for a moment you think you might vomit, but then it begins to pass. The heat subsides into a warm feeling, then disappears, leaving you feeling tired, but otherwise okay.";
      break;
    default:
      injectionMessage += "you don't really feel any different.";
      break;
  }

  return appendLog(withEffect, injectionMessage);
}

export function handleInject(state: GameState, cmd: ParsedCommand): GameState {
  // We only support this for parsed action commands
  if (cmd.type !== "action" || cmd.verb !== "inject") {
    return appendLog(state, "You can't do that.");
  }

  // Require syringe in inventory
  const hasSyringe = state.player.inventory.includes("Syringe");
  if (!hasSyringe) {
    return appendLog(state, "You aren't carrying the syringe.");
  }

  if (!state.itemState.syringe.loadedCartridgeId) {
    return appendLog(state, "The syringe is empty.");
  }

  // Prefer "indirect" as the target if present ("inject syringe into bar"),
  // otherwise use "direct" ("inject me", "inject bar").
  const rawTarget =
    (cmd.indirect && cmd.indirect.trim()) ||
    (cmd.direct && cmd.direct.trim()) ||
    "";

  const targetNoun = rawTarget.toLowerCase();

  if (!targetNoun) {
    return appendLog(state, "Inject what?");
  }

  // Special case: inject self
  if (["me", "self", "myself"].includes(targetNoun)) {
    const doseItem = getItemById(
      state,
      state.itemState.syringe.loadedCartridgeId
    );
    const injectionEffectId = doseItem?.injectionEffectId ?? "none";
    let turns = 0;
    switch (injectionEffectId) {
      case "trixophine":
        turns = 25;
        break;
      case "vanitrax":
        turns = 20;
        break;
      case "seritroxin":
        turns = 15;
        break;
      case "pentatrosin":
        turns = 10;
        break;
      case "xantophol":
        turns = 5;
        break;
      default:
        turns = 0;
        break;
    }

    const next = applyInjectionEffectToPlayer(state, injectionEffectId, turns);

    return {
      ...next,
      itemState: {
        ...next.itemState,
        syringe: {
          ...next.itemState.syringe,
          loadedCartridgeId: undefined, // cartridge spent
        },
      },
    };
  }

  const targetItem = resolveItemInScopeByNoun(state, targetNoun);
  if (!targetItem) {
    return appendLog(state, "You don't see that here.");
  }

  if (!targetItem.isInjectable) {
    return appendLog(
      state,
      "That doesn't seem like a good candidate for an injection."
    );
  }

  const afterEffect = applyInjectionEffect(
    state,
    targetItem,
    state.itemState.syringe.loadedCartridgeId!
  );

  return {
    ...afterEffect,
    itemState: {
      ...afterEffect.itemState,
      syringe: {
        ...afterEffect.itemState.syringe,
        loadedCartridgeId: undefined,
      },
    },
  };
}
