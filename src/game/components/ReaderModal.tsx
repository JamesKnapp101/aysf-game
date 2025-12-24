import React, { useCallback, useEffect, useRef } from "react";
import { CrtModal } from "./CrtModal";
import "../../styles/reader-modal.css";

type ReaderModalProps = {
  title: string;
  body: string;
  onClose: () => void;
};

export function ReaderModal({ title, body, onClose }: ReaderModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Start at top whenever opened
    scrollRef.current?.scrollTo({ top: 0 });
    // Put focus on the scroll area so arrow keys work immediately
    scrollRef.current?.focus();
  }, [title, body]);

  const onScrollKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;

      const line = 28; // px per arrow press (tune to taste)
      const page = Math.max(120, Math.floor(el.clientHeight * 0.85));

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          el.scrollBy({ top: line, behavior: "auto" });
          break;

        case "ArrowUp":
          e.preventDefault();
          el.scrollBy({ top: -line, behavior: "auto" });
          break;

        case "PageDown":
        case " ":
          // spacebar = page down (classic terminal/reader vibe)
          e.preventDefault();
          el.scrollBy({ top: page, behavior: "auto" });
          break;

        case "PageUp":
          e.preventDefault();
          el.scrollBy({ top: -page, behavior: "auto" });
          break;

        case "Home":
          e.preventDefault();
          el.scrollTo({ top: 0, behavior: "auto" });
          break;

        case "End":
          e.preventDefault();
          el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
          break;

        case "Escape":
          // CrtModal also listens, but this keeps it working even if that changes
          e.preventDefault();
          onClose();
          break;

        default:
          break;
      }
    },
    [onClose]
  );

  return (
    <CrtModal title={title} onClose={onClose}>
      <div
        className="reader-scroll"
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={onScrollKeyDown}
      >
        <pre className="reader-text">{body}</pre>
      </div>

      <div className="reader-footer">
        <span className="reader-hint">
          ↑/↓ scroll • PgUp/PgDn • ESC to close
        </span>
      </div>
    </CrtModal>
  );
}
