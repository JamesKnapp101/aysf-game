import {
  type FlashlightStatus,
  getChargeBarCount,
} from "@game/helpers/flashlightHelpers";
import {
  MAX_EXTERNAL_ROOM_TEMPERATURE_F,
  MIN_EXTERNAL_ROOM_TEMPERATURE_F,
  clampExternalRoomTemperatureF,
} from "@game/selectors/roomTemperatureSelectors";
import React, { useEffect, useMemo, useState } from "react";
import type { Direction } from "../types/roomTypes";
import { RoomCompass } from "./Compass";

type RoomStatusPanelProps = {
  exits: Direction[];
  audioLevel: number;
  externalTemperatureF: number;
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

function temperatureToUnit(raw: number) {
  const temperature = clampExternalRoomTemperatureF(raw);
  return (
    (temperature - MIN_EXTERNAL_ROOM_TEMPERATURE_F) /
    (MAX_EXTERNAL_ROOM_TEMPERATURE_F - MIN_EXTERNAL_ROOM_TEMPERATURE_F)
  );
}

function getTemperatureZone(temperature: number) {
  if (temperature <= 32) return "freezing";
  if (temperature < 65) return "cool";
  if (temperature < 90) return "temperate";
  if (temperature < 103) return "hot";
  return "critical";
}

function getTemperatureAriaLabel(temperature: number) {
  return `External temperature reading: ${Math.round(
    clampExternalRoomTemperatureF(temperature),
  )} degrees Fahrenheit`;
}

function getFlashlightKindLabel(status: FlashlightStatus) {
  if (status.itemId === "flashlight") return "LED";
  if (status.itemId === "damagedFlashlight") return "\u03df ERR";
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
  externalTemperatureF,
  flashlightStatus,
}) => {
  const temperature = clampExternalRoomTemperatureF(externalTemperatureF);
  const temperatureUnit = useMemo(
    () => temperatureToUnit(temperature),
    [temperature],
  );
  const temperatureZone = getTemperatureZone(temperature);
  const temperaturePointerX = 34 + temperatureUnit * 174;
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
        <div className="room-diag-block" data-kind="temperature">
          <div className="room-diag-heading">
            <div className="room-diag-title">TEMP</div>
            <div className="room-diag-miniLabel">
              {Math.round(temperature)}°F
            </div>
          </div>

          <div
            className="room-temp-reading"
            aria-label={getTemperatureAriaLabel(temperature)}
            data-zone={temperatureZone}
            role="img"
          >
            <svg
              className="room-temp-meter"
              viewBox="0 0 220 58"
              aria-hidden="true"
            >
              <text className="room-temp-unit-label" x="2" y="33">
                °F
              </text>
              <rect
                className="room-temp-track"
                x="34"
                y="25"
                width="174"
                height="12"
                rx="3"
              />
              <rect
                className="room-temp-cold-zone"
                x="34"
                y="25"
                width="95"
                height="12"
                rx="3"
              />
              <rect
                className="room-temp-hot-zone"
                x="184"
                y="25"
                width="24"
                height="12"
                rx="3"
              />
              {[34, 129, 208].map((tickX) => (
                <line
                  key={tickX}
                  className="room-temp-tick"
                  x1={tickX}
                  x2={tickX}
                  y1="19"
                  y2="43"
                />
              ))}
              <text className="room-temp-scale" x="34" y="55">
                -60
              </text>
              <text className="room-temp-scale" x="129" y="55">
                32
              </text>
              <text className="room-temp-scale" x="208" y="55">
                108
              </text>
              <path
                className="room-temp-pointer"
                d={`M ${temperaturePointerX} 4 L ${
                  temperaturePointerX - 8
                } 22 H ${temperaturePointerX + 8} Z`}
              />
              <line
                className="room-temp-pointer-line"
                x1={temperaturePointerX}
                x2={temperaturePointerX}
                y1="20"
                y2="38"
              />
              <circle
                className="room-temp-pointer-screw"
                cx={temperaturePointerX}
                cy="20"
                r="3"
              />
            </svg>
          </div>
        </div>

        <div className="room-diag-divider" aria-hidden="true" />

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
