import { getNpcById } from "@game/npcRegistry";
import {
  exchangeTranscript,
  gossipEligibleForNpc,
  sharedGossipIds,
} from "@game/rules/informationExchange";
import type { GameState } from "@game/types/gameTypes";
import { useCallback, useEffect, useId, useRef } from "react";
import listeningHeadImage from "../../assets/gossip-listening-head.png";
import "../../styles/information-exchange.css";
import { CrtModal } from "./CrtModal";
import { GossipReactionDisplay } from "./GossipReactionDisplay";

function GossipHead({ listening = false }: { listening?: boolean }) {
  const colorFilterId = useId();
  return (
    <svg
      className="information-exchange-head"
      viewBox={listening ? "145 140 930 930" : "0 0 140 140"}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {listening ? (
        <>
          <defs>
            <filter id={colorFilterId} colorInterpolationFilters="sRGB">
              {/* Remove the black background and faint glow before tinting. */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1.5 0 0 -0.15"
                result="headAlpha"
              />
              <feFlood floodColor="currentColor" result="displayColor" />
              <feComposite in="displayColor" in2="headAlpha" operator="in" />
            </filter>
          </defs>
          <image
            href={listeningHeadImage}
            width="1254"
            height="1254"
            filter={`url(#${colorFilterId})`}
          />
        </>
      ) : (
        <>
          <path d="M30 119 39 96C22 76 18 57 24 38 31 16 54 8 79 13 99 17 110 29 110 46L108 56 118 69Q120 73 111 75L112 82 106 85 108 90Q106 100 90 100L88 128 63 120Z" />
          <path d="M121 63q9 9 0 18M128 56q15 16 0 32M135 49q19 23 0 46" />
        </>
      )}
    </svg>
  );
}

export function InformationExchangeModal({
  state,
  npcId,
  onShare,
  onClose,
}: {
  state: GameState;
  npcId: string;
  onShare: (gossipId: string) => void;
  onClose: () => void;
}) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const logLabelId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => closeRef.current(), []);
  const npc = getNpcById(npcId);
  const shared = sharedGossipIds(state, npcId);
  const lines = exchangeTranscript(state, npcId);
  const lineCount = lines.length;

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [lineCount, npcId]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  if (!npc?.informationExchange) return null;
  return (
    <div
      ref={dialogRef}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>("*") ?? [],
        ).filter((element) =>
          element.matches('button:not(:disabled), [tabindex="0"]'),
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <CrtModal
        title={`Gossip with ${npcId}`}
        onClose={close}
        showHeader={false}
        className="information-exchange-modal"
        style={{ width: "calc(100vw - 148px)", height: "calc(100dvh - 148px)" }}
      >
        <div className="information-exchange">
          <header className="information-exchange-header">
            <GossipHead />
            <div className="information-exchange-brand">
              <h1>GOSSIPOPOLIS</h1>
              <p>COMMUNICATIONS</p>
            </div>
            <GossipHead listening />
            <button
              ref={closeButtonRef}
              className="crt-modal-close information-exchange-close"
              type="button"
              aria-label="Close gossip exchange"
              onClick={close}
            >
              &times;
            </button>
          </header>
          <div className="information-exchange-selection">
            <div className="information-exchange-banner">
              <GossipReactionDisplay
                key={npcId}
                sharedIds={shared}
                effectsEnabled={
                  (state.uiState.visualEffectsMode ?? "full") === "full"
                }
              />
              <p className="information-exchange-prompt">
                <strong>{npcId}:</strong> Bring me something juicy, darling. I'm
                listening.
              </p>
            </div>
            <section
              className="information-exchange-topics"
              aria-label="Collected gossip"
              tabIndex={0}
            >
              {!state.player.spiltTea?.length && (
                <p>
                  You have nothing interesting to share yet. Collect gossip
                  while exploring.
                </p>
              )}
              {(state.player.spiltTea ?? []).map((topic) => {
                const alreadyShared = shared.includes(topic.id);
                const ownSecret = !gossipEligibleForNpc(topic, npcId);
                return (
                  <article
                    key={topic.id}
                    className={
                      alreadyShared || ownSecret ? "is-unavailable" : ""
                    }
                  >
                    <div className="information-exchange-topic-title">
                      <h3 title={topic.title}>{topic.title}</h3>
                      {(alreadyShared || ownSecret) && (
                        <span>
                          {alreadyShared
                            ? "Already shared"
                            : `Learned from ${npcId}`}
                        </span>
                      )}
                    </div>
                    <p
                      className="information-exchange-summary"
                      title={topic.summary}
                    >
                      {topic.summary}
                    </p>
                    <button
                      type="button"
                      disabled={alreadyShared || ownSecret}
                      aria-label={`Share ${topic.title}`}
                      onClick={() => onShare(topic.id)}
                    >
                      Share
                    </button>
                  </article>
                );
              })}
            </section>
          </div>
          <section
            className="information-exchange-conversation"
            aria-labelledby={logLabelId}
          >
            <h2 id={logLabelId}>LOG</h2>
            <div
              className="information-exchange-transcript"
              tabIndex={0}
              ref={transcriptRef}
              role="log"
              aria-label={`Conversation with ${npcId}`}
              aria-live="polite"
              aria-relevant="additions"
            >
              {lines.map((line, index) => (
                <p key={index}>
                  <strong>
                    {line.speaker === "Player"
                      ? "You"
                      : npc.nickname
                        ? npc.nickname
                        : npcId}
                    :
                  </strong>{" "}
                  {line.text}
                </p>
              ))}
            </div>
            <footer className="information-exchange-footer">
              <button type="button" onClick={close}>
                That's All!
              </button>
            </footer>
          </section>
        </div>
      </CrtModal>
    </div>
  );
}
