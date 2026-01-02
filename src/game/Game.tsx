import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { parseCommand } from "../parse/parser";
import { WORLD } from "../world/World";
import { createInitialState } from "./gameInit";
import type { GameState, StatusEffect } from "./types/gameTypes";

import { dispatchAction } from "./actions/dispatchAction";
import { handleCommand } from "./engine/handleCommand";

import { getCurrentRoom, getCurrentRoomExits } from "./selectors/roomSelectors";
import {
  getActiveStatusEffectIds,
  getRadiationIntensity,
} from "./selectors/statusSelectors";
import { buildRoomDescription } from "./text/roomDescription";

import { LogPanel } from "./components/LogPanel";
import { OverlayHost } from "./components/OverlayHost";
import { RoomDescriptionPanel } from "./components/RoomDescriptionPanel";

import { appendLog } from "./engine/handleCommand"; // (keeping your existing export)
import { useUIOverlayStore } from "./store/store";
import type { ActionRequest } from "./types/actionsTypes";

type Action = { type: "command"; input: string };

const LAYOUT_STORAGE_KEY = "aysf-layout-v1";
export const CRT_COLOR_STORAGE_KEY = "aysf-crt-color-v1";

export type LayoutPrefs = {
  roomHeightRatio: number;
  sidebarWidthRatio: number;
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "command": {
      const trimmed = action.input.trim();
      if (!trimmed) return state;

      const parsed = parseCommand(trimmed);
      const next = handleCommand(state, parsed);

      return { ...next };
    }
    default:
      return state;
  }
}

function loadInitialCrtColor(): string {
  if (typeof window === "undefined") return "#00ff00";
  try {
    return window.localStorage.getItem(CRT_COLOR_STORAGE_KEY) || "#00ff00";
  } catch {
    return "#00ff00";
  }
}

function loadLayoutPrefs(): LayoutPrefs {
  const defaults: LayoutPrefs = {
    roomHeightRatio: 0.33,
    sidebarWidthRatio: 0.3,
  };
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<LayoutPrefs>;
    return {
      roomHeightRatio:
        typeof parsed.roomHeightRatio === "number"
          ? parsed.roomHeightRatio
          : defaults.roomHeightRatio,
      sidebarWidthRatio:
        typeof parsed.sidebarWidthRatio === "number"
          ? parsed.sidebarWidthRatio
          : defaults.sidebarWidthRatio,
    };
  } catch {
    return defaults;
  }
}

