import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import {
  maybeAwardBarMemoryBox,
  maybeAwardBarTriviaPrize,
} from "src/world/maps/levelThree/Park/Bar/barBartenderRewards";
import {
  giveDartToBarBartender,
  throwDartAtBarDartboard,
} from "src/world/maps/levelThree/Park/Bar/barDarts";
import { orderBarDrink } from "src/world/maps/levelThree/Park/Bar/barDrinks";

type AskForActionHandler = {
  handle: (
    state: GameState,
    target: ConversationTarget,
    request: string,
  ) => ActionResult;
  matchesTarget: (target: ConversationTarget) => boolean;
};

type GiveActionHandler = (ctx: {
  item: Item;
  state: GameState;
  target: Item;
}) => ActionResult | undefined;

type ThrowActionHandler = (ctx: {
  item: Item;
  state: GameState;
  target: Item;
}) => ActionResult | undefined;

type TellRewardHandler = (
  state: GameState,
  npcId: string,
  topic: string,
) => { message?: string; state: GameState };

const ASK_FOR_ACTION_HANDLERS: AskForActionHandler[] = [
  {
    matchesTarget: (target) =>
      target.kind === "npc" && target.npc.id === "BarBot",
    handle: (state, _target, request) => orderBarDrink(state, request),
  },
];

const ORDER_ACTION_HANDLERS: ((
  state: GameState,
  request: string,
) => ActionResult | undefined)[] = [
  (state, request) => orderBarDrink(state, request),
];

const GIVE_ACTION_HANDLERS: GiveActionHandler[] = [
  ({ state, item, target }) =>
    item.id === "Dart" && target.id === "BarBot"
      ? giveDartToBarBartender(state)
      : undefined,
];

const THROW_ACTION_HANDLERS: ThrowActionHandler[] = [
  ({ state, item, target }) =>
    item.id === "Dart" && target.id === "BarDartboard"
      ? throwDartAtBarDartboard(state)
      : undefined,
];

const TELL_REWARD_HANDLERS: TellRewardHandler[] = [
  maybeAwardBarMemoryBox,
  maybeAwardBarTriviaPrize,
];

export function hasRegisteredAskForTarget(
  target: ConversationTarget,
): boolean {
  return ASK_FOR_ACTION_HANDLERS.some((handler) =>
    handler.matchesTarget(target),
  );
}

export function handleRegisteredAskForAction(
  state: GameState,
  target: ConversationTarget,
  request: string,
): ActionResult | undefined {
  const handler = ASK_FOR_ACTION_HANDLERS.find((candidate) =>
    candidate.matchesTarget(target),
  );

  return handler?.handle(state, target, request);
}

export function handleRegisteredOrderAction(
  state: GameState,
  request: string,
): ActionResult | undefined {
  for (const handler of ORDER_ACTION_HANDLERS) {
    const result = handler(state, request);
    if (result) return result;
  }

  return undefined;
}

export function handleRegisteredGiveAction(ctx: {
  item: Item;
  state: GameState;
  target: Item;
}): ActionResult | undefined {
  for (const handler of GIVE_ACTION_HANDLERS) {
    const result = handler(ctx);
    if (result) return result;
  }

  return undefined;
}

export function handleRegisteredThrowAction(ctx: {
  item: Item;
  state: GameState;
  target: Item;
}): ActionResult | undefined {
  for (const handler of THROW_ACTION_HANDLERS) {
    const result = handler(ctx);
    if (result) return result;
  }

  return undefined;
}

export function applyRegisteredTellRewards(
  result: ActionResult,
  target: ConversationTarget,
  topic: string,
): ActionResult {
  if (target.kind !== "npc" || target.via !== "direct") {
    return result;
  }

  let rewardState = result.state;
  const rewardMessages: string[] = [];

  for (const maybeAward of TELL_REWARD_HANDLERS) {
    const reward = maybeAward(rewardState, target.npc.id, topic);
    rewardState = reward.state;
    if (reward.message) rewardMessages.push(reward.message);
  }

  if (rewardMessages.length === 0) return result;

  const noCareMessage = `${target.npc.name} doesn't seem to care.`;
  const baseMessage =
    result.message?.trim() === noCareMessage ? "" : result.message?.trim();

  return {
    ...result,
    state: rewardState,
    message: [baseMessage, ...rewardMessages].filter(Boolean).join("\n\n"),
  };
}
