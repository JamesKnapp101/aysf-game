import { useEffect } from "react";
import "../../styles/components/syndrome-x-signal-overlay.css";
import { useUIEffectsStore } from "../store/store";
import type { VisualEffectsMode } from "../types/gameTypes";

const SYNDROME_X_SIGNAL_DURATION_MS = 2700;

type SyndromeXSignalOverlayProps = {
  visualEffectsMode: VisualEffectsMode;
};

export function SyndromeXSignalOverlay({
  visualEffectsMode,
}: SyndromeXSignalOverlayProps) {
  const signal = useUIEffectsStore((s) => s.syndromeXSignal);
  const clearSyndromeXSignal = useUIEffectsStore(
    (s) => s.clearSyndromeXSignal,
  );

  useEffect(() => {
    if (!signal) return;

    const timeoutId = window.setTimeout(
      clearSyndromeXSignal,
      SYNDROME_X_SIGNAL_DURATION_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [clearSyndromeXSignal, signal]);

  if (!signal) return null;

  return (
    <div
      className="syndrome-x-signal-overlay"
      data-visual-effects={visualEffectsMode}
      aria-live="assertive"
      aria-atomic="true"
    >
      <div key={signal.id} className="syndrome-x-signal-text">
        {signal.text}
      </div>
    </div>
  );
}
