import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { CrtModal } from "./CrtModal";
import "../../styles/cooler-modal.css";
import type { CoolerMode } from "../types/itemTypes";

type CoolerModalProps = {
  mode: CoolerMode;
  onSetMode: (mode: CoolerMode) => void;
  onClose: () => void;
};

const MODES: CoolerMode[] = ["off", "cool", "cold", "freeze"];

function clampIndex(i: number) {
  return Math.max(0, Math.min(MODES.length - 1, i));
}

function modeLabel(mode: CoolerMode) {
  switch (mode) {
    case "off":
      return "OFF";
    case "cool":
      return "COOL";
    case "cold":
      return "COLD";
    case "freeze":
      return "FREEZE";
  }
}

function modeTemp(mode: CoolerMode) {
  switch (mode) {
    case "off":
      return 70;
    case "cool":
      return 55;
    case "cold":
      return 40;
    case "freeze":
      return 0;
  }
}

export function CoolerModal({ mode, onSetMode, onClose }: CoolerModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const temp = modeTemp(mode);

  const panelClass = useMemo(() => {
    switch (mode) {
      case "off":
        return "cooler-panel is-off";
      case "cool":
        return "cooler-panel is-cool";
      case "cold":
        return "cooler-panel is-cold";
      case "freeze":
        return "cooler-panel is-freeze";
    }
  }, [mode]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = MODES.indexOf(mode);

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          e.preventDefault();
          onSetMode(MODES[clampIndex(idx - 1)]);
          break;
        }
        case "ArrowRight":
        case "ArrowDown": {
          e.preventDefault();
          onSetMode(MODES[clampIndex(idx + 1)]);
          break;
        }
        case "Enter":
        case "Escape": {
          e.preventDefault();
          onClose();
          break;
        }
        default:
          break;
      }
    },
    [mode, onSetMode, onClose]
  );

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <CrtModal title="OmniCool" onClose={onClose} width={980} showHeader={false}>
      <div
        className="cooler-root"
        ref={rootRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-mode={mode}
      >
        {/* Top bar */}
        <div className="cooler-top">
          <div className="cooler-logoBox" aria-label="OmniCool logo">
            <div className="cooler-logo">
              <div className="cooler-logoMark" aria-hidden="true">
                ║║║
              </div>

              <div className="cooler-logoText">
                <div className="cooler-logoName">OMNICOOL</div>
                <div className="cooler-logoTag">THERMAL REGULATION UNIT</div>
              </div>
            </div>

            {/* subtle “brand stamp” */}
            <div className="cooler-logoBig" aria-hidden="true">
              <span className="cooler-logoBigA">OMNI</span>
              <span className="cooler-logoBigB">COOL</span>
            </div>
          </div>

          <div className="cooler-status">
            <div className={panelClass}>
              <div className="cooler-panelLabel"></div>
            </div>

            <div className="cooler-temp">
              <div className="cooler-tempLabel">TEMP</div>
              <div className="cooler-tempValue">
                {temp}
                <span className="cooler-tempUnit">°F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="cooler-bottom">
          <div className="cooler-buttons">
            {MODES.map((m) => {
              const active = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  className={`cooler-btn ${active ? "is-active" : ""}`}
                  onClick={() => onSetMode(m)}
                >
                  <div className="cooler-btnCap" />
                  <div className="cooler-btnLabel">{modeLabel(m)}</div>
                </button>
              );
            })}
          </div>

          <div className="cooler-hint">
            ←/→ to change • ENTER to close • ESC to close
          </div>
        </div>
      </div>
    </CrtModal>
  );
}
