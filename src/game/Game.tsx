import React, {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { parseCommand } from "../parse/parser";
import { WORLD } from "../world/World";
import { createInitialState } from "./gameInit";
import { StatusTab } from "./components/StatusTab";
import { HintsTab } from "../hints/HintMenu";
import { allHintsRoot } from "../hints/allHintsRoot";
import { getCurrentRoom, getCurrentRoomExits } from "./selectors/roomSelectors";
import { getItemsInInventory } from "./selectors/itemSelectors";
import type { GameState, StatusEffect } from "./types/gameTypes";
import { handleCommand } from "./engine/handleCommand";
import { buildRoomDescription } from "./text/roomDescription";
import {
  getActiveStatusEffectIds,
  getRadiationIntensity,
} from "./selectors/statusSelectors";
import { RoomDescriptionPanel } from "./components/RoomDescriptionPanel";

type Action = { type: "command"; input: string };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "command": {
      const trimmed = action.input.trim();
      if (!trimmed) return state;

      const parsed = parseCommand(trimmed);
      const next = handleCommand(state, parsed);
      return { ...next, moves: next.moves + 1 };
    }
    default:
      return state;
  }
}

const CRT_COLOR_STORAGE_KEY = "aysf-crt-color-v1";
const CRT_COLOR_OPTIONS = [
  { id: "green", label: "Green", value: "#00ff00" },
  { id: "amber", label: "Amber", value: "#ffbf00" },
  { id: "white", label: "White", value: "#f8f8f8" },
  { id: "blue", label: "Ice Blue", value: "#7fdfff" },
  { id: "yellow", label: "Yellow", value: "#ffff4a" },
  { id: "orange", label: "Orange", value: "#ff7b00" },
];

function loadInitialCrtColor(): string {
  if (typeof window === "undefined") return "#00ff00";
  try {
    const stored = window.localStorage.getItem(CRT_COLOR_STORAGE_KEY);
    return stored || "#00ff00";
  } catch {
    return "#00ff00";
  }
}

function applyCRTColor(colorHex: string) {
  const root = document.documentElement;

  root.style.setProperty("--crt-color", colorHex);

  // Convert hex → RGB for rgba() use
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  root.style.setProperty("--crt-color-rgb", `${r} ${g} ${b}`);
}

type LayoutPrefs = {
  roomHeightRatio: number;
  sidebarWidthRatio: number;
};

const LAYOUT_STORAGE_KEY = "aysf-layout-v1";

function loadLayoutPrefs(): LayoutPrefs {
  if (typeof window === "undefined") {
    return { roomHeightRatio: 0.33, sidebarWidthRatio: 0.3 };
  }
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return { roomHeightRatio: 0.33, sidebarWidthRatio: 0.3 };
    const parsed = JSON.parse(raw) as Partial<LayoutPrefs>;
    return {
      roomHeightRatio:
        typeof parsed.roomHeightRatio === "number"
          ? parsed.roomHeightRatio
          : 0.33,
      sidebarWidthRatio:
        typeof parsed.sidebarWidthRatio === "number"
          ? parsed.sidebarWidthRatio
          : 0.3,
    };
  } catch {
    return { roomHeightRatio: 0.33, sidebarWidthRatio: 0.3 };
  }
}

export const Game: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, createInitialState(WORLD));
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "inventory" | "status" | "hints" | "settings"
  >("inventory");
  const [layout, setLayout] = useState<LayoutPrefs>(() => loadLayoutPrefs());
  const [crtColor, setCrtColor] = useState<string>(() => loadInitialCrtColor());
  const activeEffects = getActiveStatusEffectIds(state); // e.g. ["drunk","trixophine"]
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const currentRoom = getCurrentRoom(state);
  const inventoryItems = getItemsInInventory(state);
  const exits = getCurrentRoomExits(state);
  const desc = buildRoomDescription(state, state.player.roomId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "command", input: trimmed });
    setInput("");
  };

  // auto-scroll log
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

  // persist layout
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout]);

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

  // -------- horizontal resize: room vs main row -----------------------------
  const handleStartResizeHorizontal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rootEl = rootRef.current;
    if (!rootEl) return;

    const rect = rootEl.getBoundingClientRect();
    const startY = e.clientY;
    const startRatio = layout.roomHeightRatio;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const startHeight = startRatio * rect.height;
      let newHeight = startHeight + deltaY;
      let newRatio = newHeight / rect.height;

      // clamp so room and log both stay visible
      newRatio = Math.max(0.15, Math.min(0.7, newRatio));

      setLayout((prev) => ({ ...prev, roomHeightRatio: newRatio }));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const shouldStickToBottomRef = useRef(true);

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

  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el) return;
    if (!shouldStickToBottomRef.current) return;

    // For logs, I actually prefer instant (no seasick smooth scrolling)
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

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

      // clamp so both log and sidebar are usable
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

  const roomPanelFlexBasis = `${layout.roomHeightRatio * 100}%`;
  const sidebarWidthPercent = layout.sidebarWidthRatio * 100;

  const rad = getRadiationIntensity(state);

  const rad01 = Math.max(0, Math.min(1, rad / 100));

  const isDrunk = state.player.statusEffects.find(
    (eff: StatusEffect) => eff.id === "drunk"
  );

  console.log("Status effects: ", state.player.statusEffects);
  console.log("--drunk should be ", String(isDrunk?.intensity ?? 0 * 0.1));

  return (
    <div
      ref={rootRef}
      className="game-root"
      style={
        {
          "--crt-color": crtColor,
          "--rad": String(rad01),
          "--drunk": String((isDrunk?.intensity ?? 0) / 100),
        } as React.CSSProperties
      }
      data-status={activeEffects.join(" ")}
      data-drunkenness={isDrunk?.intensity ?? 0}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {/* HEADER */}
      <div className="game-header">
        <div className="game-header-location">
          {currentRoom.name || "Unknown Location"}
        </div>
        <div className="game-header-stats">
          <span>Score: {state.score}</span>
          <span>Memory: {state.player.memories.memoryScore}%</span>
          <span>Rating: {state.rating}</span>
          <span>Moves: {state.moves}</span>
        </div>
      </div>

      {/* ROOM DESCRIPTION */}
      <RoomDescriptionPanel
        desc={desc}
        exits={exits}
        roomPanelFlexBasis={roomPanelFlexBasis}
        inputRef={inputRef}
      />

      {/* horizontal resizer - between room and main row */}
      <div
        className="game-resizer-horizontal"
        onMouseDown={handleStartResizeHorizontal}
      />

      {/* MAIN ROW: log + sidebar */}
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
                "game-tab" +
                (activeTab === "inventory" ? " game-tab-active" : "")
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
                "game-tab" +
                (activeTab === "settings" ? " game-tab-active" : "")
              }
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>

          <div className="game-sidebar-content">
            {activeTab === "inventory" && (
              <div>
                {inventoryItems.length === 0 ? (
                  <p className="game-line">You are carrying nothing.</p>
                ) : (
                  <>
                    <p className="game-line">You are carrying:</p>
                    <ul className="game-list">
                      {inventoryItems.map((item) => (
                        <li style={{ marginLeft: "1.5rem" }} key={item.id}>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
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
    </div>
  );
};
