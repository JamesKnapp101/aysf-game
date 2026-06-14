import {
  COMET_PERSONALITY_OPTIONS,
  type CometSettingsDescription,
} from "@game/constants/cometPersonalities";
import { getConversationAssistantNameForMode } from "@game/helpers/conversationModeHelpers";
import type {
  CometPersonalityMode,
  CometTextSizeMode,
  ConversationMode,
  VisualEffectsMode,
} from "@game/types/gameTypes";
import type { Dispatch, SetStateAction } from "react";

type SettingsTabProps = {
  cometPersonality: CometPersonalityMode;
  cometTextSize: CometTextSizeMode;
  conversationMode: ConversationMode;
  crtColor: string;
  onCometPersonalityChange: (mode: CometPersonalityMode) => void;
  onCometTextSizeChange: (mode: CometTextSizeMode) => void;
  onConversationModeChange: (mode: ConversationMode) => void;
  onVisualEffectsModeChange: (mode: VisualEffectsMode) => void;
  setCrtColor: Dispatch<SetStateAction<string>>;
  visualEffectsMode: VisualEffectsMode;
};

const CRT_COLOR_OPTIONS = [
  { id: "green", label: "Green", value: "#00ff00" },
  { id: "amber", label: "Amber", value: "#ffbf00" },
  { id: "white", label: "White", value: "#f8f8f8" },
  { id: "blue", label: "Ice Blue", value: "#7fdfff" },
  { id: "yellow", label: "Yellow", value: "#ffff4a" },
  { id: "orange", label: "Orange", value: "#ff7b00" },
];

const COMET_TEXT_SIZE_OPTIONS: {
  description: string;
  label: string;
  value: CometTextSizeMode;
}[] = [
  {
    value: "smaller",
    label: "Smaller",
    description: "Current compact Comet text size.",
  },
  {
    value: "larger",
    label: "Larger",
    description: "Increases Comet chat text for easier reading.",
  },
];

const VISUAL_EFFECTS_OPTIONS: {
  description: string;
  label: string;
  value: VisualEffectsMode;
}[] = [
  {
    value: "full",
    label: "Full",
    description: "Keeps the current animated status and environmental effects.",
  },
  {
    value: "reduced",
    label: "Reduced",
    description:
      "Turns off the motion-heavy pieces and softens the stronger distortions.",
  },
  {
    value: "off",
    label: "Off",
    description:
      "Disables the decorative motion and most of the stronger effect overlays.",
  },
];

const COMET_PERSONALITY_SELECT_ID = "settings-comet-personality";
const COMET_TEXT_SIZE_SELECT_ID = "settings-comet-text-size";
const CONVERSATION_MODE_SWITCH_ID = "settings-conversation-mode";
const CONVERSATION_MODE_DESCRIPTION_ID = "settings-conversation-mode-description";
const VISUAL_EFFECTS_SELECT_ID = "settings-visual-effects";

