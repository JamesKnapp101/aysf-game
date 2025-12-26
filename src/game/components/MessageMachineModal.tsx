import React, { useEffect, useMemo, useState } from "react";
import type { PhoneMessage } from "../../world/maps/livingQuartersTemplate";
import "../../styles/components/message-machine.css";

type MessageMachineModalProps = {
  messages: PhoneMessage[] | "off";
  messagesPlayedById: Record<string, boolean | undefined>;
  onMarkPlayed: (messageId: string) => void;
  onClose: () => void;
};

export function MessageMachineModal({
  messages,
  messagesPlayedById,
  onMarkPlayed,
  onClose,
}: MessageMachineModalProps) {
  const safeMessages: PhoneMessage[] = Array.isArray(messages) ? messages : [];

  // UX toggle:
  // true  => first play shows "3" and plays last array item first (3 → 2 → 1)
  // false => first play shows "1" and plays first array item first (1 → 2 → 3)
  const playNewestFirst = false;

  const unlistenedCount = useMemo(() => {
    return safeMessages.reduce(
      (acc, m) => acc + (messagesPlayedById[m.id] ? 0 : 1),
      0
    );
  }, [safeMessages, messagesPlayedById]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeMessage = useMemo(() => {
    if (activeIndex == null) return null;
    return safeMessages[activeIndex] ?? null;
  }, [activeIndex, safeMessages]);

  // Display number rules:
  // - before play: show unlistened count
  // - after play: show "message index" in the direction we're playing
  const displayNumber = useMemo(() => {
    if (activeIndex == null) return unlistenedCount;
    if (safeMessages.length === 0) return 0;

    // If playing newest-first, last item is "3", then "2", then "1"
    return playNewestFirst
      ? activeIndex + 1 // index 2 => 3
      : activeIndex + 1; // (same numeric label; flip if you want "remaining" style)
  }, [activeIndex, unlistenedCount, safeMessages.length, playNewestFirst]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function isPlayed(idx: number) {
    const m = safeMessages[idx];
    return !!(m && messagesPlayedById[m.id]);
  }

  function findFirstUnplayedIndex(): number | null {
    const n = safeMessages.length;
    if (n === 0) return null;

    if (playNewestFirst) {
      for (let i = n - 1; i >= 0; i--) if (!isPlayed(i)) return i;
    } else {
      for (let i = 0; i < n; i++) if (!isPlayed(i)) return i;
    }
    return null;
  }

  function findNextUnplayed(fromIndex: number): number | null {
    const n = safeMessages.length;
    if (n === 0) return null;

    if (playNewestFirst) {
      // go backward, then wrap backward
      for (let i = fromIndex - 1; i >= 0; i--) if (!isPlayed(i)) return i;
      for (let i = n - 1; i > fromIndex; i--) if (!isPlayed(i)) return i;
    } else {
      // go forward, then wrap forward
      for (let i = fromIndex + 1; i < n; i++) if (!isPlayed(i)) return i;
      for (let i = 0; i < fromIndex; i++) if (!isPlayed(i)) return i;
    }

    return null;
  }

  function playNext() {
    const n = safeMessages.length;
    if (n === 0) return;

    let nextIndex: number;

    if (activeIndex == null) {
      nextIndex = findFirstUnplayedIndex() ?? (playNewestFirst ? n - 1 : 0);
    } else {
      const wrapped = playNewestFirst
        ? (activeIndex - 1 + n) % n
        : (activeIndex + 1) % n;

      nextIndex = findNextUnplayed(activeIndex) ?? wrapped;
    }

    setActiveIndex(nextIndex);

    const msg = safeMessages[nextIndex];
    if (msg && !messagesPlayedById[msg.id]) {
      onMarkPlayed(msg.id);
    }
  }

  return (
    <div className="mm-crtOverlay" role="dialog" aria-modal="true">
      <button
        className="mm-crtBackdrop"
        aria-label="Close message machine"
        onClick={onClose}
      />

      <div className="mm-crtWindow">
        <div className="mm-crtScanlines" aria-hidden="true" />

        <header className="mm-header">
          <div className="mm-headerInner">
            <div className="mm-logo" aria-label="Message Maid">
              <span className="mm-logoWord">MESSAGE</span>
              <span className="mm-logoWord">MAID</span>
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
                PLAY MESSAGE
              </button>
              <button className="mm-btn mm-btn-secondary" onClick={onClose}>
                CLOSE
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
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
