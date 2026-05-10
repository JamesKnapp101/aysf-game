import React from "react";
import {
  describeBodyTemperatureLevel,
  describeSicknessLevel,
  getStatusEffectById,
  getStatusEffectDiagnostics,
  type StatusEffectIconId,
} from "../selectors/statusSelectors";
import { useUIEffectsStore } from "../store/store";
import type { GameState } from "../types/gameTypes";

interface StatusTabProps {
  gameState: GameState;
}

export const StatusTab: React.FC<StatusTabProps> = ({ gameState }) => {
  const mindFlash = useUIEffectsStore((s) => s.mindFlash);
  const statusEffectDiagnostics = getStatusEffectDiagnostics(gameState);

  return (
    <div className="status-tab">
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
        {(() => {
          const brainLevel = (
            mindFlash ? 6 : (gameState.player.vitals.brainActivity ?? 1)
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
          <div className="status-effect-viewer" role="list">
            {statusEffectDiagnostics.length === 0 ? (
              <div className="status-effect-empty">None.</div>
            ) : (
              statusEffectDiagnostics.map((effect) => (
                <div
                  className="status-effect-row"
                  key={effect.id}
                  role="listitem"
                >
                  <div className="status-effect-badge" aria-hidden="true">
                    <StatusEffectBadgeIcon icon={effect.icon} />
                  </div>
                  <div className="status-effect-name">{effect.name}</div>
                  <div className="status-effect-message">{effect.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type IconSvgProps = {
  children: React.ReactNode;
  viewBox?: string;
};

const IconSvg: React.FC<IconSvgProps> = ({
  children,
  viewBox = "0 0 24 24",
}) => (
  <svg
    className="status-effect-icon"
    viewBox={viewBox}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const StatusEffectBadgeIcon: React.FC<{ icon: StatusEffectIconId }> = ({
  icon,
}) => {
  switch (icon) {
    case "biohazard":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="6.8" r="3.6" />
          <circle cx="7.5" cy="15" r="3.6" />
          <circle cx="16.5" cy="15" r="3.6" />
          <circle cx="12" cy="12" r="7.6" fill="none" />
        </IconSvg>
      );
    case "bolt":
      return (
        <IconSvg>
          <path
            className="status-effect-icon-fill"
            d="M14.7 2.4 5.1 13.4h5.1L7.8 21.8l11.1-12.9h-5.4l1.2-6.5Z"
          />
        </IconSvg>
      );
    case "bottle":
      return (
        <IconSvg>
          <path d="M10 3h4v4l3 4v8.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V11l3-4V3Z" />
          <path d="M9.5 3h5" />
          <path d="M8.5 14.5h7" />
        </IconSvg>
      );
    case "brain":
      return (
        <IconSvg>
          <path
            d="M9.2 18.8a4 4 0 0 1-3.9-4 3.7 3.7 0 0 1 1-2.5A3.4 3.4 0 0 1 7.2 7a3.7 3.7 0 0 1 3.3-2 3.3 3.3 0 0 1 2.1.7A3.3 3.3 0 0 1 14.8 5a3.7 3.7 0 0 1 3.4 2.2 3.5 3.5 0 0 1 .9 5.1 3.7 3.7 0 0 1 1 2.5 4 4 0 0 1-4 4H9.2Z"
            fill="none"
          />
          <path d="M12 6v12.7" />
          <path d="M8.3 10.2c1.1-.5 2.3-.4 3.2.4" />
          <path d="M15.7 10.2c-1.1-.5-2.3-.4-3.2.4" />
          <path d="M7.5 14.2c1.2-.4 2.4-.1 3.2.8" />
          <path d="M16.5 14.2c-1.2-.4-2.4-.1-3.2.8" />
        </IconSvg>
      );
    case "comb":
      return (
        <IconSvg>
          <path d="M5 6h14v4H5z" />
          <path d="M6 10v9" />
          <path d="M9 10v9" />
          <path d="M12 10v9" />
          <path d="M15 10v9" />
          <path d="M18 10v9" />
        </IconSvg>
      );
    case "cross":
      return (
        <IconSvg>
          <path
            className="status-effect-icon-fill"
            d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"
          />
        </IconSvg>
      );
    case "death-face":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="8.5" fill="none" />
          <path d="m7.8 8.2 2.8 2.8" />
          <path d="m10.6 8.2-2.8 2.8" />
          <path d="m13.4 8.2 2.8 2.8" />
          <path d="m16.2 8.2-2.8 2.8" />
          <path d="M8.5 17c2-2 5-2 7 0" fill="none" />
        </IconSvg>
      );
    case "dna":
      return (
        <IconSvg>
          <path d="M7 3c6 4 10 6 10 18" fill="none" />
          <path d="M17 3C11 7 7 9 7 21" fill="none" />
          <path d="M9 6h6" />
          <path d="M8 10h8" />
          <path d="M8 14h8" />
          <path d="M9 18h6" />
        </IconSvg>
      );
    case "droplet":
      return (
        <IconSvg>
          <path
            className="status-effect-icon-fill"
            d="M12 3C8.5 8 6.5 11.2 6.5 15a5.5 5.5 0 0 0 11 0C17.5 11.2 15.5 8 12 3Z"
          />
        </IconSvg>
      );
    case "eye":
      return (
        <IconSvg>
          <path
            d="M2.8 12s3.4-6 9.2-6 9.2 6 9.2 6-3.4 6-9.2 6-9.2-6-9.2-6Z"
            fill="none"
          />
          <circle className="status-effect-icon-fill" cx="12" cy="12" r="2.8" />
        </IconSvg>
      );
    case "heart":
      return (
        <IconSvg>
          <path
            className="status-effect-icon-fill"
            d="M12 20s-8-4.8-8-10.4C4 6.6 6 5 8.4 5c1.4 0 2.7.8 3.6 2 1-1.2 2.2-2 3.6-2C18 5 20 6.6 20 9.6 20 15.2 12 20 12 20Z"
          />
        </IconSvg>
      );
    case "no-eyes-smile":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="8.5" fill="none" />
          <path d="M8.2 13.8c1.8 2 5.8 2 7.6 0" fill="none" />
        </IconSvg>
      );
    case "question-marks":
      return (
        <IconSvg>
          <text x="12" y="15.5" textAnchor="middle">
            ???
          </text>
        </IconSvg>
      );
    case "radiation":
      return (
        <IconSvg>
          <circle className="status-effect-icon-fill" cx="12" cy="12" r="2.2" />
          <path
            className="status-effect-icon-fill"
            d="M12 3a9 9 0 0 1 4.2 1l-3 5.2A3.8 3.8 0 0 0 12 9V3Z"
          />
          <path
            className="status-effect-icon-fill"
            d="M20 16.5a9 9 0 0 1-3.7 3.1l-3-5.2a3.8 3.8 0 0 0 1-1L20 16.5Z"
          />
          <path
            className="status-effect-icon-fill"
            d="M4 16.5a9 9 0 0 0 3.7 3.1l3-5.2a3.8 3.8 0 0 1-1-1L4 16.5Z"
          />
          <circle cx="12" cy="12" r="8.5" fill="none" />
        </IconSvg>
      );
    case "space-bug":
      return (
        <IconSvg>
          <path
            className="status-effect-icon-fill"
            d="M7 8h2V6h2v2h2V6h2v2h2v7h-2v2h-2v-2h-2v2H9v-2H7V8Z"
          />
          <path d="M5 10h2" />
          <path d="M17 10h2" />
          <path d="M4 17h3" />
          <path d="M17 17h3" />
        </IconSvg>
      );
    case "spiral":
      return (
        <IconSvg>
          <path
            d="M18.5 12a6.5 6.5 0 1 0-3.8 5.9 4.6 4.6 0 1 0 .5-8.5 2.8 2.8 0 1 0-2.7 4.7"
            fill="none"
          />
        </IconSvg>
      );
    case "syndrome x":
      return (
        <IconSvg>
          <circle cx="12" cy="12" r="5.2" fill="none" />
          <path d="M12 2.8v3.6" />
          <path d="M12 17.6v3.6" />
          <path d="M2.8 12h3.6" />
          <path d="M17.6 12h3.6" />
          <path d="m5.5 5.5 2.5 2.5" />
          <path d="m16 16 2.5 2.5" />
          <path d="m18.5 5.5-2.5 2.5" />
          <path d="m8 16-2.5 2.5" />
          <circle className="status-effect-icon-fill" cx="10" cy="10" r="0.8" />
          <circle
            className="status-effect-icon-fill"
            cx="14.5"
            cy="12.5"
            r="0.8"
          />
        </IconSvg>
      );
    case "zzz":
      return (
        <IconSvg>
          <text
            x="7"
            y="19"
            className="status-effect-icon-z status-effect-icon-z--large"
          >
            Z
          </text>
          <text
            x="12.5"
            y="13.5"
            className="status-effect-icon-z status-effect-icon-z--mid"
          >
            Z
          </text>
          <text
            x="17"
            y="8.5"
            className="status-effect-icon-z status-effect-icon-z--small"
          >
            Z
          </text>
        </IconSvg>
      );
  }
};

const NUM_BLOCKS = 10;

function hexToRgb(color: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!match) return null;

  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}

function getMeterBlockStyle(color: string): React.CSSProperties {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return {
      backgroundColor: color,
      boxShadow: `0 0 3px ${color}`,
    };
  }

  return {
    backgroundColor: `rgba(${rgb}, 0.78)`,
    boxShadow: `0 0 3px rgba(${rgb}, 0.28), inset 0 0 4px rgba(${rgb}, 0.14)`,
  };
}

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
  const pct = (clamped - min) / (max - min);
  const filled = Math.round(pct * NUM_BLOCKS);
  const severity = goodWhenHigh ? pct : 1 - pct;

  let color = "#00ff00";
  if (severity < 0.2) color = "#ff0000";
  else if (severity < 0.4) color = "#ff6600";
  else if (severity < 0.6) color = "#ffff00";

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
              style={active ? getMeterBlockStyle(color) : undefined}
            />
          );
        })}
      </div>
      <span className="meter-value">{display}</span>
    </div>
  );
};

const TEMP_MIN = 89;
const TEMP_MAX = 110;

interface TempRowProps {
  value: number;
}

const TempRow: React.FC<TempRowProps> = ({ value }) => {
  const clamped = Math.max(TEMP_MIN, Math.min(TEMP_MAX, value));
  const pct = (clamped - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);

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
              style={active ? getMeterBlockStyle(color) : undefined}
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

type BrainWaveTrackStyle = React.CSSProperties & {
  "--brain-wave-image": string;
  "--brain-wave-duration": string;
  "--brain-wave-opacity"?: string;
  "--brain-wave-tile-width": string;
};

type BrainWaveLayer = {
  image: string;
  duration: string;
  opacity?: number;
  overlay?: boolean;
};

function buildBrainWaveImage(
  points: string,
  stroke: string,
  glow: string,
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" preserveAspectRatio="none">
      <polyline
        points="${points}"
        fill="none"
        stroke="${glow}"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.2"
      />
      <polyline
        points="${points}"
        fill="none"
        stroke="${stroke}"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function makeBrainWaveStyle(layer: BrainWaveLayer): BrainWaveTrackStyle {
  return {
    "--brain-wave-image": layer.image,
    "--brain-wave-duration": layer.duration,
    "--brain-wave-tile-width": "112px",
    ...(layer.opacity != null
      ? { "--brain-wave-opacity": String(layer.opacity) }
      : {}),
  };
}

const BRAIN_WAVE_LAYERS: Record<BrainWaveLevel, readonly BrainWaveLayer[]> = {
  1: [
    {
      image: buildBrainWaveImage(
        "0,20 4,20 8,19 12,21 16,19 20,20 24,18 28,22 32,19 36,20 40,18 44,21 48,19 52,20 56,19 60,20 64,17 68,22 72,18 76,20 80,19 84,18 88,24 92,11 96,26 100,18 104,21 108,19 112,20 116,18 120,21 124,19 128,20 132,19 136,20 140,18 144,21 148,19 152,20 156,19 160,20",
        "#7dff6a",
        "#7dff6a",
      ),
      duration: "11s",
    },
  ],
  2: [
    {
      image: buildBrainWaveImage(
        "0,20 4,19 8,21 12,18 16,22 20,17 24,24 28,16 32,23 36,18 40,20 44,17 48,25 52,14 56,27 60,16 64,23 68,18 72,21 76,17 80,24 84,13 88,28 92,15 96,24 100,18 104,21 108,17 112,23 116,18 120,20 124,15 128,26 132,16 136,22 140,19 144,21 148,18 152,20 156,19 160,20",
        "#ff9f6a",
        "#ff9f6a",
      ),
      duration: "3.4s",
    },
  ],
  3: [
    {
      image: buildBrainWaveImage(
        "0,20 12,20 24,19 36,20 48,20 60,18 72,22 84,20 96,20 108,19 120,20 132,20 144,18 152,23 160,20",
        "#56e093",
        "#56e093",
      ),
      duration: "18s",
    },
  ],
  4: [
    {
      image: buildBrainWaveImage(
        "0,20 6,20 12,16 18,24 24,17 30,21 36,19 42,15 48,26 54,18 60,20 66,14 72,28 78,16 84,20 90,18 96,23 102,17 108,20 114,14 120,25 126,18 132,22 138,19 144,16 150,23 156,18 160,20",
        "#cba7ff",
        "#cba7ff",
      ),
      duration: "7s",
    },
  ],
  5: [
    {
      image: buildBrainWaveImage(
        "0,20 10,20 20,20 30,19 40,20 50,20 60,9 62,31 68,20 78,20 88,19 98,20 108,20 118,11 120,30 126,20 136,20 146,19 154,20 160,20",
        "#9fff9f",
        "#9fff9f",
      ),
      duration: "6s",
      opacity: 0.82,
    },
  ],
  6: [
    {
      image: buildBrainWaveImage(
        "0,20 8,20 12,18 16,22 20,19 24,21 28,20 34,20 40,19 44,21 48,20 52,18 56,22 60,19 64,21 68,20 74,20 80,18 84,24 88,12 92,27 96,19 100,20 106,20 112,19 116,21 120,20 126,20 132,18 136,22 140,20 146,20 152,19 156,21 160,20",
        "#7dff6a",
        "#7dff6a",
      ),
      duration: "10s",
      opacity: 0.72,
    },
    {
      image: buildBrainWaveImage(
        "0,20 4,18 8,22 12,17 16,23 20,19 24,21 28,16 32,24 36,18 40,20 44,15 48,25 52,17 56,23 60,16 64,24 68,18 72,21 76,17 80,22 84,14 88,26 92,16 96,23 100,18 104,20 108,16 112,24 116,17 120,21 124,15 128,25 132,18 136,22 140,17 144,23 148,18 152,20 156,19 160,20",
        "#39ffdd",
        "#39ffdd",
      ),
      duration: "4.5s",
      opacity: 0.94,
      overlay: true,
    },
  ],
};

export const BrainWaveRow: React.FC<BrainWaveRowProps> = ({ level }) => {
  const label = BRAIN_WAVE_LABELS[level] ?? "Unknown";
  const layers = BRAIN_WAVE_LAYERS[level];

  return (
    <div
      className={`brain-row ${level === 5 ? "brain-row--possessed" : ""} ${
        level === 6 ? "brain-row--foreign" : ""
      }`}
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

      <div className="brain-wave" aria-hidden="true">
        {layers.map((layer, index) => (
          <div
            key={index}
            className={`brain-wave-track ${
              layer.overlay ? "brain-wave-track--overlay" : ""
            }`}
            style={makeBrainWaveStyle(layer)}
          />
        ))}
      </div>

      <span className="brain-state">{label}</span>
    </div>
  );
};
