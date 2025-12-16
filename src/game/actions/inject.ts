import {
  applyInjectionEffectToPlayer,
  applyInjectionEffect,
  buildPlayerInjectionMessage,
} from "../rules/injection";
import type { RuleResult } from "../rules/result";
import { resolveItemInScopeByNoun } from "../rules/scope";
import { removeStatusEffectFromPlayer } from "../rules/status";
import { getItemById } from "../selectors/itemSelectors";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState, StatusId } from "../types/gameTypes";
import type { ParsedCommand } from "../types/parserTypes";

function turnsForEffect(effectId: string): number {
  switch (effectId) {
    case "trixophine":
      return 25;
    case "vanitrax":
      return 20;
    case "seritroxin":
      return 15;
    case "pentatrosin":
      return 10;
    case "xantophol":
      return 5;
    default:
      return 0;
  }
}

export function doInject(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "inject") {
    return { state, message: "You can't do that." };
  }

  const hasSyringe = state.player.inventory.includes("Syringe");
  if (!hasSyringe) {
    return { state, message: "You aren't carrying the syringe." };
  }

  const loadedId = state.itemState.syringe.loadedCartridgeId;
  if (!loadedId) {
    return { state, message: "The syringe is empty." };
  }

  const rawTarget =
    (cmd.indirect && cmd.indirect.trim()) ||
    (cmd.direct && cmd.direct.trim()) ||
    "";

  const targetNoun = rawTarget.toLowerCase();
  if (!targetNoun) {
    return { state, message: "Inject what?" };
  }

  // --- inject self ----------------------------------------------------
  if (["me", "self", "myself"].includes(targetNoun)) {
    const doseItem = getItemById(state, loadedId);

    const injectionEffectId = (doseItem?.injectionEffectId ?? "none") as
      | StatusId
      | "none";
    const injectionRemoveEffectId = (doseItem?.injectionRemoveEffectId ??
      "none") as StatusId | "none";

    const result: RuleResult =
      injectionEffectId !== "none"
        ? applyInjectionEffectToPlayer(
            state,
            injectionEffectId,
            turnsForEffect(injectionEffectId)
          )
        : injectionRemoveEffectId !== "none"
        ? removeInjectionEffectFromPlayer(state, injectionRemoveEffectId)
        : { state, message: "You inject yourself. Nothing seems to happen." };

    const next: GameState = {
      ...result.state,
      itemState: {
        ...result.state.itemState,
        syringe: {
          ...result.state.itemState.syringe,
          loadedCartridgeId: undefined,
        },
      },
    };

    return { state: next, message: result.message };
  }

  // --- inject target --------------------------------------------------
  const targetItem = resolveItemInScopeByNoun(state, targetNoun);
  if (!targetItem) {
    return { state, message: "You don't see that here." };
  }

  if (!targetItem.isInjectable) {
    return {
      state,
      message: "That doesn't seem like a good candidate for an injection.",
    };
  }

  const result = applyInjectionEffect(state, targetItem, loadedId);

  const next: GameState = {
    ...result.state,
    itemState: {
      ...result.state.itemState,
      syringe: {
        ...result.state.itemState.syringe,
        loadedCartridgeId: undefined,
      },
    },
  };

  return { state: next, message: result.message };
}

export function removeInjectionEffectFromPlayer(
  state: GameState,
  effectId: StatusId
): RuleResult {
  const next = removeStatusEffectFromPlayer(state, effectId);
  const message = buildPlayerInjectionMessage(state, effectId);
  const removed = next !== state;

  return {
    state: next,
    message: removed
      ? message
      : "You inject yourself, but nothing seems to happen.",
  };
}
