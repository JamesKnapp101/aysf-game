import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import {
  getItemPlacementContext,
  removeItemFromPlacementLists,
} from "@game/helpers/itemPlacement";
import { isRoomPhysicallyLit } from "@game/helpers/visibilityHelpers";
import { isItemOpen } from "@game/rules/containers";
import { updateItemLocation } from "@game/rules/items";
import {
  findItemsByVocabulary,
  resolveItemByVocabulary,
} from "@game/rules/scope";
import { addToInventory, removeFromInventory } from "@game/rules/state";
import { getCoolerMode } from "@game/selectors/gadgetSelectors";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item, ItemCommandOverrideContext } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export const CHEF_SAMPLE_ID = "ChefSample";
export const CHEF_SAMPLE_WARM_TURNS = 4;
export const CHEF_SAMPLE_EXTRACTION_MESSAGE = `You use the carving knife to slice off the smallest possible sample, but the chef doesn't even flinch.\n\n"Take as much as you need..." he says.\n\nThe corrupted slice of flesh quivers in your hand for a moment before going still.`;
export const CHEF_SAMPLE_DUPLICATE_MESSAGE =
  "Give the poor guy a break, at least only take one at a time.";
export const CHEF_SAMPLE_EXPIRATION_MESSAGE =
  "The sample from the poor chef twitches, quivers for a moment, then dissolves into nothing.";
const RAW_DESCRIPTION =
  "It's a small slice of raw flesh, webbed through with dark red lines.";
const SCULPTURE_DESCRIPTION =
  "It's deep red and hard, like glass. The shape seems random, covered with intricate ripples and grooves.";

const FROZEN_DESCRIPTION =
  "It's a small slice of raw, frozen flesh riddled with dark red lines.";

export function getChefSampleEnvironment(state: GameState) {
  const placement = getItemPlacementContext(state, CHEF_SAMPLE_ID);
  // Cooling is derived, so placement and free mode controls take effect immediately.
  const frozen =
    Boolean(placement.roomId) &&
    getCoolerMode(state) === "freeze" &&
    placement.containers.some((container) => container.id === "Cooler");
  const preserved = placement.roomId === "WalkIn" || frozen;
  const illuminated = Boolean(
    placement.roomId && isRoomPhysicallyLit(state, placement.roomId),
  );
  const exposed =
    !placement.concealed &&
    placement.containers.every(
      (container) =>
        isItemOpen(state, container.id) ||
        container.meta?.transparentContainer === true,
    );
  return {
    ...placement,
    preserved,
    frozen,
    illuminated,
    sculpture: !preserved && illuminated && exposed,
  };
}

/** Biological viability is independent of its light-dependent appearance. */
export function getAccessibleChefSampleRoom(
  state: GameState,
): string | undefined {
  if ((state.worldState.chefSample?.remainingWarmTurns ?? 0) <= 0)
    return undefined;
  const environment = getChefSampleEnvironment(state);
  if (
    environment.frozen ||
    environment.concealed ||
    environment.containers.some((container) => !isItemOpen(state, container.id))
  )
    return undefined;
  return environment.roomId;
}

export const chefSampleItems: Item[] = [
  {
    id: CHEF_SAMPLE_ID,
    name: "corrupted flesh sample",
    named: (state) => {
      const environment = getChefSampleEnvironment(state);
      return environment.frozen
        ? "frozen flesh sample"
        : environment.sculpture
          ? "small sculpture"
          : "corrupted flesh sample";
    },
    description: RAW_DESCRIPTION,
    describe: (state) => {
      const environment = getChefSampleEnvironment(state);
      return environment.frozen
        ? FROZEN_DESCRIPTION
        : environment.sculpture
          ? SCULPTURE_DESCRIPTION
          : RAW_DESCRIPTION;
    },
    location: "seeded",
    vocab: [
      "sample",
      "chef sample",
      "flesh",
      "slice",
      "piece",
      "small sculpture",
      "sculpture",
      "frozen flesh sample",
      "frozen sample",
    ],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 1,
  },
];

