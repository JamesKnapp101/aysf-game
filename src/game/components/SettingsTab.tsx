import {
  COMET_PERSONALITY_OPTIONS,
  type CometSettingsDescription,
} from "@game/constants/cometPersonalities";
import type { CometPersonalityMode } from "@game/types/gameTypes";
import type { Dispatch, SetStateAction } from "react";

type SettingsTabProps = {
  cometPersonality: CometPersonalityMode;
  crtColor: string;
  onCometPersonalityChange: (mode: CometPersonalityMode) => void;
  setCrtColor: Dispatch<SetStateAction<string>>;
};

const CRT_COLOR_OPTIONS = [
  { id: "green", label: "Green", value: "#00ff00" },
  { id: "amber", label: "Amber", value: "#ffbf00" },
  { id: "white", label: "White", value: "#f8f8f8" },
  { id: "blue", label: "Ice Blue", value: "#7fdfff" },
  { id: "yellow", label: "Yellow", value: "#ffff4a" },
  { id: "orange", label: "Orange", value: "#ff7b00" },
];

function renderSettingsDescription(description: CometSettingsDescription) {
  if (typeof description === "string") {
    return description;
  }

  return description.map((part, index) =>
    part.italic ? <em key={index}>{part.text}</em> : <span key={index}>{part.text}</span>,
  );
}

export function SettingsTab({
  cometPersonality,
  crtColor,
  onCometPersonalityChange,
  setCrtColor,
}: SettingsTabProps) {
  const selectedPersonality =
    COMET_PERSONALITY_OPTIONS.find((opt) => opt.value === cometPersonality) ??
    COMET_PERSONALITY_OPTIONS[0];

  return (
    <div className="settings-panel">
      <section className="settings-section">
        <p className="crt-color-header">CRT Color</p>
        <div className="settings-color-row">
          {CRT_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={
                "crt-swatch" + (crtColor === opt.value ? " crt-swatch-selected" : "")
              }
              style={{ backgroundColor: opt.value }}
              onClick={() => setCrtColor(opt.value)}
              aria-label={opt.label}
            />
          ))}
        </div>
      </section>

      <section className="settings-section">
        <p className="crt-color-header">Comet Personality</p>
        <div className="settings-select-stack">
          <div className="settings-select-wrap">
            <select
              className="settings-select"
              value={cometPersonality}
              onChange={(event) =>
                onCometPersonalityChange(
                  event.target.value as CometPersonalityMode,
                )
              }
              aria-label="Comet personality"
            >
              {COMET_PERSONALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="settings-select-chevron" aria-hidden="true">
              v
            </span>
          </div>
          <p className="settings-select-description">
            {renderSettingsDescription(selectedPersonality.description)}
          </p>
        </div>
      </section>
    </div>
  );
}
