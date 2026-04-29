import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { getItemById } from "@game/helpers/itemHelpers";
import { removeItemFromPlacementLists } from "@game/helpers/itemPlacement";
import { updateItemLocation } from "@game/rules/items";
import type { RuleResult } from "@game/rules/result";
import { inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import { GAME_PRESERVE_STAGING_ROOM_ID } from "src/world/maps/levelFour/gamePreserveRules";
import { clearAnimalStatus } from "./animalStatus";
import { removePreserveWhistle } from "./preserveState";

export const GAME_PRESERVE_TROPHY_DAIS_ID = "GamePreserveTrophyDais";
export const GAME_PRESERVE_PRIZE_ID = "GamePrize";

const GAME_PRESERVE_TROPHY_ROOM_ID = "TrophyRoom";

const ACCEPTABLE_TROPHY_IDS = new Set([
  "BoarTusk",
  "BadgerClaw",
  "BrokenHorn",
  "BearViscera",
  "BarryHair",
]);

export function handleGamePreserveTrophySubmission(
  state: GameState,
  args: {
    hostId: string;
    itemId: string;
  },
): RuleResult | undefined {
  if (args.hostId !== GAME_PRESERVE_TROPHY_DAIS_ID) return undefined;
  if (!ACCEPTABLE_TROPHY_IDS.has(args.itemId)) return undefined;

  const trophy = getItemById(state, args.itemId);
  const trophyName = trophy?.name ?? "trophy";

  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      surfaceContents: removeItemFromPlacementLists(
        state.itemState.surfaceContents,
        args.itemId,
      ),
    },
  };

  next = updateItemLocation(next, args.itemId, GAME_PRESERVE_STAGING_ROOM_ID);

  if (!inventoryHas(next.player.inventory, GAME_PRESERVE_PRIZE_ID)) {
    next = updateItemLocation(
      next,
      GAME_PRESERVE_PRIZE_ID,
      GAME_PRESERVE_TROPHY_ROOM_ID,
    );
  }

  return {
    state: next,
    message:
      `Hidden speakers crackle to life. "Congratulations on your TECHNICALLY SUCCESSFUL hunt! Your hunting trophy has been deemed TECHNICALLY ACCEPTABLE! You should be MODERATELY proud of yourself!"\n\n` +
      `The ${trophyName} vanishes from the ceremonial dais in a clean white flash.\n\n` +
      `"Your TECHNICALLY ACCEPTABLE achievement will now be immortalized on canvas! Please stand by to receive your complimentary oil painting!"\n` +
      `"Error: Printing failed!"\n` +
      `"Error: Custom canvas printer offline!"\n` +
      `"Rerouting..."\n\n` +
      `"Please take your ERROR to celebrate your TECHNICALLY ACCEPTABLE hunt! Please come again!"\n\n` +
      `The air crackles again, and an item appears in a flash of white light.`,
  };
}

function markCurrentPreserveDifficultyCompleted(state: GameState): GameState {
  const difficulty =
    state.worldState.gamePreserve.run?.difficulty ??
    state.worldState.gamePreserve.selectedDifficulty;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      gamePreserve: {
        ...state.worldState.gamePreserve,
        completedDifficulties: {
          ...state.worldState.gamePreserve.completedDifficulties,
          [difficulty]: true,
        },
      },
    },
  };
}

function releaseAttachedBadgerForReturn(state: GameState): GameState {
  if (state.itemState.attachedTo.badger !== "PLAYER") return state;

  let next: GameState = {
    ...state,
    itemState: {
      ...state.itemState,
      attachedTo: {
        ...state.itemState.attachedTo,
        badger: undefined,
      },
    },
  };

  next = clearAnimalStatus(next, "badger", "attached");
  return updateItemLocation(next, "badger", GAME_PRESERVE_STAGING_ROOM_ID);
}

export function handleGamePreservePrizeTaken(
  state: GameState,
  fromRoomId: string,
): RuleResult {
  let next = markCurrentPreserveDifficultyCompleted(state);
  next = movePlayerToRoom(next, "GamePreservePortal", {
    fromRoomId,
    via: "out",
  });
  next = removePreserveWhistle(next);

  return {
    state: next,
    message:
      "Taken.\n\nThe retrieval gate flares white around you. When the light clears, you are back in the preserve portal.",
  };
}

export function handleGamePreserveEmptyHandReturn(
  state: GameState,
  fromRoomId: string,
): RuleResult {
  const released = releaseAttachedBadgerForReturn(state);
  const next = movePlayerToRoom(released, "GamePreservePortal", {
    fromRoomId,
    via: "out",
  });

  return {
    state: next,
    message: `The engraving warms beneath your empty hand. A polite chime sounds, followed by a disappointed voice: "Leaving empty handed I see? Well, there's ONLY SOME shame in that. Feel free to try again at any time!"\n\nA clean white flash swallows the trophy room.`,
  };
}
