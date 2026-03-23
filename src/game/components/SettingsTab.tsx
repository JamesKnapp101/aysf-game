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

const COMET_PERSONALITY_OPTIONS: Array<{
  description: string;
  label: string;
  value: CometPersonalityMode;
}> = [
  {
    description: "Balanced and dryly helpful.",
    label: "Default",
    value: "default",
  },
  {
    description: "Precise, clipped, and clinical.",
    label: "Robotic",
    value: "robotic",
  },
  {
    description: "Still useful, but wry and lightly sharp-edged.",
    label: "Snarky",
    value: "snarky",
  },
];

export function SettingsTab({
  cometPersonality,
  crtColor,
  onCometPersonalityChange,
  setCrtColor,
}: SettingsTabProps) {
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
        <div className="settings-choice-column">
          {COMET_PERSONALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={
                "settings-choice" +
                (cometPersonality === opt.value
                  ? " settings-choice-selected"
                  : "")
              }
              onClick={() => onCometPersonalityChange(opt.value)}
              aria-pressed={cometPersonality === opt.value}
            >
              <span className="settings-choiceLabel">{opt.label}</span>
              <span className="settings-choiceDescription">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
