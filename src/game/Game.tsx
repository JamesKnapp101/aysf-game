import { SplashModal } from "@game/components/SplashModal";
import { OPENING_SPLASH } from "@game/constants";
import { isDeepStorageSuitOverlayActive } from "src/world/maps/levelSeven/deepStorage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentMemory,
  getCurrentScore,
} from "../game/selectors/scoreSelectors";
import { DEFERRED_WORLD_CHUNK_IDS } from "../world/World";
import { LogPanel } from "./components/LogPanel";
import { DeepStorageSuitOverlay } from "./components/DeepStorageSuitOverlay";
import { NotificationHost } from "./components/NotificationHost";
import { OverlayHost } from "./components/OverlayHost";
import { RoomDescriptionPanel } from "./components/RoomDescriptionPanel";
import { RoomTelemetryPanel } from "./components/RoomTelemetryPanel";
import { SidebarPanel } from "./components/SidebarPanel";
import { SyndromeXSignalOverlay } from "./components/SyndromeXSignalOverlay";
import { isPlayerUnderwater } from "./helpers/environmentHelpers";
import { isAnyFlashlightOn } from "./helpers/flashlightHelpers";
import {
  canPlayerSeeInRoom,
  getRoomVisualLightLevel,
} from "./helpers/visibilityHelpers";
import { useGameSession } from "./hooks/useGameSession";
import { useLayoutPrefs } from "./hooks/useLayoutPrefs";
import { useWorldChunkHydration } from "./hooks/useWorldChunkHydration";
import { renderRegisteredRoomOverlays } from "./registries/roomOverlayRegistry";
import { getRegisteredRoomVisualTone } from "./registries/roomVisualRegistry";
import {
  getActiveStatusEffectIds,
  getRadiationIntensity,
} from "./selectors/statusSelectors";
import { useUIEffectsStore } from "./store/store";
import { buildRoomDescription } from "./text/roomDescription";
import { SYNDROME_X_SIGNAL_LOG_SOURCE } from "./text/secretOrganismMessage";
import type { ActionRequest } from "./types/actionsTypes";
import type { StatusEffect } from "./types/gameTypes";

export type SidebarTab =
  | "comet"
  | "inventory"
  | "status"
  | "log"
  | "hints"
  | "settings"
  | "dna";

type PromptFocusOwner = "game" | "comet";

function shouldPreserveNativeControlFocus(target: EventTarget | null): boolean {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return false;

  return Boolean(
    element.closest(
      [
        "a",
        "button",
        "input",
        "label",
        "option",
        "select",
        "summary",
        "textarea",
        "[contenteditable='true']",
        "[role='button']",
        "[role='link']",
        "[role='option']",
      ].join(", "),
    ),
  );
}