function renderSettingsDescription(description: CometSettingsDescription) {
  if (typeof description === "string") {
    return description;
  }

  return description.map((part, index) =>
    part.italic ? (
      <em key={index}>{part.text}</em>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
}

export function SettingsTab({
  cometPersonality,
  cometTextSize,
  conversationMode,
  crtColor,
  onCometPersonalityChange,
  onCometTextSizeChange,
  onConversationModeChange,
  onVisualEffectsModeChange,
  setCrtColor,
  visualEffectsMode,
}: SettingsTabProps) {
  const isAiConversationMode = conversationMode === "ai";
  const assistantName = getConversationAssistantNameForMode(conversationMode);
  const selectedPersonality =
    COMET_PERSONALITY_OPTIONS.find((opt) => opt.value === cometPersonality) ??
    COMET_PERSONALITY_OPTIONS[0];
  const selectedTextSize =
    COMET_TEXT_SIZE_OPTIONS.find((opt) => opt.value === cometTextSize) ??
    COMET_TEXT_SIZE_OPTIONS[0];
  const selectedVisualEffects =
    VISUAL_EFFECTS_OPTIONS.find((opt) => opt.value === visualEffectsMode) ??
    VISUAL_EFFECTS_OPTIONS[0];

  return (
    <div className="settings-panel">
      <section className="settings-section">
        <p className="crt-color-header settings-section-header">
          Conversation Mode
        </p>

        <div className="settings-option">
          <div className="settings-toggle-row">
            <label
              className="settings-optionLabel"
              htmlFor={CONVERSATION_MODE_SWITCH_ID}
            >
              Response Source
            </label>

            <label className="settings-switch">
              <input
                id={CONVERSATION_MODE_SWITCH_ID}
                className="settings-switch-input"
                type="checkbox"
                role="switch"
                checked={isAiConversationMode}
                aria-describedby={CONVERSATION_MODE_DESCRIPTION_ID}
                aria-label="Conversation mode"
                onChange={(event) =>
                  onConversationModeChange(
                    event.target.checked ? "ai" : "authored",
                  )
                }
              />
              <span className="settings-switch-track" aria-hidden="true">
                <span className="settings-switch-thumb" />
              </span>
            </label>
          </div>

          <div className="settings-toggle-labels" aria-hidden="true">
            <span>Authored</span>
            <span>AI</span>
          </div>

          <p
            id={CONVERSATION_MODE_DESCRIPTION_ID}
            className="settings-select-description"
          >
            {isAiConversationMode
              ? "NPCs and Comet use generated responses when available."
              : "NPCs use authored dialog, and Sibyl answers from the library index."}
          </p>
        </div>
      </section>

      <section className="settings-section">
        <p className="crt-color-header settings-section-header">CRT Color</p>
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
              aria-pressed={crtColor === opt.value}
              title={opt.label}
            />
          ))}
        </div>
      </section>

      <section className="settings-section">
        <p className="crt-color-header settings-section-header">
          {assistantName} Settings
        </p>

        <div className="settings-option">
          <label
            className="settings-optionLabel"
            htmlFor={COMET_PERSONALITY_SELECT_ID}
          >
            Personality
          </label>
          <div className="settings-select-stack">
            <div className="settings-select-wrap">
              <select
                id={COMET_PERSONALITY_SELECT_ID}
                className="settings-select"
                value={cometPersonality}
                onChange={(event) =>
                  onCometPersonalityChange(
                    event.target.value as CometPersonalityMode,
                  )
                }
                aria-label={`${assistantName} personality`}
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
        </div>

        <div className="settings-option">
          <label
            className="settings-optionLabel"
            htmlFor={COMET_TEXT_SIZE_SELECT_ID}
          >
            {assistantName} Text Size
          </label>
          <div className="settings-select-stack">
            <div className="settings-select-wrap">
              <select
                id={COMET_TEXT_SIZE_SELECT_ID}
                className="settings-select"
                value={cometTextSize}
                onChange={(event) =>
                  onCometTextSizeChange(
                    event.target.value as CometTextSizeMode,
                  )
                }
                aria-label={`${assistantName} text size`}
              >
                {COMET_TEXT_SIZE_OPTIONS.map((opt) => (
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
              {selectedTextSize.description.replace("Comet", assistantName)}
            </p>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <p className="crt-color-header settings-section-header">
          Visual Effects
        </p>

        <div className="settings-option">
          <label
            className="settings-optionLabel"
            htmlFor={VISUAL_EFFECTS_SELECT_ID}
          >
            Status Effect Motion
          </label>
          <div className="settings-select-stack">
            <div className="settings-select-wrap">
              <select
                id={VISUAL_EFFECTS_SELECT_ID}
                className="settings-select"
                value={visualEffectsMode}
                onChange={(event) =>
                  onVisualEffectsModeChange(
                    event.target.value as VisualEffectsMode,
                  )
                }
                aria-label="Status effect motion"
              >
                {VISUAL_EFFECTS_OPTIONS.map((opt) => (
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
              {selectedVisualEffects.description}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
