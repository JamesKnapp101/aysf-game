import { enqueueNotification } from "@game/rules/notifications";
import { updateItemLocation } from "@game/rules/items";
import { getNpcById } from "@game/npcRegistry";
import { collectTeaResult, queueGossipNotification } from "@game/rules/gossip";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState, NpcSecretState } from "@game/types/gameTypes";

export type NpcSecretReward = {
  itemId?: string;
  notificationText?: string;
};

export type NpcSecret = {
  id: string;
  npcId: string;
  text: string;
  requiredGossipCount: number;
  gossip: { id: string; title: string };
  // Optional: require specific gossip IDs (not just any X gossips)
  requiredGossipIds?: string[];
  rewards?: NpcSecretReward[];
};

export const NPC_SECRETS: Record<string, NpcSecret> = {
  nailbot_secret: {
    id: "nailbot_secret",
    npcId: "NailBot",
    text: "Okay, this is supposed to be a secret, but I can tell you... You know the warehouse near the Living Quarters? There's a poor little robot hiding in there someplace, afraid to come out. They tried to decommission it about a hundred years ago but it managed to escape the recycling center and it's been holed up ever since all by itself, for the most part. I visit it from time to time but I'm not allowed to wander too much. You should go visit, it might know something, you'll just need this. Blow the whistle in the warehouse so it knows it can trust you.",
    requiredGossipCount: 3,
    gossip: { id: "gossip_hiding_robot", title: "The Hiding Robot" },
    rewards: [
      {
        itemId: "RobotWhistle",
        notificationText: "You have obtained a small whistle",
      },
    ],
  },
  // Add BarBot and other NPC secrets here in the future
};

export function getSecretForNpc(npcId: string): NpcSecret | undefined {
  return Object.values(NPC_SECRETS).find((secret) => secret.npcId === npcId);
}

function getNpcSecretState(
  state: GameState,
  npcId: string,
): NpcSecretState | undefined {
  return state.worldState.npcSecrets?.[npcId];
}

export function getGossipSharedWithNpc(state: GameState, npcId: string): string[] {
  return [...new Set(state.conversation?.npcs?.[npcId]?.gossipToldIds ?? [])].filter(
    id => state.player.spiltTea?.some(topic => topic.id === id && topic.sourceNpcId !== npcId),
  );
}

function setNpcSecretState(
  state: GameState,
  npcId: string,
  nextSecretState: NpcSecretState,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      npcSecrets: {
        ...state.worldState.npcSecrets,
        [npcId]: nextSecretState,
      },
    },
  };
}

export function isNpcSecretRevealed(state: GameState, npcId: string): boolean {
  return getNpcSecretState(state, npcId)?.secretRevealed === true;
}

export function canRevealNpcSecret(state: GameState, npcId: string): boolean {
  const secret = getSecretForNpc(npcId);
  if (!secret) {
    return false;
  }

  const paymentTrigger = getNpcById(npcId)?.informationExchange?.paymentTrigger;
  if (paymentTrigger && !state.worldState.conditionalTriggers[paymentTrigger]) return false;
  const gossipSharedWithNpc = getGossipSharedWithNpc(state, npcId);
  if (gossipSharedWithNpc.length < secret.requiredGossipCount) {
    return false;
  }

  if (!secret.requiredGossipIds?.length) {
    return true;
  }

  const requiredGossipIds = secret.requiredGossipIds;
  return requiredGossipIds.every((gossipId) =>
    gossipSharedWithNpc.includes(gossipId),
  );
}

export function revealNpcSecretIfEligible(
  state: GameState,
  npcId: string,
): GameState {
  const secret = getSecretForNpc(npcId);
  if (!secret || (!isNpcSecretRevealed(state, npcId) && !canRevealNpcSecret(state, npcId))) {
    return state;
  }

  let nextState = state;

  for (const reward of secret.rewards ?? []) {
    if (reward.itemId) {
      const rewardItem = nextState.world.items.find(
        (item) => item.id === reward.itemId,
      );

      // A partially saved placement must agree with the inventory bucket too.
      if (nextState.itemState.itemRoomId[reward.itemId] === "INVENTORY") {
        nextState = addToInventory(nextState, reward.itemId);
      }

      // pickedUpByPlayer also protects rewards that have since been dropped or used.
      const location = nextState.itemState.itemRoomId[reward.itemId];
      const alreadyGranted = nextState.itemState.pickedUpByPlayer[reward.itemId] ||
        inventoryHas(nextState.player.inventory, reward.itemId) ||
        (location !== undefined && location !== "seeded");
      if (rewardItem && !alreadyGranted) {
        nextState = updateItemLocation(nextState, reward.itemId, "INVENTORY");
        nextState = addToInventory(nextState, reward.itemId);

        if (reward.notificationText) {
          nextState = enqueueNotification(nextState, {
            kind: "system",
            text: reward.notificationText,
          });
        }
      }

      continue;
    }

    if (reward.notificationText && !isNpcSecretRevealed(state, npcId)) {
      nextState = enqueueNotification(nextState, {
        kind: "system",
        text: reward.notificationText,
      });
    }
  }

  const tea = collectTeaResult(nextState, [{
    id: secret.gossip.id,
    title: secret.gossip.title,
    summary: secret.text,
    sourceNpcId: npcId,
    tags: [],
    type: "secret",
  }]);
  nextState = queueGossipNotification(tea.state, tea.obtainedNewTea);
  return setNpcSecretState(nextState, npcId, {
    secretRevealed: true,
  });
}

/** Upgrade the old duplicated ID record and finish interrupted immutable transactions. */
export function migrateNpcSecrets(state: GameState): GameState {
  let next = state;
  for (const secret of Object.values(NPC_SECRETS)) {
    const legacy = next.worldState.npcSecrets?.[secret.npcId] as (NpcSecretState & { gossipSharedIds?: string[] }) | undefined;
    const previous = next.conversation?.npcs?.[secret.npcId];
    const ids = [...new Set(previous?.gossipToldIds ?? legacy?.gossipSharedIds ?? [])];
    if (legacy || previous?.gossipToldIds) {
      next = {
        ...next,
        conversation: {
          ...next.conversation,
          npcs: {
            ...next.conversation?.npcs,
            [secret.npcId]: { ...previous, gossipToldIds: ids },
          },
        },
      };
    }
    if (legacy) {
      next = setNpcSecretState(next, secret.npcId, {
        secretRevealed: legacy.secretRevealed === true,
      });
    }
    if (legacy?.secretRevealed) {
      const paymentTrigger = getNpcById(secret.npcId)?.informationExchange?.paymentTrigger;
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          conditionalTriggers: {
            ...next.worldState.conditionalTriggers,
            ...(paymentTrigger ? { [paymentTrigger]: true } : {}),
          },
        },
      };
    }
    next = revealNpcSecretIfEligible(next, secret.npcId);
  }
  return next;
}
