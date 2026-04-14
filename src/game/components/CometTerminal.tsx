import {
  appendNpcConversationHistory,
  getNpcConversationHistory,
} from "@game/helpers/conversationHelpers";
import { getCharacterProfile } from "@game/npcProfiles";
import { getClaudeResponse } from "@game/services/claudeClient";
import {
  type MouseEvent,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/comet-modal.css";
import type { GameState } from "../types/gameTypes";
import type { CometEntry } from "./comet-index";
import {
  buildCometPendingMessages,
  buildCometStatusMessages,
  type CometDisplayMessage,
  getCometEditReminderText,
  getCometEditSubmittedText,
  getCometWelcomeMessages,
  getCometWordLimitText,
  historyToDisplayMessages,
  normalizeCometResponseText,
} from "./cometDisplayHelpers";
import {
  classifyCometIntent,
  COMET_CHARACTER_PROFILE_ID,
  COMET_CONVERSATION_ID,
  COMET_HISTORY_LIMIT,
  COMET_MAX_INPUT_CHARS,
  COMET_MAX_INPUT_WORDS,
  type CometIntent,
  countCometWords,
} from "./cometHelpers";
import { CometKeyboard, isCometKeyboardKey } from "./CometKeyboard";
import { buildCometPromptContext } from "./cometPromptHelpers";

type CometStateSetter = (updater: (prev: GameState) => GameState) => void;

type CometTerminalProps = {
  state: GameState;
  setGameState: CometStateSetter;
  entries?: CometEntry[];
  forceLink?: boolean;
  forceOnline?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  isFocusOwner?: boolean;
  onPromptFocus?: () => void;
  variant?: "modal" | "sidebar";
};

function getCometStaticFallbackResponse(
  intent: CometIntent,
  libraryFallback: string,
): string {
  if (intent === "edit_request") {
    return getCometEditSubmittedText();
  }

  if (intent === "tell") {
    return getCometEditReminderText();
  }

  return libraryFallback;
}

function CometBrand({ hasLink, isOn }: { hasLink: boolean; isOn: boolean }) {
  return (
    <div className="comet-top">
      <div className="comet-brand">
        <div className="comet-brandMark" aria-hidden="true">
          <svg
            className="comet-brandIcon"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              className="comet-brandOrbit"
              cx="72"
              cy="58"
              rx="45"
              ry="20"
              transform="rotate(-24 72 58)"
            />
            <circle className="comet-brandStar" cx="77" cy="61" r="18" />
            <path
              className="comet-brandTailGlow"
              d="M28 40C39 45 50 44 61 37C55 46 47 53 34 56"
            />
            <path className="comet-brandTail" d="M30 42C40 45 50 44 59 38" />
            <path
              className="comet-brandTail comet-brandTail--faint"
              d="M26 35C37 39 49 39 61 34"
            />
            <circle className="comet-brandBody" cx="39" cy="45" r="8" />
          </svg>
        </div>

        <div className="comet-logoArea">
          <div className="comet-logoLine1">
            <div className="comet-logoText">COMET</div>
            <div className="comet-logoTag">YOUR AI PAL</div>
          </div>
          <div className="comet-logoStrap">
            Have Questions? Comet has Answers! (results may vary)
          </div>
        </div>
      </div>

      <div className="comet-indicators">
        <div className="comet-indicatorStack">
          <div className={`comet-light ${isOn ? "is-on" : ""}`} />
          <div className="comet-lightLabel">PWR</div>
        </div>
        <div className="comet-indicatorStack">
          <div className={`comet-light ${hasLink ? "is-on" : ""}`} />
          <div className="comet-lightLabel">LINK</div>
        </div>
      </div>
    </div>
  );
}

export function CometTerminal({
  state,
  setGameState,
  entries,
  forceLink = false,
  forceOnline = false,
  inputRef: externalInputRef,
  isFocusOwner = false,
  onPromptFocus = () => undefined,
  variant = "modal",
}: CometTerminalProps) {
  const cometTextSize = state.uiState.cometTextSize ?? "smaller";
  const [query, setQuery] = useState("");
  const [loadedEntries, setLoadedEntries] = useState<CometEntry[] | null>(
    entries ?? null,
  );
  const [pendingMessages, setPendingMessages] = useState<CometDisplayMessage[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const readerTextRef = useRef<HTMLDivElement | null>(null);
  const inputId = useId();
  const inputRef = externalInputRef ?? internalInputRef;
  const conversationHistory = getNpcConversationHistory(
    state,
    COMET_CONVERSATION_ID,
  );

  function focusInput() {
    const input = inputRef.current;
    if (!input || input.disabled) return;
    input.focus();
  }

  useEffect(() => {
    if (entries) {
      setLoadedEntries(entries);
      return;
    }

    let cancelled = false;

    import("./comet-indexed-entries").then((mod) => {
      if (cancelled) return;
      setLoadedEntries(mod.DEFAULT_COMET_INDEXED_ENTRIES);
    });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const entryList = useMemo(() => loadedEntries ?? [], [loadedEntries]);
  const historyMessages = useMemo(
    () => historyToDisplayMessages(conversationHistory),
    [conversationHistory],
  );

  const [flashKey, setFlashKey] = useState<string | null>(null);
  useEffect(() => {
    if (!isFocusOwner) {
      setFlashKey(null);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key?.toLowerCase();
      if (!k) return;
      if (!isCometKeyboardKey(k)) return;

      setFlashKey(k);
      window.setTimeout(() => {
        setFlashKey((cur) => (cur === k ? null : cur));
      }, 120);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFocusOwner]);

  const isOn =
    forceOnline ||
    Boolean((state.itemState.itemSettings["Comet"] as any)?.isOn);
  const hasLink =
    forceLink ||
    Boolean(state.worldState.powerRestoredSections["library-power"]);
  const canChat = isOn && hasLink && Boolean(loadedEntries) && !isSubmitting;

  useEffect(() => {
    if (!canChat || !isFocusOwner) return;

    const frameId = window.requestAnimationFrame(() => {
      focusInput();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [canChat, isFocusOwner]);

  const readerMessages = useMemo(() => {
    if (!isOn) {
      return buildCometStatusMessages("Comet is offline.");
    }
    if (!hasLink) {
      return buildCometStatusMessages(
        "No link. Comet cannot reach the Central Library.",
        "status",
        "LINK",
      );
    }
    if (!loadedEntries) {
      return buildCometStatusMessages(
        "Link established. Comet is indexing the Central Library...",
        "status",
        "INDEX",
      );
    }

    const messages =
      pendingMessages.length > 0
        ? [...historyMessages, ...pendingMessages]
        : historyMessages;

    return messages.length > 0 ? messages : getCometWelcomeMessages();
  }, [hasLink, historyMessages, isOn, loadedEntries, pendingMessages]);

  useEffect(() => {
    const node = readerTextRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
    if (isFocusOwner) {
      focusInput();
    }
  }, [isFocusOwner, readerMessages]);

  function persistTurn(
    input: { type: "ask" | "tell"; topic: string },
    response: string,
  ) {
    setGameState((prev) =>
      appendNpcConversationHistory(prev, COMET_CONVERSATION_ID, {
        turn: prev.moves,
        type: input.type,
        topic: input.topic,
        response,
      }),
    );
  }

  function handleShellInteraction(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();

    const target = event.target as HTMLElement | null;
    if (target?.closest("input, button, textarea, a, select, label")) {
      return;
    }

    onPromptFocus();
    focusInput();
  }

  async function submitMessage(rawInput: string) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    if (!isOn || !hasLink || !loadedEntries) {
      return;
    }

    if (
      trimmed.length > COMET_MAX_INPUT_CHARS ||
      countCometWords(trimmed) > COMET_MAX_INPUT_WORDS
    ) {
      const response = getCometWordLimitText();
      persistTurn({ type: "tell", topic: trimmed }, response);
      return;
    }

    const intent = classifyCometIntent(trimmed);
    const inputType = intent === "ask" ? "ask" : "tell";

    const profile = getCharacterProfile(COMET_CHARACTER_PROFILE_ID);
    if (!profile) {
      const response = "Comet's personality core is unavailable.";
      persistTurn({ type: inputType, topic: trimmed }, response);
      return;
    }

    const promptContext = buildCometPromptContext(state, entryList, trimmed);
    const staticFallback = getCometStaticFallbackResponse(
      intent,
      promptContext.fallbackResponse,
    );
    const history = conversationHistory.slice(-COMET_HISTORY_LIMIT);
    const pendingText =
      promptContext.mode === "guess"
        ? "Comet is preparing a best-guess response..."
        : "Comet is consulting the index...";

    setPendingMessages(
      buildCometPendingMessages(trimmed, {
        analysisBlock:
          promptContext.mode === "guess"
            ? promptContext.analysisBlock
            : undefined,
        idBase: `pending-${Date.now()}`,
        pendingText,
      }),
    );
    setIsSubmitting(true);

    try {
      const claudeResponse = await getClaudeResponse(
        COMET_CONVERSATION_ID,
        profile,
        history,
        { type: inputType, topic: trimmed },
        undefined,
        promptContext.assistantContext,
      );

      const response = normalizeCometResponseText(
        claudeResponse?.trim() || staticFallback,
      );
      persistTurn({ type: inputType, topic: trimmed }, response);
    } catch (error) {
      console.warn("Comet integration error, using fallback:", error);
      const response = normalizeCometResponseText(staticFallback);
      persistTurn({ type: inputType, topic: trimmed }, response);
    } finally {
      setPendingMessages([]);
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`comet comet--${variant} comet--text-${cometTextSize}`}
      onClick={handleShellInteraction}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <CometBrand hasLink={hasLink} isOn={isOn} />

      <div className="comet-reader" aria-live="polite">
        <div ref={readerTextRef} className="comet-readerText">
          <div className="comet-thread">
            {readerMessages.map((message) => (
              <div
                key={message.id}
                className={`comet-messageRow comet-messageRow--${message.role}`}
              >
                <article
                  className={
                    `comet-message comet-message--${message.role} ` +
                    `comet-message--${message.tone}`
                  }
                >
                  <div className="comet-messageLabel">{message.label}</div>
                  <div className="comet-messageBody">{message.text}</div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form
        className="comet-searchRow"
        onClick={handleShellInteraction}
        onSubmit={(e) => {
          e.preventDefault();
          const nextQuery = query;
          setQuery("");
          void submitMessage(nextQuery);
        }}
      >
        <label className="comet-searchLabel" htmlFor={inputId}>
          CHAT
        </label>
        <input
          id={inputId}
          ref={inputRef}
          className="comet-searchInput"
          value={query}
          autoComplete="off"
          spellCheck={false}
          maxLength={COMET_MAX_INPUT_CHARS}
          onChange={(e) => setQuery(e.target.value)}
          onClick={handleShellInteraction}
          onFocus={onPromptFocus}
          placeholder={
            isOn
              ? hasLink
                ? isSubmitting
                  ? "Comet is responding..."
                  : "I can not be held legally responsible for injury or death \u2665"
                : "LINK unavailable"
              : "Power off"
          }
          disabled={!canChat}
        />
      </form>

      <CometKeyboard flashKey={flashKey} />
    </div>
  );
}
