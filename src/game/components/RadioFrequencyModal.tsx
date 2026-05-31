import {
  clampRadioFrequency,
  formatRadioFrequency,
  getCurrentRadioFrequency,
  RADIO_FREQUENCY_MAX,
  RADIO_FREQUENCY_MIN,
  RADIO_FREQUENCY_STEP,
  setRadioFrequency,
} from "@game/helpers/radioHelpers";
import type { GameState } from "@game/types/gameTypes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/radio-frequency-modal.css";
import { CrtModal } from "./CrtModal";

type RadioFrequencyModalProps = {
  onClose: () => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  state: GameState;
};

function getFrequencyPercent(frequency: number): number {
  return (
    ((frequency - RADIO_FREQUENCY_MIN) /
      (RADIO_FREQUENCY_MAX - RADIO_FREQUENCY_MIN)) *
    100
  );
}

export function RadioFrequencyModal({
  onClose,
  setGameState,
  state,
}: RadioFrequencyModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const currentFrequency = getCurrentRadioFrequency(state);
  const [draftFrequency, setDraftFrequency] = useState(currentFrequency);

  useEffect(() => {
    setDraftFrequency(currentFrequency);
  }, [currentFrequency]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const displayFrequency = formatRadioFrequency(draftFrequency);
  const needlePercent = useMemo(
    () => getFrequencyPercent(draftFrequency),
    [draftFrequency],
  );

  const updateFrequency = (rawValue: string) => {
    applyFrequency(Number(rawValue));
  };

  const applyFrequency = (frequency: number) => {
    const nextFrequency = clampRadioFrequency(frequency);

    setDraftFrequency(nextFrequency);
    setGameState((prev) => setRadioFrequency(prev, nextFrequency));
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY === 0) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const stepMultiplier = event.shiftKey ? 10 : 1;
    applyFrequency(
      draftFrequency + direction * RADIO_FREQUENCY_STEP * stepMultiplier,
    );
  };

  return (
    <CrtModal title="Radio Frequency" onClose={onClose} width={520}>
      <div
        className="radio-frequency-panel crt-modal-fill"
        onWheel={onWheel}
        ref={rootRef}
        tabIndex={-1}
      >
        <div className="radio-frequency-readout" aria-live="polite">
          {displayFrequency}
        </div>
        <div
          className="radio-frequency-band"
          style={
            {
              "--radio-frequency-pos": `${needlePercent}%`,
            } as React.CSSProperties
          }
        >
          <div className="radio-frequency-ticks" aria-hidden="true">
            <span>{RADIO_FREQUENCY_MIN.toFixed(3)}</span>
            <span>{RADIO_FREQUENCY_MAX.toFixed(3)}</span>
          </div>
        </div>
        <input
          aria-label="Radio frequency"
          className="radio-frequency-slider"
          max={RADIO_FREQUENCY_MAX}
          min={RADIO_FREQUENCY_MIN}
          onChange={(event) => updateFrequency(event.currentTarget.value)}
          step={RADIO_FREQUENCY_STEP}
          type="range"
          value={draftFrequency}
        />
        <span className="radio-mouse-wheel">
          Tip: Use mouse wheel for finer control
        </span>
      </div>
    </CrtModal>
  );
}

export default RadioFrequencyModal;