function canReachItem(state: GameState, item: Item): boolean {
  const placement = getItemPlacementContext(state, item.id);
  return (
    placement.roomId === state.player.roomId &&
    !placement.concealed &&
    placement.containers.every((container) => isItemOpen(state, container.id))
  );
}

/** One retirement path for expiration, contact death and invalid restored placement. */
export function removeChefSample(state: GameState): GameState {
  const roomId = getItemPlacementContext(state, CHEF_SAMPLE_ID).roomId;
  const next = updateItemLocation(
    removeFromInventory(state, CHEF_SAMPLE_ID),
    CHEF_SAMPLE_ID,
    "seeded",
  );
  const attachedTo = { ...next.itemState.attachedTo };
  const itemRoomId = { ...next.itemState.itemRoomId };
  delete attachedTo[CHEF_SAMPLE_ID];
  for (const [childId, hostId] of Object.entries(attachedTo)) {
    if (hostId !== CHEF_SAMPLE_ID) continue;
    delete attachedTo[childId];
    if (roomId) itemRoomId[childId] = roomId;
  }
  const frozenItems = { ...next.itemState.frozenItems };
  delete frozenItems[CHEF_SAMPLE_ID];
  return {
    ...next,
    worldState: { ...next.worldState, chefSample: undefined },
    itemState: {
      ...next.itemState,
      attachedTo,
      itemRoomId,
      frozenItems,
      containerContents: removeItemFromPlacementLists(
        next.itemState.containerContents,
        CHEF_SAMPLE_ID,
      ),
      containerFilled: removeItemFromPlacementLists(
        next.itemState.containerFilled,
        CHEF_SAMPLE_ID,
      ),
      surfaceContents: removeItemFromPlacementLists(
        next.itemState.surfaceContents,
        CHEF_SAMPLE_ID,
      ),
      underContents: removeItemFromPlacementLists(
        next.itemState.underContents,
        CHEF_SAMPLE_ID,
      ),
      searchableContents: removeItemFromPlacementLists(
        next.itemState.searchableContents,
        CHEF_SAMPLE_ID,
      ),
    },
  };
}

export function extractChefSample({
  state,
  cmd,
}: ItemCommandOverrideContext): ActionResult {
  const chef = state.world.items.find((item) => item.id === "DoomedChef");
  if (state.worldState.walkInChefTransformed || !chef || !canReachItem(state, chef))
    return { state, message: "You don't see the chef here." };

  if (state.worldState.chefSample)
    return { state, message: CHEF_SAMPLE_DUPLICATE_MESSAGE };

  const toolNoun = cmd.indirect?.replace(/^(?:the|a|an)\s+/i, "").trim();
  const candidates = toolNoun
    ? findItemsByVocabulary(state.world.items, toolNoun)
    : state.world.items.filter((item) => item.id === "CarvingKnife");
  const tool = candidates.find((item) => canReachItem(state, item));
  if (tool?.id !== "CarvingKnife") {
    return {
      state,
      message:
        toolNoun &&
        resolveItemByVocabulary(state.world.items, toolNoun)?.id !==
          "CarvingKnife"
          ? "You need the carving knife to take a sample from the chef."
          : "You can't reach the carving knife.",
    };
  }

  // Clear stale placements defensively before reusing the same authored item.
  let next = removeChefSample(state);
  next = updateItemLocation(next, CHEF_SAMPLE_ID, "INVENTORY");
  next = addToInventory(next, CHEF_SAMPLE_ID);
  return {
    state: {
      ...next,
      worldState: {
        ...next.worldState,
        chefSample: { remainingWarmTurns: CHEF_SAMPLE_WARM_TURNS },
      },
    },
    message: CHEF_SAMPLE_EXTRACTION_MESSAGE,
  };
}

