import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import { abortVirtualOffice } from "src/world/zoneRegistrations";

type AbortHandler = (state: GameState) => ActionResult | undefined;

const ABORT_HANDLERS: AbortHandler[] = [abortVirtualOffice];

export function tryHandleRegisteredAbort(
  state: GameState,
): ActionResult | undefined {
  for (const handler of ABORT_HANDLERS) {
    const result = handler(state);
    if (result) return result;
  }

  return undefined;
}
