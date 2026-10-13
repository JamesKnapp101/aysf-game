import { dispatchAction } from "../actions/dispatchAction";
import { cameraGunViewer } from "../helpers/cameraGunViewerHelpers";
import { reconcileObjectives } from "../rules/objectives";
import { useUIOverlayStore } from "../store/store";
import type { GameState } from "../types/gameTypes";
import type { Overlay } from "../types/uiTypes";
import { closeHeadlessOverlay } from "./simpleOverlays";

type CameraOverlay = Extract<Overlay, { kind: "camera-gun-viewer" }>;

export function supportsCameraGunOverlay(kind: Overlay["kind"]): boolean {
  return kind === "camera-gun-viewer";
}

export function cameraGunPresentation(state: GameState, overlay: CameraOverlay): string {
  const view = cameraGunViewer(state, overlay.currentViewIndex);
  return [
    "OMNISPY — CAM GUN PRO — GEL CAM VIEWER", view.statusLine, view.description,
    view.canView ? "Use view, watch (wait one turn), or close." : "VIEW and WATCH disabled: no active cameras. Use close.",
  ].join("\n\n");
}

/** WATCH requests the session's ordinary wait pipeline; other controls are free. */
export async function cameraGunCommand(state: GameState, overlay: CameraOverlay, input: string) {
  if (/^close$/i.test(input)) {
    const closed = closeHeadlessOverlay(state, overlay);
    return { state: closed.state, text: [`> ${input}`, "You close the interface.", ...closed.text], wait: false };
  }
  const view = cameraGunViewer(state, overlay.currentViewIndex);
  if (view.canView && /^watch$/i.test(input)) return { state, text: [], wait: true };
  if (view.canView && /^view$/i.test(input)) {
    const result = await dispatchAction(state, { verb: "cycleCameraGunView", payload: {} });
    const next = reconcileObjectives(state, result.state);
    if (result.overlay) useUIOverlayStore.getState().openOverlay(result.overlay);
    const mounted = useUIOverlayStore.getState().overlay;
    return { state: next, text: [`> ${input}`, ...(mounted.kind === "camera-gun-viewer" ? [cameraGunPresentation(next, mounted)] : [])], wait: false };
  }
  return { state, text: [`> ${input}`, cameraGunPresentation(state, overlay)], wait: false };
}
