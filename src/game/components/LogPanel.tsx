import { CRT_COLOR_STORAGE_KEY, type LayoutPrefs } from "../Game";
import { getItemsInInventory } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HintsTab } from "../../hints/HintMenu";
import { allHintsRoot } from "../../hints/allHintsRoot";
import { InventoryTree } from "./InventoryTree";
import { StatusTab } from "./StatusTab";

type LogPanelProps = {
  state: GameState;
  dispatch: React.Dispatch<any>;
  layout: LayoutPrefs;
  setLayout: React.Dispatch<React.SetStateAction<LayoutPrefs>>;
  crtColor: string;
  setCrtColor: React.Dispatch<React.SetStateAction<string>>;
  roomPanelFlexBasis: number | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

function applyCRTColor(colorHex: string) {
  const root = document.documentElement;
  root.style.setProperty("--crt-color", colorHex);

  // Convert hex → RGB for rgba() use
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  root.style.setProperty("--crt-color-rgb", `${r} ${g} ${b}`);
}

export const LogPanel: React.FC<LogPanelProps> = ({
  state,
  dispatch,
  layout,
  setLayout,
  crtColor,
  setCrtColor,
  inputRef,
  rootRef,
}) => {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "inventory" | "status" | "hints" | "settings"
  >("inventory");
  const inventoryItems = getItemsInInventory(state);
  const shouldStickToBottomRef = useRef(true);
  const logRef = useRef<HTMLDivElement | null>(null);

  const CRT_COLOR_OPTIONS = [
    { id: "green", label: "Green", value: "#00ff00" },
    { id: "amber", label: "Amber", value: "#ffbf00" },
    { id: "white", label: "White", value: "#f8f8f8" },
    { id: "blue", label: "Ice Blue", value: "#7fdfff" },
    { id: "yellow", label: "Yellow", value: "#ffff4a" },
    { id: "orange", label: "Orange", value: "#ff7b00" },
  ];
  const sidebarWidthPercent = layout.sidebarWidthRatio * 100;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "command", input: trimmed });
    setInput("");
  };

  // -------- vertical resize: log vs sidebar ---------------------------------
  const handleStartResizeVertical = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rootEl = rootRef.current;
    if (!rootEl) return;

    const rect = rootEl.getBoundingClientRect();
    const startX = e.clientX;
    const startSidebarRatio = layout.sidebarWidthRatio;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const startSidebarWidth = startSidebarRatio * rect.width;
      const newSidebarWidth = startSidebarWidth - deltaX;
      let newRatio = newSidebarWidth / rect.width;
      newRatio = Math.max(0.18, Math.min(0.5, newRatio));

      setLayout((prev) => ({ ...prev, sidebarWidthRatio: newRatio }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 32;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // auto-scroll log
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el) return;
    if (!shouldStickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

  // persist crt color
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      applyCRTColor(crtColor);
      window.localStorage.setItem(CRT_COLOR_STORAGE_KEY, crtColor);
    } catch {
      // ignore
    }
  }, [crtColor]);

  return (
    <div className="game-main-row">
      {/* LEFT: transcript + prompt */}
      <div className="game-left">
        <div className="game-log-panel">
          <div className="game-log-inner" ref={logRef}>
            {state.log.map((line, idx) => (
              <p key={idx} className="game-line">
                {line}
              </p>
            ))}
          </div>
        </div>

        <form className="game-footer" onSubmit={onSubmit}>
          <span className="game-prompt">&gt;</span>
          <input
            ref={inputRef}
            className="game-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </form>
      </div>

      {/* vertical resizer - between log and sidebar */}
      <div
        className="game-resizer-vertical"
        onMouseDown={handleStartResizeVertical}
      />

      {/* RIGHT: sidebar */}
      <aside
        className="game-sidebar"
        style={{ flex: `0 0 ${sidebarWidthPercent}%`, minWidth: 0 }}
      >
        <div className="game-tabs">
          <button
            type="button"
            className={
              "game-tab" + (activeTab === "inventory" ? " game-tab-active" : "")
            }
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
          <button
            type="button"
            className={
              "game-tab" + (activeTab === "status" ? " game-tab-active" : "")
            }
            onClick={() => setActiveTab("status")}
          >
            Status
          </button>
          <button
            type="button"
            className={
              "game-tab" + (activeTab === "hints" ? " game-tab-active" : "")
            }
            onClick={() => setActiveTab("hints")}
          >
            Hints
          </button>
          <button
            type="button"
            className={
              "game-tab" + (activeTab === "settings" ? " game-tab-active" : "")
            }
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        <div className="game-sidebar-content">
          {activeTab === "inventory" && (
            <InventoryTree state={state} inventoryItems={inventoryItems} />
          )}

          {activeTab === "status" && <StatusTab gameState={state} />}

          {activeTab === "hints" && (
            <div>
              {/* <p className="crt-color-header">HINTS</p> */}
              <HintsTab rootMenu={allHintsRoot} />
            </div>
          )}
          {activeTab === "settings" && (
            <div className="settings-panel">
              <p className="crt-color-header">CRT Color</p>
              <div className="settings-color-row">
                {CRT_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={
                      "crt-swatch" +
                      (crtColor === opt.value ? " crt-swatch-selected" : "")
                    }
                    style={{ backgroundColor: opt.value }}
                    onClick={() => setCrtColor(opt.value)}
                    aria-label={opt.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
