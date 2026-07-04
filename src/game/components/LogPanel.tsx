import type { GameState } from "../types/gameTypes";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type LogPanelProps = {
  inputDisabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onCommand: (input: string) => void;
  onGamePromptFocus?: () => void;
  onLogPanelClick?: () => void;
  state: GameState;
};

function renderLogLine(line: string) {
  const parts: React.ReactNode[] = [];
  const tokens = [
    {
      className: "log-room-name",
      close: "[[/ROOM_NAME]]",
      open: "[[ROOM_NAME]]",
    },
    {
      className: "log-movie-stage",
      close: "[[/MOVIE_STAGE]]",
      open: "[[MOVIE_STAGE]]",
    },
  ];

  let rest = line;
  while (true) {
    const match = tokens
      .map((token) => ({ ...token, start: rest.indexOf(token.open) }))
      .filter((token) => token.start !== -1)
      .sort((a, b) => a.start - b.start)[0];

    if (!match) {
      parts.push(rest);
      break;
    }

    const end = rest.indexOf(match.close, match.start);
    if (end === -1) {
      parts.push(rest);
      break;
    }

    if (match.start > 0) parts.push(rest.slice(0, match.start));

    const markedText = rest.slice(match.start + match.open.length, end);
    parts.push(
      <span className={match.className} key={parts.length}>
        {markedText}
      </span>,
    );

    rest = rest.slice(end + match.close.length);
    if (match.className === "log-movie-stage" && /^\s*$/.test(rest)) {
      rest = "\n";
    }
  }

  return <>{parts}</>;
}

export const LogPanel: React.FC<LogPanelProps> = ({
  state,
  onCommand,
  inputRef,
  inputDisabled = false,
  onGamePromptFocus = () => undefined,
  onLogPanelClick = () => undefined,
}) => {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [historyDraft, setHistoryDraft] = useState("");
  const shouldStickToBottomRef = useRef(true);
  const logRef = useRef<HTMLDivElement | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDisabled) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    setCommandHistory((prev) =>
      prev.length >= 200 ? [...prev.slice(1), trimmed] : [...prev, trimmed],
    );
    setHistoryIndex(null);
    setHistoryDraft("");
    onCommand(trimmed);
    setInput("");
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (commandHistory.length === 0) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();

      if (historyIndex === null) {
        setHistoryDraft(input);
        const nextIndex = commandHistory.length - 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
        return;
      }

      const nextIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
      return;
    }

    if (e.key === "ArrowDown") {
      if (historyIndex === null) return;
      e.preventDefault();

      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(null);
        setInput(historyDraft);
        return;
      }

      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    }
  };

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 32;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el) return;
    if (!shouldStickToBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [state.log]);

  return (
    <div className="game-left">
      <div
        className="game-log-panel"
        onClick={(event) => {
          event.stopPropagation();
          onLogPanelClick();
        }}
      >
        <div className="game-log-inner" ref={logRef}>
          {state.log.map((line, idx) => (
            <p key={idx} className="game-line">
              {renderLogLine(line)}
            </p>
          ))}
        </div>
      </div>

      <form
        className={
          "game-footer" + (inputDisabled ? " game-footer--disabled" : "")
        }
        onSubmit={onSubmit}
      >
        <span className="game-prompt">&gt;</span>
        <input
          ref={inputRef}
          className="game-input"
          disabled={inputDisabled}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          onFocus={onGamePromptFocus}
          autoFocus
        />
      </form>
    </div>
  );
};
