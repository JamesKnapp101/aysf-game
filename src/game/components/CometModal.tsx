import {
  appendNpcConversationHistory,
  getNpcConversationHistory,
} from "@game/helpers/conversationHelpers";
import { getCharacterProfile } from "@game/npcProfiles";
import { getClaudeResponse } from "@game/services/claudeClient";
import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/comet-modal.css";
import type { GameState } from "../types/gameTypes";
import type { CometEntry } from "./comet-index";
import {
  formatDisplaySegment,
  getCometEditReminderText,
  getCometEditSubmittedText,
  getCometWelcomeText,
  getCometWordLimitText,
  historyToDisplaySegments,
} from "./cometDisplayHelpers";
import {
  classifyCometIntent,
  COMET_CHARACTER_PROFILE_ID,
  COMET_CONVERSATION_ID,
  COMET_HISTORY_LIMIT,
  COMET_MAX_INPUT_CHARS,
  COMET_MAX_INPUT_WORDS,
  countCometWords,
} from "./cometHelpers";
import { CometKeyboard, isCometKeyboardKey } from "./CometKeyboard";
import { buildCometPromptContext } from "./cometPromptHelpers";
import { CrtModal } from "./CrtModal";

type CometModalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
  entries?: CometEntry[];
};

export function CometModal({
  onClose,
  state,
  setGameState,
  entries,
}: CometModalProps) {
  const [query, setQuery] = useState("");
  const [loadedEntries, setLoadedEntries] = useState<CometEntry[] | null>(
    entries ?? null,
  );
  const [displaySegments, setDisplaySegments] = useState<string[]>(() =>
    historyToDisplaySegments(
      getNpcConversationHistory(state, COMET_CONVERSATION_ID),
    ),
  );
  const [pendingDisplay, setPendingDisplay] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const readerTextRef = useRef<HTMLPreElement | null>(null);

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

    import("./comet-entries").then((mod) => {
      if (cancelled) return;
      setLoadedEntries(mod.DEFAULT_COMET_ENTRIES);
    });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const entryList = useMemo(() => loadedEntries ?? [], [loadedEntries]);

  const [flashKey, setFlashKey] = useState<string | null>(null);
  useEffect(() => {
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
  }, []);

  const isOn = Boolean((state.itemState.itemSettings["Comet"] as any)?.isOn);
  const hasLink = Boolean(
    state.worldState.powerRestoredSections["library-power"],
  );
  const canChat = isOn && hasLink && Boolean(loadedEntries) && !isSubmitting;

  useEffect(() => {
    if (!canChat) return;

    const frameId = window.requestAnimationFrame(() => {
      focusInput();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [canChat]);

  useEffect(() => {
    const node = readerTextRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
    focusInput();
  }, [displaySegments, pendingDisplay]);

  const readerText = useMemo(() => {
    if (!isOn) {
      return "Comet is offline.";
    }
    if (!hasLink) {
      return "No link. Comet cannot reach the Central Library.";
    }
    if (!loadedEntries) {
      return "Link established. Comet is indexing the Central Library...";
    }

    const segments = pendingDisplay
      ? [...displaySegments, pendingDisplay]
      : displaySegments;

    return segments.length > 0 ? segments.join("\n\n") : getCometWelcomeText();
  }, [displaySegments, hasLink, isOn, loadedEntries, pendingDisplay]);

  function appendDisplaySegment(segment: string) {
    setDisplaySegments((prev) => [...prev, segment]);
  }

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
      appendDisplaySegment(formatDisplaySegment(trimmed, response));
      persistTurn({ type: "tell", topic: trimmed }, response);
      return;
    }

    const intent = classifyCometIntent(trimmed);

    if (intent === "edit_request") {
      const response = getCometEditSubmittedText();
      appendDisplaySegment(formatDisplaySegment(trimmed, response));
      persistTurn({ type: "tell", topic: trimmed }, response);
      return;
    }

    if (intent === "tell") {
      const response = getCometEditReminderText();
      appendDisplaySegment(formatDisplaySegment(trimmed, response));
      persistTurn({ type: "tell", topic: trimmed }, response);
      return;
    }

    const profile = getCharacterProfile(COMET_CHARACTER_PROFILE_ID);
    if (!profile) {
      const response = "Comet's personality core is unavailable.";
      appendDisplaySegment(formatDisplaySegment(trimmed, response));
      persistTurn({ type: "ask", topic: trimmed }, response);
      return;
    }

    const promptContext = buildCometPromptContext(state, entryList, trimmed);
    const history = getNpcConversationHistory(
      state,
      COMET_CONVERSATION_ID,
    ).slice(-COMET_HISTORY_LIMIT);
    const waitingText =
      promptContext.mode === "guess"
        ? `You: ${trimmed}\n${promptContext.analysisBlock ?? "Comet is analyzing..."}`
        : `You: ${trimmed}\nComet is consulting the index...`;

    setPendingDisplay(waitingText);
    setIsSubmitting(true);

    try {
      const claudeResponse = await getClaudeResponse(
        COMET_CONVERSATION_ID,
        profile,
        history,
        { type: "ask", topic: trimmed },
        undefined,
        promptContext.assistantContext,
      );

      const response = claudeResponse?.trim() || promptContext.fallbackResponse;
      const displayOptions =
        promptContext.mode === "guess"
          ? {
              analysisBlock: promptContext.analysisBlock,
              confidenceLabel: promptContext.confidenceLabel,
              confidenceScore: promptContext.confidenceScore,
            }
          : undefined;

      appendDisplaySegment(
        formatDisplaySegment(trimmed, response, displayOptions),
      );
      persistTurn({ type: "ask", topic: trimmed }, response);
    } catch (error) {
      console.warn("Comet integration error, using fallback:", error);
      const response = promptContext.fallbackResponse;
      const displayOptions =
        promptContext.mode === "guess"
          ? {
              analysisBlock: promptContext.analysisBlock,
              confidenceLabel: promptContext.confidenceLabel,
              confidenceScore: promptContext.confidenceScore,
            }
          : undefined;
      appendDisplaySegment(
        formatDisplaySegment(trimmed, response, displayOptions),
      );
      persistTurn({ type: "ask", topic: trimmed }, response);
    } finally {
      setPendingDisplay(null);
      setIsSubmitting(false);
    }
  }

  return (
    <CrtModal title="Comet" onClose={onClose} width={810} showHeader={false}>
      <div className="comet">
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
                <path
                  className="comet-brandTail"
                  d="M30 42C40 45 50 44 59 38"
                />
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
                <div className="comet-logoTag">AI ASSISTANT</div>
              </div>
              <div className="comet-logoStrap">
                Comet | Central Library Conversational Access
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

        <div className="comet-reader" aria-live="polite">
          <pre ref={readerTextRef} className="comet-readerText">
            {readerText}
          </pre>
        </div>

        <form
          className="comet-searchRow"
          onSubmit={(e) => {
            e.preventDefault();
            const nextQuery = query;
            setQuery("");
            void submitMessage(nextQuery);
          }}
        >
          <label className="comet-searchLabel" htmlFor="comet-search">
            CHAT
          </label>
          <input
            id="comet-search"
            ref={inputRef}
            className="comet-searchInput"
            value={query}
            autoComplete="off"
            spellCheck={false}
            maxLength={COMET_MAX_INPUT_CHARS}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isOn
                ? hasLink
                  ? isSubmitting
                    ? "Comet is responding..."
                    : "In a jam? I'm here to help!"
                  : "LINK unavailable"
                : "Power off"
            }
            disabled={!canChat}
          />
        </form>

        <CometKeyboard flashKey={flashKey} />
      </div>
    </CrtModal>
  );
}
