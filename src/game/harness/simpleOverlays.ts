import { dispatchAction } from "../actions/dispatchAction";
import { appendLog } from "../engine/log";
import { formatRadioFrequency, getCurrentRadioFrequency, RADIO_FINE_TUNE_CONTROLS, RADIO_FREQUENCY_MIN, RADIO_FREQUENCY_MAX, setRadioFrequency } from "../helpers/radioHelpers";
import { hasRegisteredOverlayReadout, registeredOverlayReadout } from "../registries/overlayReadoutRegistry";
import { enqueueNotifications } from "../rules/notifications";
import { reconcileObjectives } from "../rules/objectives";
import { useUIOverlayStore } from "../store/store";
import { COOLER_MODES, coolerModeTemperature } from "../text/coolerPanel";
import type { ActionRequest } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { Overlay } from "../types/uiTypes";

export function supportsSimpleOverlay(kind: Overlay["kind"]): boolean {
  return ["cooler", "spin-stage-speed-password", "bar-jukebox", "radio-frequency"].includes(kind) || hasRegisteredOverlayReadout(kind);
}

/** Text controls exist only while their ordinary game action's interface is mounted. */
export function simpleOverlayPresentation(state: GameState, overlay: Overlay): string {
  switch (overlay.kind) {
    case "radio-frequency":
      return `OMNITUNE\nField Radio Array\nManual Receiver\nSignal Locked\n${formatRadioFrequency(getCurrentRadioFrequency(state))}\nRange: ${RADIO_FREQUENCY_MIN}–${RADIO_FREQUENCY_MAX} MHz; step: 0.005 MHz.\nUse tune <MHz>, ${RADIO_FINE_TUNE_CONTROLS.map(control => control.label).join(", ")}, or close.`;
    case "cooler":
      return `OMNICOOL\nTHERMAL REGULATION UNIT\n${overlay.mode.toUpperCase()}\nTEMP ${coolerModeTemperature(overlay.mode)}°F\nUse off, cool, cold, or freeze to select a mode; close to continue exploring.`;
    case "spin-stage-speed-password":
      return `Instructor Override\nSPEED TARGET: ${overlay.targetSpeed}\nPASSWORD REQUIRED\nUse submit <password> to submit the password, or cancel (close) to continue exploring.`;
    case "bar-jukebox":
      return "Loosened Tongue Jukebox\nSELECT A TRACK NUMBER FROM THE LIST BELOW\nINDEX PLATE DAMAGED\nCATALOG UNREADABLE\nUse play <code> to enter up to four letters or digits and Play Selected Track. Use play to submit empty fields, or close to continue exploring.";
    default:
      return `${registeredOverlayReadout(overlay.kind, state) ?? ""}\nUse close to continue exploring.`;
  }
}

export function closeHeadlessOverlay(state: GameState, overlay: Overlay) {
  useUIOverlayStore.getState().closeOverlay();
  let next = state;
  const text: string[] = [];
  if (overlay.kind !== "none") {
    if (overlay.postCloseMessage) {
      next = appendLog(next, overlay.postCloseMessage);
      text.push(overlay.postCloseMessage);
    }
    next = enqueueNotifications(next, overlay.postCloseNotifications ?? []);
    text.push(...(overlay.postCloseNotifications ?? []).map(notification => notification.text));
  }
  return { state: reconcileObjectives(state, next), text };
}

export async function simpleOverlayCommand(state: GameState, overlay: Overlay, input: string) {
  const text = [`> ${input}`];
  let next = state;
  let request: ActionRequest | undefined;
  if (/^(?:close|cancel)$/i.test(input)) {
    const closed = closeHeadlessOverlay(state, overlay);
    return { state: closed.state, text: [...text, "You close the interface.", ...closed.text] };
  }
  if (overlay.kind === "radio-frequency") {
    const tune = /^tune ([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?: MHz)?$/i.exec(input);
    const adjustment = RADIO_FINE_TUNE_CONTROLS.find(control => control.label === input);
    const frequency = tune ? Number(tune[1]) : adjustment ? getCurrentRadioFrequency(state) + adjustment.delta : undefined;
    if (frequency !== undefined && Number.isFinite(frequency)) {
      const next = reconcileObjectives(state, setRadioFrequency(state, frequency));
      return { state: next, text: [...text, simpleOverlayPresentation(next, overlay)] };
    }
  } else if (overlay.kind === "cooler") {
    const mode = COOLER_MODES.find(mode => mode === input.toLowerCase());
    if (mode) request = { verb: "setCoolerMode", payload: { mode } };
  } else if (overlay.kind === "spin-stage-speed-password") {
    const submitted = /^submit(?: (.*))?$/i.exec(input);
    if (submitted) request = { verb: "submitSpinStageSpeedPassword", payload: { password: submitted[1] ?? "", speed: overlay.targetSpeed } };
  } else if (overlay.kind === "bar-jukebox") {
    // Values representable by four single-character alphanumeric fields,
    // including incomplete/empty submissions. Never enumerate the catalog.
    const submitted = /^play(?: ([a-z0-9]{0,4}))?$/i.exec(input);
    if (submitted) request = { verb: "playJukeboxTrack", payload: { trackId: (submitted[1] ?? "").toUpperCase() } };
  }
  if (!request) return { state, text: [...text, simpleOverlayPresentation(state, overlay)] };

  // OverlayHost closes these forms before dispatch, including failed submissions.
  if (overlay.kind !== "cooler") {
    const closed = closeHeadlessOverlay(next, overlay);
    next = closed.state;
    text.push(...closed.text);
  }
  const before = next;
  const result = await dispatchAction(next, request);
  next = result.message ? appendLog(result.state, result.message) : result.state;
  next = reconcileObjectives(before, next, { fromRoomId: before.player.roomId, toRoomId: next.player.roomId });
  if (result.message) text.push(result.message);
  if (result.overlay) useUIOverlayStore.getState().openOverlay(result.overlay);
  const mounted = useUIOverlayStore.getState().overlay;
  if (supportsSimpleOverlay(mounted.kind)) text.push(simpleOverlayPresentation(next, mounted));
  return { state: next, text };
}