export const Game: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("comet");
  const [lastFocusedPrompt, setLastFocusedPrompt] =
    useState<PromptFocusOwner>("game");
  const {
    dismissOpeningSplash,
    gs,
    isSessionReady,
    showOpeningSplash,
    stateRef,
    updateState,
    enqueueCommand,
    runAction,
    setGameState,
    setBrainActivityLevel,
  } = useGameSession({
    onCometCommand: () => setActiveTab("comet"),
    onInventoryCommand: () => setActiveTab("inventory"),
    onDiagnoseCommand: () => setActiveTab("status"),
  });
  const { layout, setLayout, crtColor, setCrtColor } = useLayoutPrefs();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const cometInputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const quadrantGridRef = useRef<HTMLDivElement | null>(null);
  const hasObservedSyndromeXSignalRef = useRef(false);
  const lastSyndromeXSignalRef = useRef<string | null>(null);

  const restorePromptFocus = useCallback(() => {
    if (
      lastFocusedPrompt === "comet" &&
      cometInputRef.current &&
      !cometInputRef.current.disabled
    ) {
      cometInputRef.current.focus();
      return;
    }

    if (inputRef.current && !inputRef.current.disabled) {
      inputRef.current.focus();
    }
  }, [lastFocusedPrompt]);

  const focusGamePrompt = useCallback(() => {
    setLastFocusedPrompt("game");
    if (inputRef.current && !inputRef.current.disabled) {
      inputRef.current.focus();
    }
  }, []);

  const handleGamePromptFocus = useCallback(() => {
    setLastFocusedPrompt("game");
  }, []);

  const handleCometPromptFocus = useCallback(() => {
    setLastFocusedPrompt("comet");
  }, []);

  const handleRootClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldPreserveNativeControlFocus(event.target)) {
        return;
      }

      restorePromptFocus();
    },
    [restorePromptFocus],
  );

  useWorldChunkHydration({
    enabled: isSessionReady,
    gs,
    stateRef,
    updateState,
  });

  const nonce = useUIEffectsStore((s) => s.teleportFlashNonce);
  const screenShakeNonce = useUIEffectsStore((s) => s.screenShakeNonce);
  const playSyndromeXSignal = useUIEffectsStore((s) => s.playSyndromeXSignal);

  useEffect(() => {
    if (nonce === 0) return;
    const el = rootRef.current;
    if (!el) return;

    el.classList.remove("teleport-flash");
    void el.offsetWidth;
    el.classList.add("teleport-flash");
  }, [nonce]);

  useEffect(() => {
    if (screenShakeNonce === 0) return;
    const el = rootRef.current;
    if (!el) return;

    el.classList.remove("screen-shake");
    void el.offsetWidth;
    el.classList.add("screen-shake");
  }, [screenShakeNonce]);

  useEffect(() => {
    const latestSignalEntry = [...(gs.player.log ?? [])]
      .reverse()
      .find((entry) => entry.source === SYNDROME_X_SIGNAL_LOG_SOURCE);
    const signalKey = latestSignalEntry
      ? `${latestSignalEntry.loggedAtTurn}|${latestSignalEntry.title}|${latestSignalEntry.body}`
      : null;

    if (!hasObservedSyndromeXSignalRef.current) {
      hasObservedSyndromeXSignalRef.current = true;
      lastSyndromeXSignalRef.current = signalKey;
      return;
    }

    if (!latestSignalEntry || signalKey === lastSyndromeXSignalRef.current) {
      return;
    }

    lastSyndromeXSignalRef.current = signalKey;
    playSyndromeXSignal({
      id: signalKey ?? `${gs.moves}`,
      text: latestSignalEntry.body,
    });
  }, [gs.moves, gs.player.log, playSyndromeXSignal]);

  // -------- horizontal resize: top vs bottom quadrants ----------------------
  const handleStartResizeHorizontal = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();

      const gridEl = quadrantGridRef.current;
      if (!gridEl) return;

      const rect = gridEl.getBoundingClientRect();
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
    [layout.roomHeightRatio, setLayout],
  );

  // -------- vertical resize: left vs right quadrants ------------------------
  const handleStartResizeVertical = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();

      const gridEl = quadrantGridRef.current;
      if (!gridEl) return;

      const rect = gridEl.getBoundingClientRect();
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
    },
    [layout.sidebarWidthRatio, setLayout],
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
  const visualEffectsMode = gs.uiState.visualEffectsMode ?? "full";

  const nightVisionActive = activeEffects.includes("nightvision-active");

  const flashlightOn = isAnyFlashlightOn(gs);
  const playerIsUnderwater = isPlayerUnderwater(gs);

  // Light and Dark
  const roomAmbientLight = !roomIsDark;
  const playerCanSee = currentRoom
    ? canPlayerSeeInRoom(gs, currentRoom.id)
    : false;
  const roomLightLevel = currentRoom
    ? getRoomVisualLightLevel(gs, currentRoom.id)
    : "normal";
  const playerLightMode =
    roomIsDark && nightVisionActive
      ? "nightvision"
      : roomIsDark && flashlightOn
        ? "flashlight"
        : "ambient";
  const deepStorageSuitOverlayActive = isDeepStorageSuitOverlayActive(gs);

  useEffect(() => {
    if (!deepStorageSuitOverlayActive) return;
    inputRef.current?.blur();
    cometInputRef.current?.blur();
  }, [deepStorageSuitOverlayActive]);

  const overlayRunAction = useCallback(
    (verb: string, payload?: any) => {
      runAction({ verb, payload } as unknown as ActionRequest);
    },
    [runAction],
  );

  const handleDeepStorageHome = useCallback(() => {
    runAction({
      payload: {},
      verb: "deepStorageHome",
    });
  }, [runAction]);

  return (
    <>
      <SplashModal
        continueDisabled={false}
        continueLabel="Continue"
        isOpen={isSessionReady && showOpeningSplash}
        onContinue={() => {
          dismissOpeningSplash();
        }}
        text={OPENING_SPLASH}
      />

      {isSessionReady && !showOpeningSplash && (
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
                "--room-panel-height": roomPanelFlexBasis,
                "--sidebar-width": `${layout.sidebarWidthRatio * 100}%`,
              } as React.CSSProperties
            }
            data-status={activeEffects.join(" ")}
            data-visual-effects={visualEffectsMode}
            data-drunkenness={isDrunk?.intensity ?? 0}
            data-room-ambient-light={roomAmbientLight ? "true" : "false"}
            data-room-light-level={roomLightLevel}
            data-room-visual-tone={getRegisteredRoomVisualTone(
              gs,
              currentRoom?.id ?? gs.player.roomId,
            )}
            data-room-is-dark={roomIsDark ? "true" : "false"}
            data-player-can-see={playerCanSee ? "true" : "false"}
            data-player-light-mode={playerLightMode}
            data-flashlight-on={flashlightOn ? "true" : "false"}
            onClick={handleRootClick}
          >
            <NotificationHost state={gs} setGameState={setGameState} />
            <SyndromeXSignalOverlay visualEffectsMode={visualEffectsMode} />
            {deepStorageSuitOverlayActive && (
              <DeepStorageSuitOverlay
                state={gs}
                onCommand={enqueueCommand}
                onHome={handleDeepStorageHome}
              />
            )}

            {/* HEADER */}
            <div className="game-header">
              <div className="game-header-location">
                {currentRoom?.name || "Unknown Location"}
              </div>
              <div className="game-header-stats">
                <span>Score: {getCurrentScore(gs)}</span>
                <span>Memory: {getCurrentMemory(gs)}%</span>
                <span>Moves: {gs.moves}</span>
              </div>
            </div>

            <div className="game-quadrant-grid" ref={quadrantGridRef}>
              <RoomDescriptionPanel
                desc={desc}
                inputRef={inputRef}
                restorePromptFocus={focusGamePrompt}
                activeEffects={activeEffects.join(" ")}
                roomIsDark={roomIsDark}
                roomAmbientLight={roomAmbientLight}
                roomLightLevel={roomLightLevel}
                playerCanSee={playerCanSee}
                playerLightMode={playerLightMode}
                flashlightOn={flashlightOn ? "true" : "false"}
                isUnderwater={playerIsUnderwater}
                state={gs}
                setBrainActivityLevel={setBrainActivityLevel}
                visualEffectsMode={visualEffectsMode}
              />

              <div
                className="game-resizer-vertical"
                onMouseDown={handleStartResizeVertical}
              />

              <RoomTelemetryPanel exits={exits} state={gs} />

              <div
                className="game-resizer-horizontal"
                onMouseDown={handleStartResizeHorizontal}
              />

              <LogPanel
                state={gs}
                onCommand={enqueueCommand}
                inputRef={inputRef}
                inputDisabled={deepStorageSuitOverlayActive}
                onGamePromptFocus={handleGamePromptFocus}
                onLogPanelClick={focusGamePrompt}
              />

              <SidebarPanel
                activeTab={activeTab}
                cometInputRef={cometInputRef}
                crtColor={crtColor}
                isCometFocusOwner={lastFocusedPrompt === "comet"}
                onCometPromptFocus={handleCometPromptFocus}
                setActiveTab={setActiveTab}
                setCrtColor={setCrtColor}
                setGameState={setGameState}
                state={gs}
              />
            </div>

            {renderRegisteredRoomOverlays(
              gs,
              currentRoom?.id ?? gs.player.roomId,
            )}
          </div>
        </>
      )}
    </>
  );
};
