import { useUIEffectsStore } from "../store/store";

/** Complete the already-triggered reveal without a mounted panel or animation timers. */
export function consumeOrganismDeathSequence() {
  const effects = useUIEffectsStore.getState();
  const payload = effects.organismDeath;
  if (!payload) return { completed: false, fragments: [] as string[] };
  // Revealed chunks accumulate in their original positions in the React panel.
  // Present that final layout, including block spacing, without decoding it or
  // exposing the seed, reveal timings, or any untriggered story content.
  const fragments = [[payload.title, payload.cipherText].filter(Boolean).join("\n\n")];
  // Use the same completion callback as the panel, exactly once.
  effects.clearOrganismDeath();
  return { completed: true, fragments };
}
