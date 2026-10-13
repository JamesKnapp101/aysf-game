import { useUIEffectsStore } from "../store/store";
import { splitMemory } from "../text/memorySequence";

/** Consume only the already-triggered payload, never a target's memory archive. */
export function consumeMindFlashSequence() {
  const effects = useUIEffectsStore.getState();
  const payload = effects.mindFlash;
  if (!payload) return { completed: false, fragments: [] as string[] };
  // The React panel uses the same fallback for empty/exhausted target memories.
  const fragments = splitMemory(payload.memory ?? "");
  // Same completion transition/callback as the timed React sequence, once.
  effects.clearMindFlash();
  return { completed: true, fragments };
}
