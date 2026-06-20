import {
  appendNpcConversationHistory,
  getNpcConversationHistory,
} from "@game/helpers/conversationHelpers";
import {
  formatConversationAssistantText,
  getConversationAssistantName,
  getConversationMode,
  shouldUseAiConversation,
} from "@game/helpers/conversationModeHelpers";
import { getCharacterProfile } from "@game/npcProfiles";
import { getClaudeResponse } from "@game/services/claudeClient";
import {
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/comet-modal.css";
import type { GameState } from "../types/gameTypes";
import { getCometViewerSettings } from "../helpers/itemSettingsHelpers";
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
import { CometKeyboard } from "./CometKeyboard";
import { isCometKeyboardKey } from "./cometKeyboardHelpers";
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

function AssistantBrandIcon({ isAiMode }: { isAiMode: boolean }) {
  if (isAiMode) {
    return (
      <svg
        className="comet-brandIcon comet-brandIcon--binary"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect className="comet-brandBinaryFrame" x="24" y="18" width="72" height="84" rx="14" />
        <text className="comet-brandBinaryText" x="37" y="40">
          1
        </text>
        <text className="comet-brandBinaryText" x="37" y="60">
          0
        </text>
        <text className="comet-brandBinaryText" x="37" y="80">
          1
        </text>
        <text className="comet-brandBinaryText" x="58" y="40">
          0
        </text>
        <text className="comet-brandBinaryText" x="58" y="60">
          1
        </text>
        <text className="comet-brandBinaryText" x="58" y="80">
          0
        </text>
        <text className="comet-brandBinaryText" x="79" y="40">
          1
        </text>
        <text className="comet-brandBinaryText" x="79" y="60">
          1
        </text>
        <text className="comet-brandBinaryText" x="79" y="80">
          0
        </text>
      </svg>
    );
  }

  return (
    <svg
      className="comet-brandIcon comet-brandIcon--book"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="comet-brandBookPage comet-brandBookPage--left"
        d="M58 38C48 30 36 28 24 33V86C36 81 48 83 58 91V38Z"
      />
      <path
        className="comet-brandBookPage comet-brandBookPage--right"
        d="M62 38C72 30 84 28 96 33V86C84 81 72 83 62 91V38Z"
      />
      <path className="comet-brandBookSpine" d="M60 39V92" />
      <path className="comet-brandBookLine" d="M34 45C41 44 47 46 53 50" />
      <path className="comet-brandBookLine" d="M34 58C41 57 47 59 53 63" />
      <path className="comet-brandBookLine" d="M86 45C79 44 73 46 67 50" />
      <path className="comet-brandBookLine" d="M86 58C79 57 73 59 67 63" />
    </svg>
  );
}

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

function CometBrand({
  assistantName,
  hasLink,
  isAiMode,
  isOn,
}: {
  assistantName: string;
  hasLink: boolean;
  isAiMode: boolean;
  isOn: boolean;
}) {
  const assistantLabel = assistantName.toUpperCase();

  return (
    <div className="comet-top">
      <div className="comet-brand">
        <div className="comet-brandMark" aria-hidden="true">
          <AssistantBrandIcon isAiMode={isAiMode} />
        </div>

        <div className="comet-logoArea">
          <div className="comet-logoLine1">
            <div className="comet-logoText">{assistantLabel}</div>
            <div className="comet-logoTag">
              {isAiMode ? "YOUR AI PAL" : "YOUR LIBRARY PAL"}
            </div>
          </div>
          <div className="comet-logoStrap">
            Have Questions? {assistantName} has Answers! (results may vary)
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

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input || input.disabled) return;
    input.focus();
  }, [inputRef]);

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
    Boolean(getCometViewerSettings(state, "Comet")?.isOn);
  const hasLink =
    forceLink ||
    Boolean(state.worldState.powerRestoredSections["library-power"]);
  const conversationMode = getConversationMode(state);
  const assistantName = getConversationAssistantName(state);
  const assistantLabel = assistantName.toUpperCase();
  const isAiMode = shouldUseAiConversation(state);
  const canChat = isOn && hasLink && Boolean(loadedEntries) && !isSubmitting;

  const displayConversationHistory = useMemo(
    () =>
      conversationHistory.map((entry) => ({
        ...entry,
        response: formatConversationAssistantText(
          entry.response,
          conversationMode,
        ),
      })),
    [conversationHistory, conversationMode],
  );
  const historyMessages = useMemo(
    () =>
      historyToDisplayMessages(displayConversationHistory, { assistantLabel }),
    [assistantLabel, displayConversationHistory],
  );

  useEffect(() => {
    if (!canChat || !isFocusOwner) return;

    const frameId = window.requestAnimationFrame(() => {
      focusInput();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [canChat, focusInput, isFocusOwner]);

  const readerMessages = useMemo(() => {
    if (!isOn) {
      return buildCometStatusMessages(
        formatConversationAssistantText("Comet is offline.", conversationMode),
      );
    }
    if (!hasLink) {
      return buildCometStatusMessages(
        formatConversationAssistantText(
          "No link. Comet cannot reach the Central Library.",
          conversationMode,
        ),
        "status",
        "LINK",
      );
    }
    if (!loadedEntries) {
      return buildCometStatusMessages(
        formatConversationAssistantText(
          "Link established. Comet is indexing the Central Library...",
          conversationMode,
        ),
        "status",
        "INDEX",
      );
    }

    const messages =
      pendingMessages.length > 0
        ? [...historyMessages, ...pendingMessages]
        : historyMessages;

    return messages.length > 0
      ? messages
      : getCometWelcomeMessages({ assistantLabel, assistantName });
  }, [
    assistantLabel,
    assistantName,
    conversationMode,
    hasLink,
    historyMessages,
    isOn,
    loadedEntries,
    pendingMessages,
  ]);

  useEffect(() => {
    const node = readerTextRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
    if (isFocusOwner) {
      focusInput();
    }
  }, [focusInput, isFocusOwner, readerMessages]);

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
      const response = formatConversationAssistantText(
        getCometWordLimitText(),
        conversationMode,
      );
      persistTurn({ type: "tell", topic: trimmed }, response);
      return;
    }

    const intent = classifyCometIntent(trimmed);
    const effectiveIntent = !isAiMode && intent === "tell" ? "ask" : intent;
    const inputType = effectiveIntent === "ask" ? "ask" : "tell";

    const promptContext = buildCometPromptContext(state, entryList, trimmed);
    const staticFallback = getCometStaticFallbackResponse(
      effectiveIntent,
      promptContext.fallbackResponse,
    );

    if (!isAiMode) {
      const response = normalizeCometResponseText(
        formatConversationAssistantText(staticFallback, conversationMode),
      );
      persistTurn({ type: inputType, topic: trimmed }, response);
      return;
    }

    const profile = getCharacterProfile(COMET_CHARACTER_PROFILE_ID);
    if (!profile) {
      const response = "Comet's personality core is unavailable.";
      persistTurn({ type: inputType, topic: trimmed }, response);
      return;
    }

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
        assistantLabel,
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
      <CometBrand
        assistantName={assistantName}
        hasLink={hasLink}
        isAiMode={isAiMode}
        isOn={isOn}
      />

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
                  ? `${assistantName} is responding...`
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
