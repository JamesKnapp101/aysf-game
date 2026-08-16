import { CrtModal } from "@game/components/CrtModal";
import React from "react";
import "../../styles/components/splash-modal.css";

type SplashModalProps = {
  continueDisabled?: boolean;
  continueLabel?: string;
  isOpen: boolean;
  onContinue: () => void;
  text?: React.ReactNode;
  title?: string;
};

const DEFAULT_SPLASH: React.ReactNode = (
  <>
    <div style={{ marginBottom: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      WHO WOKE ME
    </div>
    <div style={{ lineHeight: 1.4 }}>
      <br />
      <br />
      Type commands to act. Try simple verbs. Explore. Pay attention.
      <br />
      <br />
      (Press <b>Continue</b> to begin.)
    </div>
  </>
);

export const SplashModal: React.FC<SplashModalProps> = ({
  continueDisabled = false,
  continueLabel = "Continue",
  isOpen,
  onContinue,
  text,
  title = "SYSTEM BOOT",
}) => {
  if (!isOpen) return null;

  return (
    <div className="splash-screen" role="presentation">
      <CrtModal title={title} onClose={onContinue} showHeader={false}>
        <div className="splash-modal-body">{text ?? DEFAULT_SPLASH}</div>
        <div className="splash-modal-actions">
          <button
            className="crt-button"
            onClick={onContinue}
            autoFocus
            disabled={continueDisabled}
          >
            {continueLabel}
          </button>
        </div>
      </CrtModal>
    </div>
  );
};
