import React from "react";
import type { GameState } from "../world/types";
import {
  describeBodyTemperatureLevel,
  describeCurrentEffects,
  describeRadiationLevel,
  describeSicknessLevel,
  getStatusEffectById,
} from "./selectors";

interface StatusTabProps {
  gameState: GameState;
}
export const StatusTab: React.FC<StatusTabProps> = ({ gameState }) => {
  return (
    <div>
      <div className="crt-vitals-monitor-stack">
        {/* Health 0–100, more is better */}
        <MeterRow
          label="Health"
          icon="♥"
          value={gameState.player.vitals.health}
          display={`${Math.round(gameState.player.vitals.health)}%`}
          min={0}
          max={100}
          goodWhenHigh={true}
        />
        {/* Oxygen 0–100, more is better */}
        <MeterRow
          label="O₂"
          icon="O₂"
          value={gameState.player.vitals.oxygen}
          display={`${Math.round(gameState.player.vitals.oxygen)}%`}
          min={0}
          max={100}
          goodWhenHigh={true}
        />

        {/* Temperature: centered at 98.6° */}
        <TempRow value={gameState.player.vitals.temperature} />

        {/* Radiation 0–100 mSv, LESS is better */}
        <MeterRow
          label="Rads"
          icon="☢"
          value={
            getStatusEffectById(gameState, "radiation")?.[0]?.intensity ?? 0
          }
          display={`${(
            getStatusEffectById(gameState, "radiation")?.[0]?.intensity ?? 0
          ).toFixed(0)}\u00a0mSv`}
          min={0}
          max={100}
          goodWhenHigh={false}
        />
        {/* Brain 0–100/200, more = more activity */}
        {(() => {
          // however you want to store it; example:
          const brainLevel = (gameState.player.vitals.brainActivity ?? 1) as
            | 1
            | 2
            | 3
            | 4
            | 5;
          return <BrainWaveRow level={brainLevel} />;
        })()}
      </div>

      <div className="diagnosis-section">
        <div className="diagnosis-header">DIAGNOSIS</div>

        <div className="diagnosis-category">
          <div className="diagnosis-title">General:</div>
          <div className="diagnosis-text">
            {describeSicknessLevel(gameState)}
          </div>
        </div>

        <div className="diagnosis-category">
          <div className="diagnosis-title">Temperature:</div>
          <div className="diagnosis-text">
            {describeBodyTemperatureLevel(gameState)}
          </div>
        </div>

        <div className="diagnosis-category">
          <div className="diagnosis-title">Effects:</div>
          <div className="diagnosis-text">
            {describeCurrentEffects(gameState)}
          </div>
        </div>

        <div className="diagnosis-category">
          <div className="diagnosis-title">Radiation:</div>
          <div className="diagnosis-text">
            {describeRadiationLevel(gameState)}
          </div>
        </div>
      </div>
    </div>
  );
};

const NUM_BLOCKS = 10;

interface MeterRowProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  display: string;
  min: number;
  max: number;
  goodWhenHigh?: boolean;
}

