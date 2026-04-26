import { provokePreserveAnimalWithWhistle } from "@game/preserve/preserveAnimals";
import type { PreserveActorId } from "@game/preserve/preserveTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

function getGameWhistleCall(
  item: Item,
  mode: PreserveActorId,
): string | undefined {
  const calls = item.meta?.calls;
  if (!calls || typeof calls !== "object") return undefined;

  const call = (calls as Partial<Record<PreserveActorId, unknown>>)[mode];
  return typeof call === "string" && call.trim() ? call : undefined;
}

export function tryBlowItem(
  state: GameState,
  item: Item,
): { state: GameState; message: string } {
  if (item.id === "GameWhistle") {
    const settings = state.itemState.itemSettings.GameWhistle;
    const mode =
      settings?.kind === "game-whistle" ? settings.mode : "bull";
    return provokePreserveAnimalWithWhistle(
      state,
      mode,
      getGameWhistleCall(item, mode),
    );
  }

  if (item.id !== "RobotWhistle") {
    return { state, message: "You can't do that." };
  }

  const next = state;
  const baseMsg =
    "You blow into the little whistle but it doesn't make any noise, at least not one you can hear.";

  return {
    state: next,
    message: baseMsg || "It doesn't make any noise.",
  };
}
