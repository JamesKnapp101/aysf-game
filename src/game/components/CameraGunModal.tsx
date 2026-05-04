import { useEffect, useMemo, useRef } from "react";
import "../../styles/components/camera-gun-viewer.css";
import { buildRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { Room } from "../types/roomTypes";
import { CrtModal } from "./CrtModal";

type CameraGunViewerModalProps = {
  state: GameState;
  currentView: number;
  onCycleView: (currentViewIndex: number) => void;
  onClose: () => void;
  onRunCommand?: (rawCommand: string) => void;
};

function getItemById(state: any, itemId: string): any | undefined {
  return state?.world?.items?.filter((wi: Item) => wi.id === itemId)?.[0];
}

function getRoomById(state: any, roomId: string): any | undefined {
  return state?.world?.rooms?.filter((r: Room) => r.id === roomId)?.[0];
}

function isRoomId(state: GameState, id: string | undefined): id is string {
  return Boolean(id && state.world.rooms.some((room) => room.id === id));
}

function resolveCameraRoomId(
  state: GameState,
  itemId: string | undefined,
  seen = new Set<string>(),
): string | undefined {
  if (!itemId || seen.has(itemId)) return undefined;
  seen.add(itemId);

  if (itemId === "PLAYER" || itemId === "INVENTORY") {
    return state.player.roomId;
  }

  const attachedHostId = state.itemState.attachedTo[itemId];
  if (attachedHostId) {
    return resolveCameraRoomId(state, attachedHostId, seen);
  }

  const liveLocation = state.itemState.itemRoomId[itemId];
  if (isRoomId(state, liveLocation)) return liveLocation;
  if (liveLocation) return resolveCameraRoomId(state, liveLocation, seen);

  const seedLocation = getItemById(state, itemId)?.location;
  if (isRoomId(state, seedLocation)) return seedLocation;
  if (seedLocation) return resolveCameraRoomId(state, seedLocation, seen);

  return undefined;
}

export function getCameraFeedDescription(
  state: GameState,
  roomId: string | undefined,
): string {
  const room = roomId ? getRoomById(state, roomId) : undefined;
  if (!room || !roomId) return "NO SIGNAL.\n\nThe viewer shows only static.";

  const cameraState = {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        [roomId]: false,
      },
    },
  };

  return (
    buildRoomDescription(cameraState, roomId, {
      mode: "panel",
      forceFull: true,
    }).trim() || (room.name ?? "NO SIGNAL.").toString()
  );
}

export function CameraGunViewerModal({
  state,
  currentView,
  onClose,
  onCycleView,
  onRunCommand,
}: CameraGunViewerModalProps) {
  const viewBtnRef = useRef<HTMLButtonElement | null>(null);

  // Enter or Esc closes
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const activeCameraIds = useMemo(() => {
    const cams = state.itemState.activeGelCameras as
      | Record<string, any>
      | undefined;
    if (!cams) return [];
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

  const item = selectedCameraId
    ? getItemById(state, selectedCameraId)
    : undefined;
  const roomId = resolveCameraRoomId(state, item?.id);
  const room = roomId ? getRoomById(state, roomId) : undefined;

  const description = getCameraFeedDescription(state, roomId);

  const statusLine = (() => {
    if (!selectedCameraId) return "NO SIGNAL";
    const roomName = (room?.name ?? "UNKNOWN LOCATION")
      .toString()
      .toUpperCase();
    return `CAM: ${selectedCameraId}  •  ${roomName}`;
  })();

  function handleCycleView() {
    onCycleView(0);
  }

  function handleWatch() {
    onRunCommand?.("wait");
  }

  const canView = activeCameraIds.length > 0;

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

              {/* LEFT control: WATCH */}
              <div
                className="cgv-controls cgv-controlsLeft"
                aria-label="Watch control"
              >
                <button
                  className="cgv-roundBtn cgv-watchBtn"
                  onClick={handleWatch}
                  disabled={!canView || !onRunCommand}
                  aria-label="Watch (wait one turn)"
                  title={
                    !canView
                      ? "No active cameras"
                      : !onRunCommand
                        ? "No command handler wired"
                        : "WATCH (wait one turn)"
                  }
                />
                <div className="cgv-viewLabel">WATCH</div>
              </div>

              {/* RIGHT control: VIEW */}
              <div className="cgv-controls" aria-label="Viewer controls">
                <button
                  ref={viewBtnRef}
                  className="cgv-roundBtn cgv-viewBtn"
                  onClick={handleCycleView}
                  disabled={!canView}
                  aria-label="View next camera"
                  title={!canView ? "No active cameras" : "View next camera"}
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
