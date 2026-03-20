import { enqueueNotification } from "@game/rules/notifications";
import { updateItemLocation } from "@game/rules/items";
import { normalize } from "@game/rules/scope";
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
  // Optional: require specific gossip IDs (not just any X gossips)
  requiredGossipIds?: string[];
  rewards?: NpcSecretReward[];
};

export const NPC_SECRETS: Record<string, NpcSecret> = {
  nailbot_secret: {
    id: "nailbot_secret",
    npcId: "NailBot",
    text: "Okay, this is supposed to be a secret, but I can tell you... You know the warehouse near the Living Quarters? There's a poor little robot hiding in there someplace, afraid to come out. They tried to decommission it about a hundred years ago but it managed to escape the recycling center and it's been holed up ever since all by itself, for the most part. I visit it from time to time but I'm not allowed to wander too much. You should go visit, it might know something, you'll just need this. Blow the whistle in the warehouse so it knows it can trust you.",
    requiredGossipCount: 1,
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
  return state.worldState.npcSecrets[npcId];
}

function getGossipSharedWithNpc(state: GameState, npcId: string): string[] {
  return state.conversation?.npcs?.[npcId]?.gossipToldIds ?? [];
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

  const gossipSharedWithNpc = getGossipSharedWithNpc(state, npcId).map(normalize);
  if (gossipSharedWithNpc.length < secret.requiredGossipCount) {
    return false;
  }

  if (!secret.requiredGossipIds?.length) {
    return true;
  }

  const requiredGossipIds = secret.requiredGossipIds.map(normalize);
  return requiredGossipIds.every((gossipId) =>
    gossipSharedWithNpc.includes(gossipId),
  );
}

export function revealNpcSecretIfEligible(
  state: GameState,
  npcId: string,
): GameState {
  const secret = getSecretForNpc(npcId);
  if (!secret || !canRevealNpcSecret(state, npcId)) {
    return state;
  }

  if (isNpcSecretRevealed(state, npcId)) {
    return state;
  }

  let nextState = state;

  for (const reward of secret.rewards ?? []) {
    if (reward.itemId) {
      const rewardItem = nextState.world.items.find(
        (item) => item.id === reward.itemId,
      );

      if (rewardItem && !inventoryHas(nextState.player.inventory, reward.itemId)) {
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

    if (reward.notificationText) {
      nextState = enqueueNotification(nextState, {
        kind: "system",
        text: reward.notificationText,
      });
    }
  }

  return setNpcSecretState(nextState, npcId, {
    gossipSharedIds: getGossipSharedWithNpc(nextState, npcId),
    secretRevealed: true,
  });
}
