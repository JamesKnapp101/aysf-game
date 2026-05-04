import {
  CAT_ID,
  IGGY_COLLAR_ID,
  isCatCollarNoun,
  isCatInRoom,
  isWornCatCollarTarget,
} from "@game/helpers/catHelpers";
import {
  GEL_ROUND_IDS,
  attachGelCameraToHost,
  isGelRoundId,
} from "@game/helpers/gelCameraHelpers";
import { inventoryHas } from "@game/rules/state";
import { resolveItemByNoun } from "../../rules/scope";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";
import type { ParsedCommand, Preposition } from "../../types/parserTypes";

type StickPrep = Extract<Preposition, "to" | "on">;

function normalizeStickPrep(preposition?: Preposition): StickPrep | null {
  if (preposition === "to" || preposition === "on") return preposition;
  return null;
}

function resolveStickTarget(
  state: GameState,
  noun: string,
): Item | undefined {
  const resolved = resolveItemByNoun(state, noun);
  if (resolved) return resolved;

  if (
    isCatCollarNoun(noun) &&
    state.worldState.catState.isWearingCollar &&
    isCatInRoom(state)
  ) {
    return state.world.items.find((item) => item.id === IGGY_COLLAR_ID);
  }

  return undefined;
}

function nounMatchesItem(noun: string, item: Item): boolean {
  const normalized = noun.toLowerCase().trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const itemName = item.name.toLowerCase();

  if (itemName === normalized) return true;
  if (item.vocab.some((entry) => entry.toLowerCase() === normalized)) {
    return true;
  }

  const vocabTokens = new Set(
    item.vocab.map((entry) => entry.toLowerCase().trim()).filter(Boolean),
  );
  const nameTokens = new Set(itemName.split(/\s+/).filter(Boolean));

  return tokens.every((token) => vocabTokens.has(token) || nameTokens.has(token));
}

function resolveCarriedGelRound(
  state: GameState,
  noun: string,
): Item | undefined {
  const normalized = noun.toLowerCase().trim();
  const genericGelCameraNouns = new Set([
    "camera",
    "gel camera",
    "gelround",
    "gel round",
    "round",
    "projectile",
  ]);

  const candidates = GEL_ROUND_IDS.map((itemId) =>
    state.world.items.find((item) => item.id === itemId),
  ).filter((item): item is Item => {
    if (!item) return false;
    return (
      inventoryHas(state.player.inventory, item.id) &&
      (genericGelCameraNouns.has(normalized) || nounMatchesItem(noun, item))
    );
  });

  const preferred =
    candidates.find(
      (item) =>
        !state.itemState.activeGelCameras[item.id] &&
        !state.itemState.attachedTo[item.id],
    ) ?? candidates[0];

  if (preferred) return preferred;

  const resolved = resolveItemByNoun(state, noun);
  if (
    resolved &&
    isGelRoundId(resolved.id) &&
    inventoryHas(state.player.inventory, resolved.id)
  ) {
    return resolved;
  }

  return undefined;
}

export function doStick(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "stick") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Stick what?" };
  }

  const prep = normalizeStickPrep(cmd.preposition);
  if (!prep) {
    return { state, message: "Try: stick X to Y." };
  }

  const indirect = cmd.indirect?.trim();
  if (!indirect) {
    return { state, message: "Stick it to what?" };
  }

  const gelRound = resolveCarriedGelRound(state, direct);
  if (!gelRound) {
    return {
      state,
      message: "That does not seem to be one of the sticky gel camera rounds.",
    };
  }

  const target = resolveStickTarget(state, indirect);
  if (!target) {
    return { state, message: "You don't see that here." };
  }

  if (target.id === gelRound.id) {
    return { state, message: "That doesn't make sense." };
  }

  const targetIsWornCatCollar = isWornCatCollarTarget(state, target.id);
  const hostId = targetIsWornCatCollar ? CAT_ID : target.id;
  const next = attachGelCameraToHost(state, gelRound.id, hostId);

  if (targetIsWornCatCollar) {
    return {
      state: next,
      message: "You press the sticky gel camera onto the cat's collar.",
    };
  }

  return {
    state: next,
    message: `You press the sticky gel camera onto the ${target.name}.`,
  };
}
