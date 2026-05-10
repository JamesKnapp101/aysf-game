import { useEffect, useRef, useState } from "react";
import "../../styles/components/password-prompt-modal.css";
import { CrtModal } from "./CrtModal";

type PasswordPromptModalProps = {
  onClose: () => void;
  onSubmit: (password: string) => void;
  targetSpeed: number;
};

export function PasswordPromptModal({
  onClose,
  onSubmit,
  targetSpeed,
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <CrtModal title="Instructor Override" onClose={onClose} width={460}>
      <form
        className="password-prompt"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(password);
        }}
      >
        <div className="password-prompt-screen">
          <div className="password-prompt-line">SPEED TARGET: {targetSpeed}</div>
          <div className="password-prompt-line">PASSWORD REQUIRED</div>
        </div>

        <label className="password-prompt-label" htmlFor="spin-stage-password">
          Password
        </label>
        <input
          id="spin-stage-password"
          ref={inputRef}
          className="password-prompt-input"
          value={password}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="password-prompt-actions">
          <button
            type="button"
            className="password-prompt-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="password-prompt-button">
            Submit
          </button>
        </div>
      </form>
    </CrtModal>
  );
}
