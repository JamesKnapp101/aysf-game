import { dispatchAction } from "../actions/dispatchAction";
import { appendLog } from "../engine/log";
import { enqueueNotifications } from "../rules/notifications";
import type { GameState } from "../types/gameTypes";
import type { Overlay } from "../types/uiTypes";

type MessageMachineOverlay = Extract<Overlay, { kind: "message-machine" }>;
const CONTROLS = "Use play to play the next message, or close to close the message machine and continue exploring.";

/** Mirrors the mounted phone's PLAY/CLOSE controls without exposing message IDs. */
export function createMessageMachineAdapter() {
  let mounted: MessageMachineOverlay | undefined;
  let activeIndex: number | null = null;

  function reset() {
    mounted = undefined;
    activeIndex = null;
  }

  function messages(overlay: MessageMachineOverlay) {
    if (mounted !== overlay) {
      mounted = overlay;
      activeIndex = null;
    }
    // The browser treats missing/disabled message archives as empty.
    return Array.isArray(overlay.messages) ? overlay.messages : [];
  }

  function presentation(state: GameState, overlay: MessageMachineOverlay): string {
    const archive = messages(overlay);
    const unheard = archive.filter(message => !state.itemState.messagesPlayed[message.id]).length;
    return [
      "MESSAGE BUTLER",
      `Stored messages: ${archive.length}; unheard: ${unheard}.`,
      archive.length ? "Message archive ready." : "No stored messages.",
      CONTROLS,
    ].join("\n");
  }

  async function command(state: GameState, overlay: MessageMachineOverlay, input: string) {
    const archive = messages(overlay);
    const normalized = input.toLowerCase();
    const text = [`> ${input}`];
    if (/^close(?: (?:phone|messages|message machine))?$/.test(normalized)) {
      let next = state;
      text.push("You close the message machine.");
      if (overlay.postCloseMessage) {
        next = appendLog(next, overlay.postCloseMessage);
        text.push(overlay.postCloseMessage);
      }
      const notifications = overlay.postCloseNotifications ?? [];
      next = enqueueNotifications(next, notifications);
      text.push(...notifications.map(notification => notification.text));
      reset();
      return { state: next, text, closed: true };
    }
    if (!/^play(?: (?:next|message|messages|next message))?$/.test(normalized)) {
      text.push("The message machine is open.", CONTROLS);
      return { state, text, closed: false };
    }
    if (!archive.length) {
      text.push("No stored messages.", CONTROLS);
      return { state, text, closed: false };
    }

    const isPlayed = (index: number) => Boolean(state.itemState.messagesPlayed[archive[index].id]);
    let nextIndex: number;
    if (activeIndex === null) {
      const firstUnplayed = archive.findIndex((_message, index) => !isPlayed(index));
      nextIndex = firstUnplayed < 0 ? 0 : firstUnplayed;
    } else {
      nextIndex = (activeIndex + 1) % archive.length;
      // Like PLAY in the browser, prefer the next unheard message, then wrap.
      for (let offset = 1; offset < archive.length; offset += 1) {
        const candidate = (activeIndex + offset) % archive.length;
        if (!isPlayed(candidate)) {
          nextIndex = candidate;
          break;
        }
      }
    }
    const message = archive[nextIndex];
    const next = isPlayed(nextIndex) ? state : (await dispatchAction(state, {
      verb: "markMessagePlayed", payload: { messageId: message.id },
    })).state;
    activeIndex = nextIndex;
    text.push(`Message ${nextIndex + 1}/${archive.length}: ${message.title?.trim() || "Message"}`, message.transcript, CONTROLS);
    return { state: next, text, closed: false };
  }

  return { presentation, command, reset };
}
