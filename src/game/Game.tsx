import { SplashModal } from "@game/components/SplashModal";
import { OPENING_SPLASH } from "@game/constants";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getCurrentMemory,
  getCurrentScore,
} from "../game/selectors/scoreSelectors";
import {
  DEFERRED_WORLD_CHUNK_IDS,
} from "../world/World";
import { LogPanel } from "./components/LogPanel";
import { NotificationHost } from "./components/NotificationHost";
import { OverlayHost } from "./components/OverlayHost";
import { RoomDescriptionPanel } from "./components/RoomDescriptionPanel";
import { useGameSession } from "./hooks/useGameSession";
import { useLayoutPrefs } from "./hooks/useLayoutPrefs";
import { useWorldChunkHydration } from "./hooks/useWorldChunkHydration";
import { isPlayerUnderwater } from "./helpers/environmentHelpers";
import {
  getActiveStatusEffectIds,
  getRadiationIntensity,
} from "./selectors/statusSelectors";
import { useUIEffectsStore } from "./store/store";
import { buildRoomDescription } from "./text/roomDescription";
import type { ActionRequest } from "./types/actionsTypes";
import type { StatusEffect } from "./types/gameTypes";

export type SidebarTab =
  | "inventory"
  | "status"
  | "log"
  | "hints"
  | "settings"
  | "dna";

export const Game: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("status");
  const [showSplash, setShowSplash] = useState(true);
  const {
    gs,
    stateRef,
    updateState,
    enqueueCommand,
    runAction,
    setGameState,
    setBrainActivityLevel,
  } = useGameSession({
    onInventoryCommand: () => setActiveTab("inventory"),
    onDiagnoseCommand: () => setActiveTab("status"),
  });
  const { layout, setLayout, crtColor, setCrtColor } = useLayoutPrefs();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useWorldChunkHydration({ gs, stateRef, updateState });

  const nonce = useUIEffectsStore((s) => s.teleportFlashNonce);

  useEffect(() => {
    if (nonce === 0) return;
    const el = rootRef.current;
    if (!el) return;

    el.classList.remove("teleport-flash");
    void el.offsetWidth;
    el.classList.add("teleport-flash");
  }, [nonce]);

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
    [layout.roomHeightRatio, setLayout],
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
  const playerIsUnderwater = isPlayerUnderwater(gs);

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
            <NotificationHost state={gs} setGameState={setGameState} />

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
              isUnderwater={playerIsUnderwater}
              roomId={currentRoom?.id ?? gs.player.roomId}
              state={gs}
              setBrainActivityLevel={setBrainActivityLevel}
            />

            {/* horizontal resizer - between room and main row */}
            <div
              className="game-resizer-horizontal"
              onMouseDown={handleStartResizeHorizontal}
            />

            {/* MAIN ROW: log + sidebar */}
            <LogPanel
              state={gs}
              onCommand={enqueueCommand}
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
