import { SplashModal } from "@game/components/SplashModal";
import { OPENING_SPLASH } from "@game/constants";
import { overridePlayerBrainActivityLevel } from "@game/helpers/itemHelpers";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  getCurrentMemory,
  getCurrentScore,
} from "../game/selectors/scoreSelectors";
import { parseCommand } from "../parse/parser";
import {
  DEFERRED_WORLD_CHUNK_IDS,
  INITIAL_WORLD,
  getPriorityWorldChunkIdsForRoom,
  loadWorldChunk,
  type WorldChunkId,
} from "../world/World";
import { dispatchAction } from "./actions/dispatchAction";
import { LogPanel } from "./components/LogPanel";
import { OverlayHost } from "./components/OverlayHost";
import { RoomDescriptionPanel } from "./components/RoomDescriptionPanel";
import { appendLog, handleCommand } from "./engine/handleCommand";
import { createInitialState, mergeWorldChunkIntoState } from "./gameInit";
import {
  getActiveStatusEffectIds,
  getRadiationIntensity,
} from "./selectors/statusSelectors";
import { useUIEffectsStore, useUIOverlayStore } from "./store/store";
import { buildRoomDescription } from "./text/roomDescription";
import type { ActionRequest } from "./types/actionsTypes";
import type { GameState, StatusEffect, WorldChunk } from "./types/gameTypes";

const LAYOUT_STORAGE_KEY = "aysf-layout-v1";
export const CRT_COLOR_STORAGE_KEY = "aysf-crt-color-v1";

export type LayoutPrefs = {
  roomHeightRatio: number;
  sidebarWidthRatio: number;
};

export type SidebarTab =
  | "inventory"
  | "status"
  | "log"
  | "hints"
  | "settings"
  | "dna";

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

function waitForBackgroundTurn(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };

    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

