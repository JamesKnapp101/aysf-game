import React, { useEffect, useRef } from "react";
import "../../styles/crt-modal.css";

type CrtModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  height?: number;
};

export function CrtModal({
  title,
  onClose,
  children,
  width = 720,
  height = 520,
}: CrtModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Optional: lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="crt-modal-backdrop" onMouseDown={onClose}>
      <div
        className="crt-modal"
        style={{ width, height }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="crt-modal-header">
          <div className="crt-modal-title">{title}</div>
          <button
            ref={closeBtnRef}
            className="crt-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="crt-modal-body">{children}</div>
      </div>
    </div>
  );
}