export const Game: React.FC = () => {
  /**
   * Single source of truth for game state.
   * Keep useReducer, but add a tiny adapter so UI actions can replace the whole state.
   */
  type StateAction = Action | { type: "replaceState"; next: GameState };

  const [gs, dispatchState] = useReducer((s: GameState, a: StateAction) => {
    if (a.type === "replaceState") return a.next;
    return reducer(s, a as Action);
  }, createInitialState(WORLD));

  const stateRef = useRef(gs);

  // keep an always-current state for non-React callbacks
  useEffect(() => {
    stateRef.current = gs;
  }, [gs]);

  const [layout, setLayout] = useState<LayoutPrefs>(() => loadLayoutPrefs());
  const [crtColor, setCrtColor] = useState<string>(() => loadInitialCrtColor());

  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const openOverlay = useUIOverlayStore.getState().openOverlay;

  // persist layout
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout]);

  const applyResult = useCallback(
    (result: { state: GameState; message?: string; overlay?: any }) => {
      let next = result.state;

      if (result.message) {
        next = appendLog(next, result.message);
      }

      dispatchState({ type: "replaceState", next });

      if (result.overlay) {
        openOverlay(result.overlay);
      }
    },
    [openOverlay]
  );

  const runAction = useCallback(
    (req: ActionRequest) => {
      const current = stateRef.current;
      const result = dispatchAction(current, req);
      applyResult(result);
    },
    [applyResult]
  );

  // -------- horizontal resize: room vs main row -----------------------------
  const handleStartResizeHorizontal = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
        const newHeight = startHeight + deltaY;
        let newRatio = newHeight / rect.height;
        newRatio = Math.max(0.15, Math.min(0.7, newRatio));
        setLayout((prev) => ({ ...prev, roomHeightRatio: newRatio }));
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [layout.roomHeightRatio]
  );

  const roomPanelFlexBasis = `${layout.roomHeightRatio * 100}%`;

  const currentRoom = getCurrentRoom(gs);
  const exits = getCurrentRoomExits(gs);
  const desc = buildRoomDescription(gs, currentRoom.id);
  const activeEffects = getActiveStatusEffectIds(gs);
  const rad = getRadiationIntensity(gs);
  const rad01 = Math.max(0, Math.min(1, rad / 100));

  const isDrunk = gs.player.statusEffects.find(
    (eff: StatusEffect) => eff.id === "drunk"
  );

  const roomIsDark = Boolean(gs.worldState.darkRooms[currentRoom.id]);

  const nightVisionActive = activeEffects.includes("nightvision-active");

  const flashlightOn = (() => {
    if (!gs.player.inventory.includes("flashlight")) return false;
    const fs = gs.itemState.itemSettings["flashlight"];
    return Boolean(fs && "isOn" in fs && fs.isOn === true);
  })();

  // Light and Dark
  const roomAmbientLight = !roomIsDark;
  const playerCanSee = !roomIsDark || nightVisionActive || flashlightOn;
  const playerLightMode =
    roomIsDark && nightVisionActive
      ? "nightvision"
      : roomIsDark && flashlightOn
      ? "flashlight"
      : "none";

  const overlayRunAction = useCallback(
    (verb: string, payload?: any) => {
      runAction({ verb, payload } as unknown as ActionRequest);
    },
    [runAction]
  );

  return (
    <>
      {/* The OverlayHost handles all the screen effects */}
      <OverlayHost runAction={overlayRunAction} state={gs} />
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
        data-room-ambient-light={roomAmbientLight ? "true" : "false"}
        data-room-is-dark={roomIsDark ? "true" : "false"}
        data-player-can-see={playerCanSee ? "true" : "false"}
        data-player-light-mode={playerLightMode}
        data-flashlight-on={flashlightOn ? "true" : "false"}
        onClick={() => inputRef.current?.focus()}
      >
        {/* HEADER */}
        <div className="game-header">
          <div className="game-header-location">
            {currentRoom.name || "Unknown Location"}
          </div>
          <div className="game-header-stats">
            <span>Score: {gs.score}</span>
            <span>Memory: {gs.player.memories.memoryScore}%</span>
            <span>Rating: {gs.rating}</span>
            <span>Moves: {gs.moves}</span>
          </div>
        </div>

        {/* ROOM DESCRIPTION */}
        <RoomDescriptionPanel
          desc={desc}
          exits={exits}
          roomPanelFlexBasis={roomPanelFlexBasis}
          inputRef={inputRef}
          activeEffects={activeEffects.join(" ")}
          roomIsDark={roomIsDark}
          roomAmbientLight={roomAmbientLight}
          playerCanSee={playerCanSee}
          playerLightMode={playerLightMode}
          flashlightOn={flashlightOn ? "true" : "false"}
          roomId={currentRoom.id}
          worldState={gs.worldState}
        />

        {/* horizontal resizer - between room and main row */}
        <div
          className="game-resizer-horizontal"
          onMouseDown={handleStartResizeHorizontal}
        />

        {/* MAIN ROW: log + sidebar */}
        <LogPanel
          state={gs}
          dispatch={dispatchState as any}
          layout={layout}
          setLayout={setLayout}
          crtColor={crtColor}
          setCrtColor={setCrtColor}
          roomPanelFlexBasis={roomPanelFlexBasis}
          inputRef={inputRef}
          rootRef={rootRef}
        />
      </div>
    </>
  );
};