export const Game: React.FC = () => {
  type StateAction =
    | { type: "command"; input: string }
    | { type: "replaceState"; next: GameState }
    | { type: "mergeWorldChunk"; chunkId: WorldChunkId; chunk: WorldChunk }
    | { type: "setBrainActivity"; val: number };
  const [activeTab, setActiveTab] = useState<SidebarTab>("status");

  const [gs, dispatchState] = useReducer(
    (s: GameState, a: StateAction): GameState => {
      if (a.type === "replaceState") return a.next;

      if (a.type === "mergeWorldChunk") {
        return mergeWorldChunkIntoState(s, a.chunkId, a.chunk);
      }

      if (a.type === "setBrainActivity") {
        const result = overridePlayerBrainActivityLevel(s, a.val) as
          | GameState
          | { state: GameState; message?: string; overlay?: any };
        const nextState = "state" in result ? result.state : result;
        if ("message" in result && result.message) {
          return appendLog(nextState, result.message);
        }
        return nextState;
      }

      if (a.type === "command") {
        const trimmed = a.input.trim();
        if (!trimmed) return s;

        const parsed = parseCommand(trimmed);
        type CommandResult =
          | GameState
          | { state: GameState; message?: string; overlay?: any };
        const result = handleCommand(s, parsed) as CommandResult;
        const nextState = "state" in result ? result.state : result;

        if (parsed.type === "inventory") {
          setActiveTab("inventory");
        }

        if (parsed.type === "diagnose") {
          setActiveTab("status");
        }

        if ("message" in result && result.message) {
          return appendLog(nextState, result.message);
        }

        return nextState;
      }

      return s;
    },
    INITIAL_WORLD,
    createInitialState,
  );

  const [showSplash, setShowSplash] = useState(true);

  const stateRef = useRef(gs);
  const isMountedRef = useRef(true);
  const loadingWorldChunksRef = useRef<Map<WorldChunkId, Promise<void>>>(
    new Map(),
  );

  useEffect(() => {
    stateRef.current = gs;
  }, [gs]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestWorldChunk = useCallback(
    (chunkId: WorldChunkId): Promise<void> => {
      if (
        Array.isArray(stateRef.current.world.meta?.loadedChunkIds) &&
        stateRef.current.world.meta.loadedChunkIds.includes(chunkId)
      ) {
        return Promise.resolve();
      }

      const existing = loadingWorldChunksRef.current.get(chunkId);
      if (existing) {
        return existing;
      }

      const pending = loadWorldChunk(chunkId)
        .then((chunk) => {
          if (!isMountedRef.current) return;
          dispatchState({ type: "mergeWorldChunk", chunkId, chunk });
        })
        .catch((error) => {
          console.error(`Failed to load world chunk "${chunkId}"`, error);
        })
        .finally(() => {
          loadingWorldChunksRef.current.delete(chunkId);
        });

      loadingWorldChunksRef.current.set(chunkId, pending);
      return pending;
    },
    [],
  );

  useEffect(() => {
    const hydrateDeferredWorld = async () => {
      for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
        if (!isMountedRef.current) return;
        await requestWorldChunk(chunkId);
        if (!isMountedRef.current) return;
        await waitForBackgroundTurn();
      }
    };

    void hydrateDeferredWorld();
  }, [requestWorldChunk]);

  useEffect(() => {
    for (const chunkId of getPriorityWorldChunkIdsForRoom(gs.player.roomId)) {
      void requestWorldChunk(chunkId);
    }
  }, [gs.player.roomId, requestWorldChunk]);

  useEffect(() => {
    if (gs.world.rooms.some((room) => room.id === gs.player.roomId)) {
      return;
    }

    let cancelled = false;

    const hydrateCurrentRoom = async () => {
      for (const chunkId of DEFERRED_WORLD_CHUNK_IDS) {
        if (cancelled || !isMountedRef.current) return;

        if (
          stateRef.current.world.rooms.some(
            (room) => room.id === stateRef.current.player.roomId,
          )
        ) {
          return;
        }

        await requestWorldChunk(chunkId);
        if (cancelled || !isMountedRef.current) return;
        await waitForBackgroundTurn();
      }
    };

    void hydrateCurrentRoom();

    return () => {
      cancelled = true;
    };
  }, [gs.player.roomId, gs.world.rooms, requestWorldChunk]);

  useEffect(() => {
    const requestedChunkIds = Array.isArray(gs.world.meta?.requestedChunkIds)
      ? (gs.world.meta.requestedChunkIds as WorldChunkId[])
      : [];

    for (const chunkId of requestedChunkIds) {
      void requestWorldChunk(chunkId);
    }
  }, [gs.world.meta?.requestedChunkIds, requestWorldChunk]);

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

  const nonce = useUIEffectsStore((s) => s.teleportFlashNonce);

  useEffect(() => {
    if (nonce === 0) return;
    const el = rootRef.current;
    if (!el) return;

    el.classList.remove("teleport-flash");
    void el.offsetWidth;
    el.classList.add("teleport-flash");
  }, [nonce]);

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
    [openOverlay],
  );

  const runAction = useCallback(
    (req: ActionRequest) => {
      const current = stateRef.current;
      const result = dispatchAction(current, req);
      applyResult(result);
    },
    [applyResult],
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
    [layout.roomHeightRatio],
  );

  const roomPanelFlexBasis = `${layout.roomHeightRatio * 100}%`;

  const currentRoom =
    gs.world.rooms.find((room) => room.id === gs.player.roomId) ?? null;
  const exits = currentRoom?.exits.map((exit) => exit.direction) ?? [];
  const loadedChunkIds = Array.isArray(gs.world.meta?.loadedChunkIds)
    ? gs.world.meta.loadedChunkIds
    : [];
  const allDeferredChunksLoaded = DEFERRED_WORLD_CHUNK_IDS.every((chunkId) =>
    loadedChunkIds.includes(chunkId),
  );
  const desc = currentRoom
    ? buildRoomDescription(gs, currentRoom.id, {
        mode: "panel",
        forceFull: true,
      })
    : allDeferredChunksLoaded
      ? `Unknown room id: ${gs.player.roomId}`
      : "The surrounding area is still coming into focus.";

  const activeEffects = getActiveStatusEffectIds(gs);
  const rad = getRadiationIntensity(gs);
  const rad01 = Math.max(0, Math.min(1, rad / 100));

  const isDrunk = gs.player.statusEffects.find(
    (eff: StatusEffect) => eff.id === "drunk",
  );

  const roomIsDark = currentRoom
    ? Boolean(gs.worldState.darkRooms[currentRoom.id])
    : false;

  const nightVisionActive = activeEffects.includes("nightvision-active");

  const flashlightOn = (() => {
    if (!gs.player.inventory.general.includes("flashlight")) return false;
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
        : "ambient";

  const overlayRunAction = useCallback(
    (verb: string, payload?: any) => {
      runAction({ verb, payload } as unknown as ActionRequest);
    },
    [runAction],
  );

  const setGameState = useCallback(
    (value: GameState | ((prev: GameState) => GameState)) => {
      if (typeof value === "function") {
        const updater = value as (prev: GameState) => GameState;
        dispatchState({
          type: "replaceState",
          next: updater(stateRef.current),
        });
      } else {
        dispatchState({
          type: "replaceState",
          next: value,
        });
      }
    },
    [],
  );

  return (
    <>
      <SplashModal
        isOpen={showSplash}
        onContinue={() => setShowSplash(false)}
        text={OPENING_SPLASH}
      />

      {!showSplash && (
        <>
          {/* The OverlayHost handles all the screen effects */}
          <OverlayHost
            runAction={overlayRunAction}
            state={gs}
            setGameState={setGameState}
          />

          <div
            id={"game-root"}
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
                {currentRoom?.name || "Unknown Location"}
              </div>
              <div className="game-header-stats">
                <span>Score: {getCurrentScore(gs)}</span>
                <span>Memory: {getCurrentMemory(gs)}%</span>
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
              roomId={currentRoom?.id ?? gs.player.roomId}
              state={gs}
              setBrainActivityLevel={(val) =>
                dispatchState({ type: "setBrainActivity", val })
              }
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
              activeTab={activeTab}
              setActiveTab={(tab: SidebarTab) => setActiveTab(tab)}
            />
          </div>
        </>
      )}
    </>
  );
};
