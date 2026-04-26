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

  return (
    <CrtModal
      title="MESSAGE BUTLER"
      onClose={onClose}
      width={980}
      height={540}
      showHeader={false}
    >
      <div className="mm-crtWindow crt-modal-fill">
        <header className="mm-header">
          <div className="mm-headerInner">
            <div className="mm-logoText" aria-label="OmniConnect">
              <span className="mm-logoName">OMNICONNECT</span>
              <span className="mm-logoTag">PRO</span>
              <span className="mm-appName">MESSAGE BUTLER</span>
            </div>

            <div className="mm-headerRight" aria-hidden="true">
              <div className="mm-iconWrap">
                <DefaultPhoneIcon />
              </div>
            </div>
          </div>
        </header>

        <div className="mm-body">
          <section className="mm-main">
            <div className="mm-titleBar">
              {activeMessage?.title?.trim() ?? ""}
            </div>
            <div className="mm-transcript">
              {activeMessage?.transcript ?? ""}
            </div>
          </section>

          <aside className="mm-side">
            <div className="mm-countBox">
              <div className="mm-count">{displayNumber}</div>
            </div>

            <div className="mm-actions">
              <button
                className="mm-btn"
                onClick={playNext}
                disabled={safeMessages.length === 0}
              >
                PLAY
              </button>

              <button className="mm-btn mm-btnSecondary" onClick={onClose}>
                CLOSE
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
    <svg width="48" height="48" viewBox="0 0 64 64" className="mm-phoneSvg">
      <path d="M22 10h20v36H22z" />
      <path d="M26 14h12" />
      <path d="M26 42h12" />
      <path d="M28 50h8" />
      <path d="M18 10h-2c-2 0-4 2-4 4v36c0 2 2 4 4 4h32c2 0 4-2 4-4V14c0-2-2-4-4-4h-2" />
    </svg>
  );
}
