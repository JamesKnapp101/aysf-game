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
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import "../../styles/radio-frequency-modal.css";
import { CrtModal } from "./CrtModal";

const FINE_TUNE_CONTROLS = [
  { label: "-0.050", delta: -RADIO_FREQUENCY_STEP * 10 },
  { label: "-0.005", delta: -RADIO_FREQUENCY_STEP },
  { label: "+0.005", delta: RADIO_FREQUENCY_STEP },
  { label: "+0.050", delta: RADIO_FREQUENCY_STEP * 10 },
] as const;

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
  const draftFrequency = currentFrequency;

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const displayFrequency = formatRadioFrequency(draftFrequency);
  const needlePercent = useMemo(
    () => getFrequencyPercent(draftFrequency),
    [draftFrequency],
  );

  const frequencyStyle = useMemo(
    () =>
      ({
        "--radio-frequency-pos": `${needlePercent}%`,
      }) as React.CSSProperties,
    [needlePercent],
  );

  const applyFrequency = useCallback(
    (frequency: number) => {
      const nextFrequency = clampRadioFrequency(frequency);

      setGameState((prev) => setRadioFrequency(prev, nextFrequency));
    },
    [setGameState],
  );

  const updateFrequency = (rawValue: string) => {
    applyFrequency(Number(rawValue));
  };

  const adjustFrequency = useCallback(
    (delta: number) => {
      applyFrequency(currentFrequency + delta);
    },
    [applyFrequency, currentFrequency],
  );

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY === 0) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const stepMultiplier = event.shiftKey ? 10 : 1;
    adjustFrequency(direction * RADIO_FREQUENCY_STEP * stepMultiplier);
  };

  const onFrequencyKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    event.stopPropagation();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const stepMultiplier = event.shiftKey ? 10 : 1;
    adjustFrequency(direction * RADIO_FREQUENCY_STEP * stepMultiplier);
  };

  const centerFrequency = clampRadioFrequency(
    (RADIO_FREQUENCY_MIN + RADIO_FREQUENCY_MAX) / 2,
  );

  const bandMarks = [
    RADIO_FREQUENCY_MIN,
    centerFrequency,
    RADIO_FREQUENCY_MAX,
  ];

  const sweepBars = [42, 68, 54, 88, 58];

  return (
    <CrtModal
      title="Radio Frequency"
      onClose={onClose}
      width={620}
      showHeader={false}
    >
      <div
        className="radio-frequency-panel crt-modal-fill"
        aria-label="Radio frequency controls"
        onKeyDown={onFrequencyKeyDown}
        onWheel={onWheel}
        ref={rootRef}
        role="group"
        style={frequencyStyle}
        tabIndex={0}
      >
        <header className="radio-frequency-header">
          <div className="radio-frequency-brand">
            <span className="radio-frequency-brandName">OMNITUNE</span>
            <span className="radio-frequency-brandSub">Field Radio Array</span>
          </div>

          <div className="radio-frequency-status">
            <span className="radio-frequency-statusLabel">Manual Receiver</span>
            <span className="radio-frequency-statusPill">Signal Locked</span>
          </div>
        </header>

        <div className="radio-frequency-readout" aria-live="polite">
          <span className="radio-frequency-readoutValue">
            {displayFrequency}
          </span>
        </div>

        <section className="radio-frequency-tuner" aria-label="Radio tuner">
          <div className="radio-frequency-band">
            <div className="radio-frequency-sweep" aria-hidden="true">
              {sweepBars.map((height, index) => (
                <span
                  key={index}
                  style={
                    {
                      "--radio-sweep-height": `${height}%`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <div className="radio-frequency-ticks" aria-hidden="true">
              {bandMarks.map((frequency) => (
                <span key={frequency}>{frequency.toFixed(3)}</span>
              ))}
            </div>
          </div>

          <div className="radio-frequency-sliderRail">
            <span className="radio-frequency-sliderLabel">Min</span>
            <input
              aria-label="Radio frequency"
              className="radio-frequency-slider"
              max={RADIO_FREQUENCY_MAX}
              min={RADIO_FREQUENCY_MIN}
              onChange={(event) => updateFrequency(event.currentTarget.value)}
              onKeyDown={onFrequencyKeyDown}
              step={RADIO_FREQUENCY_STEP}
              type="range"
              value={draftFrequency}
            />
            <span className="radio-frequency-sliderLabel">Max</span>
          </div>

          <div className="radio-frequency-fineTune" aria-label="Fine tuning">
            {FINE_TUNE_CONTROLS.map((control) => (
              <button
                key={control.label}
                className="radio-frequency-fineButton"
                onClick={() => adjustFrequency(control.delta)}
                type="button"
                aria-label={`Tune ${control.delta < 0 ? "down" : "up"} ${Math.abs(
                  control.delta,
                ).toFixed(3)} MHz`}
              >
                {control.label}
              </button>
            ))}
          </div>
        </section>

        <footer className="radio-frequency-footer">
          <span>Step {RADIO_FREQUENCY_STEP.toFixed(3)} MHz</span>
          <span>{RADIO_FREQUENCY_MIN.toFixed(3)}</span>
          <span>{RADIO_FREQUENCY_MAX.toFixed(3)}</span>
        </footer>
      </div>
    </CrtModal>
  );
}

export default RadioFrequencyModal;
