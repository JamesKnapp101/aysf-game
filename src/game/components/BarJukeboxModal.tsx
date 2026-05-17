import React, { useEffect, useMemo, useRef, useState } from "react";
import { CrtModal } from "./CrtModal";
import "../../styles/bar-jukebox-modal.css";

type BarJukeboxModalProps = {
  onClose: () => void;
  onPlayTrack: (trackId: string) => void;
};

const CODE_LENGTH = 4;

export function BarJukeboxModal({
  onClose,
  onPlayTrack,
}: BarJukeboxModalProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const trackId = useMemo(() => digits.join("").toUpperCase(), [digits]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, value: string) => {
    const nextValue = value.replace(/[^a-z0-9]/gi, "").slice(-1).toUpperCase();
    setDigits((prev) =>
      prev.map((digit, digitIndex) =>
        digitIndex === index ? nextValue : digit,
      ),
    );

    if (nextValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onPlayTrack(trackId);
    }
  };

  return (
    <CrtModal title="Loosened Tongue Jukebox" onClose={onClose} width={980}>
      <div className="bar-jukebox crt-modal-fill crt-modal-fill-flex">
        <div className="bar-jukebox-marquee">
          <div className="bar-jukebox-marqueeText">
            SELECT A TRACK NUMBER FROM THE LIST BELOW
          </div>
        </div>

        <div className="bar-jukebox-list" aria-label="Damaged track list">
          <div className="bar-jukebox-vinyl" aria-hidden="true">
            <div className="bar-jukebox-vinylCenter" />
          </div>
          <div className="bar-jukebox-corruptRows" aria-hidden="true">
            {Array.from({ length: 13 }, (_, index) => (
              <div className="bar-jukebox-corruptRow" key={index}>
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
          <div className="bar-jukebox-error">
            INDEX PLATE DAMAGED
            <br />
            CATALOG UNREADABLE
          </div>
        </div>

        <div className="bar-jukebox-controls">
          <div className="bar-jukebox-code" aria-label="Track code">
            {digits.map((digit, index) => (
              <input
                aria-label={`Track code character ${index + 1}`}
                className="bar-jukebox-codeInput"
                inputMode="text"
                key={index}
                maxLength={1}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onInputKeyDown(event, index)}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
              />
            ))}
          </div>

          <button
            className="bar-jukebox-playButton"
            onClick={() => onPlayTrack(trackId)}
            type="button"
          >
            Play Selected Track
          </button>
        </div>
      </div>
    </CrtModal>
  );
}
