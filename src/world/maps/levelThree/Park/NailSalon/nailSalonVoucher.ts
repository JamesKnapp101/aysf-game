import { updateItemLocation } from "@game/rules/items";
import { normalize, resolveConversationTarget } from "@game/rules/scope";
import { inventoryHas, removeFromInventory } from "@game/rules/state";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { MANI_PEDI_VOUCHER_ID } from "../Bar/barBartenderRewards";
import { NAILBOT_PAYMENT_TRIGGER, nailBotExchange } from "./nailBotExchange";

export function handleNailSalonVoucher(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult | undefined {
  if (
    cmd.type !== "action" ||
    !["give", "show", "present", "use", "redeem"].includes(cmd.verb)
  )
    return;
  const noun = normalize(cmd.direct ?? "").replace(/^(the|a|an) /, "");
  if (
    ![
      "voucher",
      "gift card",
      "nail salon voucher",
      "mani pedi voucher",
      "manipedivoucher",
    ].includes(noun)
  )
    return;
  if (state.player.roomId !== "NailSalon")
    return {
      state,
      message: "Present the voucher to the nail-tech at Keratin Kindness.",
      consumesTurn: false,
    };
  const target = resolveConversationTarget(state, cmd.indirect ?? "nailbot");
  if (
    target?.kind !== "npc" ||
    target.npc.id !== "NailBot" ||
    target.via !== "direct"
  )
    return {
      state,
      message: "The voucher is for the nail-tech, darling.",
      consumesTurn: false,
    };
  if (cmd.preposition && !["to", "on", "with", "at"].includes(cmd.preposition))
    return {
      state,
      message: "Try: show voucher to nailbot.",
      consumesTurn: false,
    };
  if (state.worldState.conditionalTriggers[NAILBOT_PAYMENT_TRIGGER])
    return {
      state,
      message:
        '"Already paid, darling. Save your paperwork. Share gossip instead."',
      consumesTurn: false,
    };
  if (!inventoryHas(state.player.inventory, MANI_PEDI_VOUCHER_ID))
    return {
      state,
      message:
        "You aren't carrying a nail salon voucher. Try the Bar's trivia prize.",
      consumesTurn: false,
    };
  let next = removeFromInventory(state, MANI_PEDI_VOUCHER_ID);
  next = updateItemLocation(next, MANI_PEDI_VOUCHER_ID, "redeemed");
  next = {
    ...next,
    worldState: {
      ...next.worldState,
      conditionalTriggers: {
        ...next.worldState.conditionalTriggers,
        [NAILBOT_PAYMENT_TRIGGER]: true,
      },
    },
  };
  return {
    state: next,
    message: `The robot's eyes flicker as it scans the voucher, then it smiles. ${nailBotExchange.greeting}`,
  };
}
