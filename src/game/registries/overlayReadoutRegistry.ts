import { apiaryReadout } from "src/world/zoneRegistrations";
import type { GameState } from "../types/gameTypes";
import type { Overlay } from "../types/uiTypes";

const READOUTS: Partial<Record<Overlay["kind"], (state: GameState) => string>> = {
  "apiary-terminal": apiaryReadout,
};

export function registeredOverlayReadout(kind: Overlay["kind"], state: GameState): string | undefined {
  return READOUTS[kind]?.(state);
}

export function hasRegisteredOverlayReadout(kind: Overlay["kind"]): boolean {
  return Boolean(READOUTS[kind]);
}
