import React from "react";
import {
  describeBodyTemperatureLevel,
  describeCurrentEffects,
  describeRadiationLevel,
  describeSicknessLevel,
  getStatusEffectById,
} from "../selectors/statusSelectors";
import type { GameState } from "../types/gameTypes";
import { useUIEffectsStore } from "../store/store";

interface StatusTabProps {
  gameState: GameState;
}

export const StatusTab: React.FC<StatusTabProps> = ({ gameState }) => {
  const mindFlash = useUIEffectsStore((s) => s.mindFlash);
  return (
    <div>
      <div className="crt-vitals-monitor-stack">
        <MeterRow
          label="Health"
          icon="♥"
          value={gameState.player.vitals.health}
          display={`${Math.round(gameState.player.vitals.health)}%`}
          min={0}
          max={100}
          goodWhenHigh={true}
        />
        <MeterRow
          label="O₂"
          icon="O₂"
          value={gameState.player.vitals.oxygen}
          display={`${Math.round(gameState.player.vitals.oxygen)}%`}
          min={0}
          max={100}
          goodWhenHigh={true}
        />
        <TempRow value={gameState.player.vitals.temperature} />
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
        {/* Brain activity */}
        {(() => {
          const brainLevel = (
            mindFlash ? 6 : gameState.player.vitals.brainActivity ?? 1
          ) as 1 | 2 | 3 | 4 | 5 | 6;

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

type BrainWaveLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface BrainWaveRowProps {
  level: BrainWaveLevel;
}

const BRAIN_WAVE_LABELS: Record<BrainWaveLevel, string> = {
  1: "Normal",
  2: "Excited",
  3: "Slowed",
  4: "Altered",
  5: "???",
  6: "Foreign",
};

type Pt = [number, number];

function makeSineBase(points: number, cycles: number, amplitude: number): Pt[] {
  const result: Pt[] = [];
  const width = 200;
  const stepX = width / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = i * stepX;
    const t = (i / (points - 1)) * cycles * Math.PI * 2;
    const y = 20 + Math.sin(t) * amplitude;
    result.push([x, Math.round(y)]);
  }
  return result;
}

function buildScrollingPattern(base: Pt[]): string {
  const extended: Pt[] = [];
  for (const [x, y] of base) extended.push([x, y]); // 0–200
  for (const [x, y] of base) extended.push([x + 200, y]); // 200–400
  return extended.map(([x, y]) => `${x},${y}`).join(" ");
}

function clampPts(base: Pt[], minY = 2, maxY = 38): Pt[] {
  return base.map(([x, y]) => [x, Math.max(minY, Math.min(maxY, y))] as Pt);
}

// Base waves (same as before)
const NORMAL_BASE: Pt[] = makeSineBase(33, 3, 9);
const EXCITED_BASE: Pt[] = makeSineBase(49, 6, 16);
const SLOWED_BASE: Pt[] = makeSineBase(17, 1, 9);
const STONED_BASE: Pt[] = makeSineBase(48, 3.5, 10);

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

// 6 overlay: "excited-ish" but distinct (busy + slightly jagged)
const FOREIGN_OVERLAY_BASE: Pt[] = (() => {
  // Busy wave closer to excited: higher cycles and decent amplitude
  const busy = makeSineBase(49, 6, 16);

  return clampPts(busy);
})();

// scrolling patterns 0–400
const BRAIN_WAVE_PATTERNS: Record<BrainWaveLevel, string> = {
  1: buildScrollingPattern(NORMAL_BASE),
  2: buildScrollingPattern(EXCITED_BASE),
  3: buildScrollingPattern(SLOWED_BASE),
  4: buildScrollingPattern(STONED_BASE),
  5: buildScrollingPattern(POSSESSED_BASE),
  // 6 base uses normal pattern; overlay separate below
  6: buildScrollingPattern(NORMAL_BASE),
};

const FOREIGN_OVERLAY_PATTERN = buildScrollingPattern(FOREIGN_OVERLAY_BASE);

export const BrainWaveRow: React.FC<BrainWaveRowProps> = ({ level }) => {
  const label = BRAIN_WAVE_LABELS[level] ?? "Unknown";
  const points = BRAIN_WAVE_PATTERNS[level];

  const colors: Record<BrainWaveLevel, string> = {
    1: "#00ff00",
    2: "#fd8556ff",
    3: "#16925aff",
    4: "#bd96ffff",
    5: "#88ff88",
    6: "#39ffdd",
  };

  return (
    <div
      className={`brain-row ${level === 1 ? "normal" : ""} ${
        level === 2 ? "excited" : ""
      } ${level === 3 ? "slowed" : ""} ${level === 4 ? "stoned" : ""} ${
        level === 5 ? "possessed" : ""
      } ${level === 6 ? "foreign normal" : ""}`}
      /* ^^^ note: level 6 ALSO includes "normal" so base anim matches Normal */
    >
      <span className="brain-label">
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
        {/* Default / single-wave for levels 1–5 */}
        {level !== 6 && (
          <polyline
            fill="none"
            stroke={colors[level]}
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
        )}

        {/* Level 6: two independently-animated polylines */}
        {level === 6 && (
          <>
            {/* Base = normal wave, normal scroll speed */}
            <polyline
              className="foreign-base"
              fill="none"
              stroke={colors[1]}
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
              opacity={0.75}
            />

            {/* Overlay = busy wave, scrolls twice as fast */}
            <polyline
              className="foreign-overlay"
              fill="none"
              stroke={colors[6]}
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={FOREIGN_OVERLAY_PATTERN}
              opacity={0.95}
            />
          </>
        )}
      </svg>

      <span className="brain-state">{label}</span>
    </div>
  );
};
