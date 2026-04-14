import {
  type FlashlightStatus,
  getChargeBarCount,
} from "@game/helpers/flashlightHelpers";
import React, { useEffect, useMemo, useState } from "react";
import type { Direction } from "../types/roomTypes";
import { RoomCompass } from "./Compass";

type RoomStatusPanelProps = {
  exits: Direction[];
  audioLevel: number;
  flashlightStatus: FlashlightStatus;
};

const AUDIO_BARS = 12;
const FLASHLIGHT_BARS = 10;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function audioToUnit(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return clamp(raw / 10, 0, 1);
}

function getFlashlightKindLabel(status: FlashlightStatus) {
  if (status.itemId === "flashlight") return "LED";
  if (status.itemId === "damagedFlashlight") return "\u03df BAD CHARGE";
  return "NONE";
}

function getFlashlightAriaLabel(status: FlashlightStatus) {
  if (!status.hasFlashlight || !status.settings) {
    return "Flashlight indicator: no flashlight";
  }

  const label =
    status.itemId === "flashlight" ? "LED flashlight" : "damaged flashlight";
  const state = status.isActive ? "on" : "off";

  return `Flashlight indicator: ${label}, ${state}, ${status.settings.currentCharge}% charge`;
}

export const RoomStatusPanel: React.FC<RoomStatusPanelProps> = ({
  exits,
  audioLevel,
  flashlightStatus,
}) => {
  const baseAudioUnit = useMemo(() => audioToUnit(audioLevel), [audioLevel]);
  const baseBars = useMemo(() => {
    return clamp(Math.round(baseAudioUnit * AUDIO_BARS), 0, AUDIO_BARS);
  }, [baseAudioUnit]);

  const [audioBarDelta, setAudioBarDelta] = useState(0);
  const litBars = useMemo(() => {
    if (baseBars <= 0) return 0;
    return clamp(baseBars + audioBarDelta, 0, AUDIO_BARS);
  }, [audioBarDelta, baseBars]);

  const flashlightBars = useMemo(() => {
    if (!flashlightStatus.settings) return 0;
    return getChargeBarCount(
      flashlightStatus.settings.currentCharge,
      FLASHLIGHT_BARS,
    );
  }, [flashlightStatus.settings]);

  useEffect(() => {
    if (baseBars <= 0) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let resetId: number | undefined;

    const scheduleNext = () => {
      const delay = 250 + Math.random() * 650;

      timeoutId = window.setTimeout(() => {
        if (cancelled) return;

        if (Math.random() < 0.3) {
          const delta = Math.random() < 0.65 ? 1 : -1;
          setAudioBarDelta(delta);

          resetId = window.setTimeout(() => {
            if (cancelled) return;
            setAudioBarDelta(0);
            scheduleNext();
          }, 160);
        } else {
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (resetId) window.clearTimeout(resetId);
      setAudioBarDelta(0);
    };
  }, [baseBars]);

  return (
    <div className="room-compass-float">
      <RoomCompass exits={exits} />

      <div className="room-diagnostics" aria-label="Room diagnostics">
        <div className="room-diag-block" data-kind="flashlight">
          <div className="room-diag-heading">
            <div className="room-diag-title">FLASHLIGHT</div>
            <div className="room-diag-miniLabel">
              {getFlashlightKindLabel(flashlightStatus)}
            </div>
          </div>

          <div
            className="room-flashlight-meter"
            aria-label={getFlashlightAriaLabel(flashlightStatus)}
            role="img"
            data-active={flashlightStatus.isActive ? "true" : "false"}
            data-has-flashlight={
              flashlightStatus.hasFlashlight ? "true" : "false"
            }
          >
            <svg
              className="room-flashlight-icon"
              viewBox="0 0 220 76"
              aria-hidden="true"
            >
              <path
                className="room-flashlight-outline"
                d="M16 18 H156 L176 2 H216 V74 H176 L156 58 H16 C9.37 58 4 52.63 4 46 V30 C4 23.37 9.37 18 16 18 Z"
              />
              <g className="room-flashlight-bars">
                {Array.from({ length: FLASHLIGHT_BARS }).map((_, i) => (
                  <rect
                    key={i}
                    className="room-flashlight-bar"
                    data-filled={i < flashlightBars ? "true" : "false"}
                    x={10 + i * 14}
                    y={23}
                    width={10}
                    height={30}
                    rx={5}
                    ry={5}
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>

        <div className="room-diag-divider" aria-hidden="true" />

        <div className="room-diag-block" data-kind="audio">
          <div className="room-diag-title">AUDIO</div>
          <div className="room-diag-meter" aria-hidden="true">
            {Array.from({ length: AUDIO_BARS }).map((_, i) => {
              const on = baseBars > 0 && i < litBars;
              return (
                <div
                  key={i}
                  className="room-audio-bar"
                  data-on={on ? "true" : "false"}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
