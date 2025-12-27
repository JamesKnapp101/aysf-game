import React, { useEffect, useMemo, useRef } from "react";
import { CrtModal } from "./CrtModal";
import "../../styles/components/camera-gun-viewer.css";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Room } from "../types/roomTypes";

/**
 * Minimal assumptions:
 * - state.itemState.activeCameras is a record keyed by item id (GelRound id), truthy means active
 * - items are resolvable by id with location = room id string
 * - rooms are resolvable by id with description/name
 *
 * If your selectors are different, swap the two tiny helpers below.
 */

type CameraGunViewerModalProps = {
  state: GameState;
  currentView: number;
  onSetMode: (currentViewIndex: number) => void; // you call runAction("cycleCameraGunView", { currentViewIndex })
  onClose: () => void;
};

function getItemById(state: any, itemId: string): any | undefined {
  // Adjust if your items live somewhere else.
  // Common patterns: state.world.itemsById or state.itemsById
  return state?.world?.items?.filter((wi: Item) => wi.id === itemId)?.[0];
}

function getRoomById(state: any, roomId: string): any | undefined {
  // Adjust if your rooms live somewhere else.
  return state?.world?.rooms?.filter((r: Room) => r.id === roomId)?.[0];
}

function getRoomDescription(room: any | undefined): string {
  if (!room) return "NO SIGNAL.\n\nThe viewer shows only static.";
  const d = (room.description ?? room.longDescription ?? "").trim();
  if (d) return d;
  return (room.name ?? "NO SIGNAL.").toString();
}

export function CameraGunViewerModal({
  state,
  currentView,
  onSetMode,
  onClose,
}: CameraGunViewerModalProps) {
  const viewBtnRef = useRef<HTMLButtonElement | null>(null);

  // Enter or Esc closes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    viewBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const activeCameraIds = useMemo(() => {
    const cams = state.itemState.activeGelCameras as
      | Record<string, any>
      | undefined;
    if (!cams) return [];
    // stable order so "cycling" feels predictable
    return Object.keys(cams)
      .filter((id) => !!cams[id])
      .sort((a, b) => a.localeCompare(b));
  }, [state.itemState.activeGelCameras]);

  const selectedCameraId = useMemo(() => {
    if (activeCameraIds.length === 0) return null;
    const idx =
      ((currentView % activeCameraIds.length) + activeCameraIds.length) %
      activeCameraIds.length;
    return activeCameraIds[idx] ?? null;
  }, [activeCameraIds, currentView]);

  const room = useMemo(() => {
    if (!selectedCameraId) return undefined;
    const item = getItemById(state, selectedCameraId);
    const roomId = item?.location as string | undefined;
    if (!roomId) return undefined;
    return getRoomById(state, roomId);
  }, [state, selectedCameraId]);

  const description = useMemo(() => getRoomDescription(room), [room]);

  const statusLine = useMemo(() => {
    if (!selectedCameraId) return "NO SIGNAL";
    const roomName = (room?.name ?? "UNKNOWN LOCATION")
      .toString()
      .toUpperCase();
    return `CAM: ${selectedCameraId}  •  ${roomName}`;
  }, [selectedCameraId, room?.name]);

  function handleCycleView() {
    // You said the action expects { currentViewIndex }
    onSetMode(0);
  }

  return (
    <CrtModal
      title="OMNICONNECT PRO — GEL CAM VIEWER"
      onClose={onClose}
      width={640}
      height={520}
      showHeader={false}
    >
      <div className="cgv-root">
        <div className="cgv-panel">
          <div className="cgv-header">
            <div className="cgv-brand" aria-label="OmniConnect">
              <span className="cgv-brandName">OMNISPY</span>
              <span className="cgv-brandTag">CAM GUN PRO</span>
              <span className="cgv-appName">GEL CAM VIEWER</span>
            </div>

            <div className="cgv-status" title={statusLine}>
              {statusLine}
            </div>
          </div>

          <div className="cgv-body">
            <div className="cgv-screenFrame" aria-label="Camera viewer screen">
              <div className="cgv-screenGlass">
                {/* IMPORTANT: overlays are now INSIDE the masked screenContent */}
                <div
                  className="cgv-screenContent"
                  role="region"
                  aria-label="Camera feed text"
                >
                  <div className="cgv-curvature" aria-hidden="true" />
                  <div className="cgv-scanlines" aria-hidden="true" />
                  <div className="cgv-vignette" aria-hidden="true" />

                  <div className="cgv-scroll">
                    <pre className="cgv-text" data-text={description}>
                      {description}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="cgv-controls" aria-label="Viewer controls">
                <button
                  ref={viewBtnRef}
                  className="cgv-viewBtn"
                  onClick={handleCycleView}
                  disabled={activeCameraIds.length === 0}
                  aria-label="View next camera"
                  title={
                    activeCameraIds.length === 0
                      ? "No active cameras"
                      : "View next camera"
                  }
                />
                <div className="cgv-viewLabel">VIEW</div>
              </div>
            </div>

            <div className="cgv-hint" aria-hidden="true">
              <span className="cgv-hintKey">ENTER</span> or{" "}
              <span className="cgv-hintKey">ESC</span> to close
            </div>
          </div>
        </div>
      </div>
    </CrtModal>
  );
}
