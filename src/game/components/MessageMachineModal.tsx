import React, { useCallback, useMemo, useState } from "react";
import "../../styles/components/message-machine.css";
import { CrtModal } from "./CrtModal";

export type PhoneMessage = {
  id: string;
  title?: string;
  transcript: string;
};

type MessageMachineModalProps = {
  messages: PhoneMessage[] | "off";
  messagesPlayedById: Record<string, boolean | undefined>;
  onMarkPlayed: (messageId: string) => void;
  onClose: () => void;

  /**
   * Optional knobs
   */
  playNewestFirst?: boolean;
  autoPlayOnOpen?: boolean;
};

export function MessageMachineModal({
  messages,
  messagesPlayedById,
  onMarkPlayed,
  onClose,
  playNewestFirst = false,
  autoPlayOnOpen = false,
}: MessageMachineModalProps) {
  const safeMessages = useMemo<PhoneMessage[]>(
    () => (Array.isArray(messages) ? messages : []),
    [messages],
  );

  const unlistenedCount = useMemo(() => {
    return safeMessages.reduce(
      (acc, m) => acc + (messagesPlayedById[m.id] ? 0 : 1),
      0,
    );
  }, [safeMessages, messagesPlayedById]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeMessage = useMemo(() => {
    if (activeIndex == null) return null;
    return safeMessages[activeIndex] ?? null;
  }, [activeIndex, safeMessages]);

  const isPlayed = useCallback(
    (idx: number) => {
      const m = safeMessages[idx];
      return !!(m && messagesPlayedById[m.id]);
    },
    [safeMessages, messagesPlayedById],
  );

  const findFirstUnplayedIndex = useCallback((): number | null => {
    const n = safeMessages.length;
    if (n === 0) return null;

    if (playNewestFirst) {
      for (let i = n - 1; i >= 0; i--) if (!isPlayed(i)) return i;
    } else {
      for (let i = 0; i < n; i++) if (!isPlayed(i)) return i;
    }
    return null;
  }, [safeMessages.length, playNewestFirst, isPlayed]);

  const findNextUnplayed = useCallback(
    (fromIndex: number): number | null => {
      const n = safeMessages.length;
      if (n === 0) return null;

      if (playNewestFirst) {
        for (let i = fromIndex - 1; i >= 0; i--) if (!isPlayed(i)) return i;
        for (let i = n - 1; i > fromIndex; i--) if (!isPlayed(i)) return i;
      } else {
        for (let i = fromIndex + 1; i < n; i++) if (!isPlayed(i)) return i;
        for (let i = 0; i < fromIndex; i++) if (!isPlayed(i)) return i;
      }
      return null;
    },
    [safeMessages.length, playNewestFirst, isPlayed],
  );

  const playAtIndex = useCallback(
    (nextIndex: number) => {
      setActiveIndex(nextIndex);
      const msg = safeMessages[nextIndex];
      if (msg && !messagesPlayedById[msg.id]) onMarkPlayed(msg.id);
    },
    [safeMessages, messagesPlayedById, onMarkPlayed],
  );

  const playNext = useCallback(() => {
    const n = safeMessages.length;
    if (n === 0) return;

    if (activeIndex == null) {
      const first = findFirstUnplayedIndex() ?? (playNewestFirst ? n - 1 : 0);
      playAtIndex(first);
      return;
    }

    const wrapped = playNewestFirst
      ? (activeIndex - 1 + n) % n
      : (activeIndex + 1) % n;

    const next = findNextUnplayed(activeIndex) ?? wrapped;
    playAtIndex(next);
  }, [
    safeMessages.length,
    activeIndex,
    findFirstUnplayedIndex,
    findNextUnplayed,
    playNewestFirst,
    playAtIndex,
  ]);

  React.useEffect(() => {
    if (!autoPlayOnOpen) return;
    if (activeIndex != null) return;
    if (safeMessages.length === 0) return;
    const first = findFirstUnplayedIndex();
    if (first != null) playAtIndex(first);
  }, [
    activeIndex,
    autoPlayOnOpen,
    findFirstUnplayedIndex,
    playAtIndex,
    safeMessages.length,
  ]);

  const displayNumber = useMemo(() => {
    if (activeIndex == null) return unlistenedCount;
    if (safeMessages.length === 0) return 0;
    return activeIndex + 1;
  }, [activeIndex, unlistenedCount, safeMessages.length]);

  const activeMessageOrdinal =
    activeIndex == null
      ? "--"
      : `${String(activeIndex + 1).padStart(2, "0")}/${String(
          safeMessages.length,
        ).padStart(2, "0")}`;
  const machineStatus =
    safeMessages.length === 0
      ? "No Messages"
      : activeMessage
        ? "Playing"
        : "Standby";
  const titleText =
    activeMessage?.title?.trim() ||
    (safeMessages.length === 0 ? "Inbox Empty" : "Awaiting Playback");
  const transcriptText =
    activeMessage?.transcript ??
    (safeMessages.length === 0
      ? "No stored messages."
      : "Message archive ready.");

  return (
    <CrtModal
      title="MESSAGE BUTLER"
      onClose={onClose}
      width={980}
      height={540}
      showHeader={false}
    >
      <div
        className={[
          "mm-crtWindow",
          "crt-modal-fill",
          activeMessage ? "is-playing" : "is-standby",
        ].join(" ")}
      >
        <header className="mm-header">
          <div className="mm-headerInner">
            <div className="mm-logoText" aria-label="OmniConnect">
              <span className="mm-logoName">OMNICONNECT</span>
              <span className="mm-logoTag">PRO</span>
            </div>

            <div className="mm-appCluster">
              <span className="mm-appName">MESSAGE BUTLER</span>
              <span className="mm-statusPill">{machineStatus}</span>
            </div>

            <div className="mm-headerRight">
              <div className="mm-iconWrap">
                <DefaultPhoneIcon />
              </div>
            </div>
          </div>
        </header>

        <div className="mm-body">
          <section className="mm-main">
            <div className="mm-titleBar">
              <span className="mm-titleKicker">{activeMessageOrdinal}</span>
              <span className="mm-titleText">{titleText}</span>
            </div>
            <div className="mm-transcript" aria-live="polite">
              <div className="mm-transcriptText">{transcriptText}</div>
            </div>
          </section>

          <aside className="mm-side">
            <div className="mm-countBox">
              <div className="mm-countLabel">
                {activeIndex == null ? "New" : "Msg"}
              </div>
              <div className="mm-count">{displayNumber}</div>
            </div>

            <div className="mm-signalPanel" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="mm-actions">
              <button
                className="mm-btn"
                onClick={playNext}
                disabled={safeMessages.length === 0}
              >
                <PlayIcon />
                <span>PLAY</span>
              </button>

              <button className="mm-btn mm-btnSecondary" onClick={onClose}>
                <CloseIcon />
                <span>CLOSE</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </CrtModal>
  );
}

function DefaultPhoneIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      className="mm-phoneSvg"
      aria-hidden="true"
    >
      <rect x="20" y="8" width="24" height="42" rx="3" />
      <path d="M25 14h14" />
      <path d="M25 38h14" />
      <path d="M29 45h6" />
      <path d="M14 18v28c0 5 4 9 9 9h18c5 0 9-4 9-9V18" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="mm-btnIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="mm-btnIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
