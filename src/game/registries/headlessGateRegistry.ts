import { isDeepStorageSuitOverlayActive } from "src/world/zoneRegistrations";
import type { GameState } from "../types/gameTypes";

const GATES = [
  { kind: "deep-storage-suit", active: isDeepStorageSuitOverlayActive },
];

/** World-specific modal gates belong here, not in the generic session. */
export function pendingHeadlessWorldGate(state: GameState): string | undefined {
  return GATES.find(gate => gate.active(state))?.kind;
}