const MeterRow: React.FC<MeterRowProps> = ({
  label,
  icon,
  value,
  display,
  min,
  max,
  goodWhenHigh = true,
}) => {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min); // 0..1
  const filled = Math.round(pct * NUM_BLOCKS);
  const severity = goodWhenHigh ? pct : 1 - pct;

  let color = "#00ff00"; // green
  if (severity < 0.2) color = "#ff0000"; // red
  else if (severity < 0.4) color = "#ff6600"; // orange
  else if (severity < 0.6) color = "#ffff00"; // yellow

  return (
    <div className="meter-row">
      <span className="meter-label">
        <span className="meter-icon">{icon}</span> {label}
      </span>
      <div className="meter-bar">
        {Array.from({ length: NUM_BLOCKS }).map((_, i) => {
          const active = i < filled;
          return (
            <div
              key={i}
              className={"meter-block" + (active ? " meter-block-active" : "")}
              style={
                active
                  ? {
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <span className="meter-value">{display}</span>
    </div>
  );
};

const TEMP_MIN = 89; // lethal-low-ish
const TEMP_MAX = 110; // lethal-high-ish

interface TempRowProps {
  value: number;
}

const TempRow: React.FC<TempRowProps> = ({ value }) => {
  const clamped = Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
  const pct = (clamped - TEMP_MIN) / (TEMP_MAX - TEMP_MIN); // 0..1

  // How many blocks to light (always at least 1 for a valid temp)
  let filled = Math.round(pct * NUM_BLOCKS);
  if (filled === 0 && !Number.isNaN(pct)) {
    filled = 1;
  }

  let color = "#00ff00";
  if (clamped < 92) color = "#0044ff";
  else if (clamped < 95) color = "#0088ff";
  else if (clamped < 97.5) color = "#00ccff";
  else if (clamped <= 99.5) color = "#00ff00";
  else if (clamped <= 103.5) color = "#ffff00";
  else if (clamped <= 106) color = "#ff6600";
  else color = "#ff0000";

  return (
    <div className="meter-row">
      <span className="meter-label">
        <span className="meter-icon">℉</span> Temp
      </span>

      <div className="meter-bar">
        {Array.from({ length: NUM_BLOCKS }).map((_, i) => {
          const active = i < filled;
          return (
            <div
              key={i}
              className={"meter-block" + (active ? " meter-block-active" : "")}
              style={
                active
                  ? {
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <span className="meter-value">{clamped.toFixed(1)}°</span>
    </div>
  );
};

type BrainWaveLevel = 1 | 2 | 3 | 4 | 5; // 1 normal … 5 possessed

interface BrainWaveRowProps {
  level: BrainWaveLevel;
}

const BRAIN_WAVE_LABELS: Record<BrainWaveLevel, string> = {
  1: "Normal",
  2: "Excited",
  3: "Slowed",
  4: "Altered",
  5: "???",
};

type Pt = [number, number];

function makeSineBase(points: number, cycles: number, amplitude: number): Pt[] {
  const result: Pt[] = [];
  const width = 200;
  const stepX = width / (points - 1); // span 0..200 inclusive

  for (let i = 0; i < points; i++) {
    const x = i * stepX;
    const t = (i / (points - 1)) * cycles * Math.PI * 2; // 0..2π*cycles
    const y = 20 + Math.sin(t) * amplitude;
    result.push([x, Math.round(y)]);
  }
  return result;
}

function buildScrollingPattern(base: Pt[]): string {
  const extended: Pt[] = [];

  // first cycle 0–200
  for (const [x, y] of base) extended.push([x, y]);
  // second cycle 200–400
  for (const [x, y] of base) extended.push([x + 200, y]);

  return extended.map(([x, y]) => `${x},${y}`).join(" ");
}

const NORMAL_BASE: Pt[] = makeSineBase(33, 3, 9); // 2 cycles, medium amp
const EXCITED_BASE: Pt[] = makeSineBase(49, 6, 16); // 5 cycles, bigger amp
const SLOWED_BASE: Pt[] = makeSineBase(17, 1, 9); // 1 big cycle
const STONED_BASE: Pt[] = makeSineBase(48, 3.5, 10); // 1.5 cycles, deep highs/lows

// 5: Possessed – almost flat, small ticks
const POSSESSED_BASE: Pt[] = (() => {
  const pts: Pt[] = [];
  const width = 200;
  const points = 21;
  const stepX = width / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = i * stepX;
    const y = 20 + (i % 7 === 0 ? 1 : 0);
    pts.push([x, Math.round(y)]);
  }

  return pts;
})();

// Scrolling-ready 0–400 patterns
const BRAIN_WAVE_PATTERNS: Record<BrainWaveLevel, string> = {
  1: buildScrollingPattern(NORMAL_BASE),
  2: buildScrollingPattern(EXCITED_BASE),
  3: buildScrollingPattern(SLOWED_BASE),
  4: buildScrollingPattern(STONED_BASE),
  5: buildScrollingPattern(POSSESSED_BASE),
};

export const BrainWaveRow: React.FC<BrainWaveRowProps> = ({ level }) => {
  const label = BRAIN_WAVE_LABELS[level] ?? "Unknown";
  const points = BRAIN_WAVE_PATTERNS[level];

  const colors: Record<BrainWaveLevel, string> = {
    1: "#00ff00",
    2: "#fd8556ff",
    3: "#16925aff",
    4: "#bd96ffff",
    5: "#88ff88",
  };

  return (
    <div
      className={`brain-row ${level === 1 ? "normal" : ""} ${
        level === 2 ? "excited" : ""
      } ${level === 3 ? "slowed" : ""} ${level === 4 ? "stoned" : ""} ${
        level === 5 ? "possessed" : ""
      }`}
    >
      <span className="brain-label">
        {/* CRT EEG icon */}
        <svg className="brain-icon" viewBox="0 0 32 20" aria-hidden="true">
          <polyline
            points="
                0,12
                6,12
                8,4
                10,20
                12,3
                14,21
                16,12
                22,12
                28,12
                34,12
                40,12
              "
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="32" cy="10" r="1" fill="currentColor" />
        </svg>
        EEG
      </span>

      <svg
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="brain-wave"
      >
        <polyline
          fill="none"
          stroke={colors[level]}
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>

      <span className="brain-state">{label}</span>
    </div>
  );
};
