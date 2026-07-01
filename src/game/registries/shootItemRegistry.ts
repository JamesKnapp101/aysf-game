import { startExperience } from "@game/experiences/experienceRegistry";
import { isWornCatCollarTarget } from "@game/helpers/catHelpers";
import { attachGelCameraToHost } from "@game/helpers/gelCameraHelpers";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import type { ItemId } from "@game/types/ids";
import type { Item } from "@game/types/itemTypes";

type ShootItemResult = { state: GameState; message: string };

type ShootBeforeAmmoContext = {
  shotAtItem: Item;
  shotWithItem: Item;
  state: GameState;
};

type ProjectileShootContext = ShootBeforeAmmoContext & {
  firedRoundId: ItemId;
  message: string;
};

type ShootBeforeAmmoHandler = {
  handle: (ctx: ShootBeforeAmmoContext) => ShootItemResult;
  matches: (weapon: Item) => boolean;
};

type ProjectileShootHandler = {
  handle: (ctx: ProjectileShootContext) => ShootItemResult;
  matches: (weapon: Item) => boolean;
};

function ensureSentence(message: string): string {
  return message.endsWith(".") ? message : message + ".";
}

function getMetaString(item: Item, key: string, fallback: string): string {
  const value = item.meta?.[key];
  return typeof value === "string" ? value : fallback;
}

function isCorpseLikeItem(item: Item): boolean {
  if (item.meta?.corpse || item.meta?.isCorpse === true) return true;
  if (item.meta?.isAlive === true) return false;

  const corpseTerms = new Set([
    "body",
    "cadaver",
    "corpse",
    "remains",
    "skeleton",
  ]);

  if (item.vocab?.some((term) => corpseTerms.has(term.toLowerCase()))) {
    return true;
  }

  const name = item.name.toLowerCase();
  return [...corpseTerms].some((term) => name.includes(term));
}

function handleMindGunShot({
  shotAtItem,
  shotWithItem,
  state,
}: ShootBeforeAmmoContext): ShootItemResult {
  let next = state;
  const noCapMessage = getMetaString(
    shotWithItem,
    "onShootNoCap",
    "The scanner hums, but nothing else seems to happen.",
  );
  const withCapMessage = getMetaString(
    shotWithItem,
    "onShootWithCap",
    "The scanner hums against the cap.",
  );

  if (next.itemState.wornByPlayer.head !== "MindCap") {
    return { state: next, message: noCapMessage };
  }

  if (isCorpseLikeItem(shotAtItem)) {
    const corpseMeta = shotAtItem.meta?.corpse;
    const hasIntactHead =
      corpseMeta?.hasIntactHead ?? shotAtItem.meta?.hasIntactHead ?? true;
    const memoryExperienceId =
      corpseMeta?.memoryExperienceId ?? shotAtItem.meta?.memoryExperienceId;

    if (!hasIntactHead || !memoryExperienceId) {
      return {
        state: next,
        message:
          "The scanner's hum thins into a flat diagnostic tone. There is not enough viable cerebral material to extract anything.",
      };
    }

    return startExperience(next, memoryExperienceId, {
      sourceId: shotAtItem.id,
    });
  }

  if (!shotAtItem.meta?.isAlive) {
    return { state: next, message: withCapMessage };
  }

  const targetMemories = shotAtItem.meta?.memories;

  if (!targetMemories) {
    return {
      state: next,
      message: `${withCapMessage} You feel dizzy for a moment, but nothing else happens.`,
    };
  }

  const msg = getMetaString(shotWithItem, "onLink", "Nothing happens.");

  useUIEffectsStore.getState().playMindFlash({
    memory: targetMemories[next.itemState.mindGunMemoryIndex?.[shotAtItem.id]],
    seed: Date.now(),
  });

  const prevIndex = next.itemState.mindGunMemoryIndex?.[shotAtItem.id] ?? -1;
  const newIndex = prevIndex + 1;

  next = {
    ...next,
    itemState: {
      ...next.itemState,
      mindGunMemoryIndex: {
        ...next.itemState.mindGunMemoryIndex,
        [shotAtItem.id]: newIndex,
      },
    },
  };

  return { state: next, message: msg };
}

function handleGelCameraShot({
  firedRoundId,
  message,
  shotAtItem,
  state,
}: ProjectileShootContext): ShootItemResult {
  let next = state;
  const targetIsWornCatCollar = isWornCatCollarTarget(next, shotAtItem.id);
  const hostId = targetIsWornCatCollar ? "cat" : (shotAtItem.id as ItemId);

  next = attachGelCameraToHost(next, firedRoundId, hostId);

  let nextMessage = message;
  if (targetIsWornCatCollar) {
    nextMessage += ` The sticky little projectile adheres to the cat's collar.`;
  } else if (hostId.toLowerCase() === "cat") {
    nextMessage += ` The cat looks momentarily startled as the sticky little projectile adheres to its fur.`;
  } else {
    nextMessage += ` The sticky little projectile adheres to the ${shotAtItem.name}.`;
  }

  return {
    state: next,
    message: ensureSentence(nextMessage),
  };
}

const SHOOT_BEFORE_AMMO_HANDLERS: ShootBeforeAmmoHandler[] = [
  {
    matches: (weapon) => weapon.meta?.shootBehavior === "mind-gun",
    handle: handleMindGunShot,
  },
];

const PROJECTILE_SHOOT_HANDLERS: ProjectileShootHandler[] = [
  {
    matches: (weapon) => weapon.meta?.shootBehavior === "gel-camera",
    handle: handleGelCameraShot,
  },
];

export function tryHandleRegisteredShootBeforeAmmo(
  ctx: ShootBeforeAmmoContext,
): ShootItemResult | null {
  const handler = SHOOT_BEFORE_AMMO_HANDLERS.find((entry) =>
    entry.matches(ctx.shotWithItem),
  );
  return handler ? handler.handle(ctx) : null;
}

export function tryHandleRegisteredProjectileShot(
  ctx: ProjectileShootContext,
): ShootItemResult | null {
  const handler = PROJECTILE_SHOOT_HANDLERS.find((entry) =>
    entry.matches(ctx.shotWithItem),
  );
  return handler ? handler.handle(ctx) : null;
}