/** This three-noun grammar belongs to the chef interaction, not the global parser. */
export function handleChefSampleExtraction(
  state: GameState,
  cmd: ParsedCommand,
): ActionResult | undefined {
  if (cmd.type !== "action" || !["cut", "take", "get"].includes(cmd.verb))
    return undefined;
  const input = cmd.raw.trim().toLowerCase().replace(/\s+/g, " ");
  const match =
    /^(?:carve|slice|cut|take|get) (?:the |a |an )?sample from (.+?)(?: with (.+))?$/.exec(
      input,
    ) ?? /^cut off (?:the |a )?piece of (.+?)(?: with (.+))?$/.exec(input);
  if (!match) return undefined;
  const target = resolveItemByVocabulary(
    state.world.items,
    match[1].replace(/^(?:the|a|an) /, ""),
  );
  if (target?.id !== "DoomedChef") return undefined;
  return target.overrides?.cut?.({
    state,
    item: target,
    cmd: {
      ...cmd,
      verb: "cut",
      direct: "chef",
      indirect: match[2],
      preposition: match[2] ? "with" : undefined,
    },
  });
}

/** Evaluate physical conditions before organisms act and before lifetime expiry. */
export function tickChefSampleDanger(state: GameState): { state: GameState } {
  if (!state.worldState.chefSample) return { state };
  const environment = getChefSampleEnvironment(state);
  if (
    environment.preserved ||
    environment.illuminated ||
    environment.roomId !== state.player.roomId
  )
    return { state };
  return {
    state: triggerPlayerDeath(
      removeChefSample(state),
      "In the dark, something touches you and your body goes rigid. You feel the sensation of something cold and sticky brushing over your bare skin, then a tingle, then everything gets washed away with stark, bright light. You stare into the blinding white void for only a second before being all at once replaced by sudden, final darkness.",
      "organism",
    ),
  };
}

/** Cold protection pauses the remaining budget without resetting it. */
export function tickChefSampleLifetime(state: GameState): {
  state: GameState;
  messages?: string[];
} {
  const sample = state.worldState.chefSample;
  if (!sample) return { state };
  const environment = getChefSampleEnvironment(state);
  if (environment.preserved) return { state };
  // A later world tick may have changed the lighting since the environment phase.
  const checked = tickChefSampleDanger(state).state;
  if (checked !== state) return { state: checked };
  const remainingWarmTurns = sample.remainingWarmTurns - 1;
  if (remainingWarmTurns <= 0 || !environment.roomId) {
    return {
      state: removeChefSample(state),
      messages: [CHEF_SAMPLE_EXPIRATION_MESSAGE],
    };
  }
  return {
    state: {
      ...state,
      worldState: { ...state.worldState, chefSample: { remainingWarmTurns } },
    },
  };
}

export function migrateChefSampleSnapshot(state: GameState): GameState {
  const item = state.world.items.find(
    (candidate) => candidate.id === CHEF_SAMPLE_ID,
  );
  if (!item) return state;
  const sample = state.worldState.chefSample;
  if (
    !sample ||
    !Number.isInteger(sample.remainingWarmTurns) ||
    sample.remainingWarmTurns <= 0 ||
    sample.remainingWarmTurns > 6 ||
    !getItemPlacementContext(state, CHEF_SAMPLE_ID).roomId
  ) {
    return removeChefSample(state);
  }
  return {
    ...state,
    // A prior working-tree setting allowed six turns. Keep those active saves,
    // capping their remaining budget without ever adding turns to a sample.
    worldState: sample.remainingWarmTurns > CHEF_SAMPLE_WARM_TURNS
      ? { ...state.worldState, chefSample: { remainingWarmTurns: CHEF_SAMPLE_WARM_TURNS } }
      : state.worldState,
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [CHEF_SAMPLE_ID]:
          state.itemState.itemRoomId[CHEF_SAMPLE_ID] ?? item.location,
      },
    },
  };
}
