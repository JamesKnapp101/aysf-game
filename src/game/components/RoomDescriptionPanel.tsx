import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/mind-gun-overlay.css";
import "../../styles/organism-death-overlay.css";
import { getDisplayedFlashlightStatus } from "../helpers/flashlightHelpers";
import { useUIEffectsStore } from "../store/store";
import type { GameState, VisualEffectsMode } from "../types/gameTypes";
import type { Direction } from "../types/roomTypes";
import { RoomStatusPanel } from "./RoomStatusPanel";
import {
  buildOrganismDeathTokens,
  computeLingerMs,
  type Flash,
  hashString,
  MIND_FLASH_TIMINGS,
  makeRand,
  resolveOrganismDeathRevealMode,
  shuffleTokenIds,
  splitMemory,
  wait,
} from "./roomDescriptionEffects";

type RoomDescriptionPanelProps = {
  desc: string;
  exits: Direction[];
  roomPanelFlexBasis: number | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  restorePromptFocus?: () => void;
  activeEffects: string;
  roomIsDark: boolean;
  roomAmbientLight: boolean;
  playerCanSee: boolean;
  playerLightMode: string;
  flashlightOn: string;
  isUnderwater: boolean;
  roomId: string;
  state: GameState;
  setBrainActivityLevel?: (val: number) => void;
  visualEffectsMode?: VisualEffectsMode;
};

export const RoomDescriptionPanel: React.FC<RoomDescriptionPanelProps> = ({
  desc,
  exits,
  roomPanelFlexBasis,
  inputRef,
  restorePromptFocus,
  activeEffects,
  roomIsDark,
  roomAmbientLight,
  playerCanSee,
  playerLightMode,
  flashlightOn,
  isUnderwater,
  roomId,
  state,
  setBrainActivityLevel,
  visualEffectsMode,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const resolvedVisualEffectsMode =
    visualEffectsMode ?? state.uiState.visualEffectsMode ?? "full";

  // =========================
  // UI Effects
  // =========================
  const mindFlash = useUIEffectsStore((s) => s.mindFlash);
  const clearMindFlash = useUIEffectsStore((s) => s.clearMindFlash);

  // (casts until you add organismDeath to the store type)
  const organismDeath = useUIEffectsStore((s) => (s as any).organismDeath);
  const clearOrganismDeath = useUIEffectsStore(
    (s) => (s as any).clearOrganismDeath,
  );

  // Precedence: organism death > mind flash
  const hijackMode: "none" | "organismDeath" | "mindFlash" = organismDeath
    ? "organismDeath"
    : mindFlash
      ? "mindFlash"
      : "none";

  // =========================
  // MindFlash data
  // =========================
  const isMindFlash = hijackMode === "mindFlash";
  const memoryText = mindFlash?.memory ?? "";
  const mindSeed = mindFlash?.seed ?? hashString(memoryText);

  const mindChunks = useMemo(() => {
    if (!isMindFlash) return [];
    return splitMemory(memoryText);
  }, [isMindFlash, memoryText]);

  const [mindHijacked, setMindHijacked] = useState(false);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const mindRunIdRef = useRef(0);

  // =========================
  // Organism death data
  // =========================
  const odTitle: string | undefined = organismDeath?.title;
  const odCipherText: string = organismDeath?.cipherText ?? "";
  const odRevealMode = resolveOrganismDeathRevealMode(
    organismDeath?.revealMode,
  );
  const odChunkSize =
    typeof organismDeath?.chunkSize === "number" && organismDeath.chunkSize > 0
      ? organismDeath.chunkSize
      : 5;
  const odTokens = useMemo(
    () => buildOrganismDeathTokens(odCipherText, odChunkSize),
    [odCipherText, odChunkSize],
  );

  const [odHijacked, setOdHijacked] = useState(false);
  const [odRevealedChunkIds, setOdRevealedChunkIds] = useState<number[]>([]);
  const odRunIdRef = useRef(0);

  // Always scroll to top on new room desc (normal behavior)
  useLayoutEffect(() => {
    // If we're hijacked, we generally want top anyway, but keep existing behavior.
    scrollRef.current?.scrollTo({ top: 0 });
  }, [desc]);

  // Overflow/atBottom dataset tracking (unchanged)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      el.dataset.overflow = overflow ? "true" : "false";

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      el.dataset.atBottom = atBottom ? "true" : "false";
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [desc, roomPanelFlexBasis]);

  // =========================
  // Mind flash sequence
  // =========================
  useEffect(() => {
    if (!isMindFlash) return;

    const myRunId = ++mindRunIdRef.current;
    let cancelled = false;

    const el = scrollRef.current;
    if (!el) return;

    el.style.position = el.style.position || "relative";

    async function run() {
      setMindHijacked(true);
      setFlashes([]);
      await wait(MIND_FLASH_TIMINGS.START_DELAY_MS);
      if (cancelled || mindRunIdRef.current !== myRunId) return;

      const r = makeRand(mindSeed);
      for (let i = 0; i < mindChunks.length; i++) {
        const text = mindChunks[i];

        const x = 6 + r() * 72;
        const y = 8 + r() * 72;

        const id = `${mindSeed}-${i}-${Math.floor(r() * 1e9)}`;

        setFlashes([{ id, text, x, y, phase: "enter" }]);
        await wait(MIND_FLASH_TIMINGS.FADE_IN_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "steady" }]);
        await wait(computeLingerMs(text));
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "exit" }]);
        await wait(MIND_FLASH_TIMINGS.FADE_OUT_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([]);
        await wait(MIND_FLASH_TIMINGS.GAP_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;
      }

      await wait(MIND_FLASH_TIMINGS.WIND_DOWN_MS);
      if (cancelled || mindRunIdRef.current !== myRunId) return;

      setFlashes([]);
      setMindHijacked(false);
      clearMindFlash();
    }

    run();

    return () => {
      cancelled = true;
      setFlashes([]);
      setMindHijacked(false);
    };
  }, [isMindFlash, mindChunks, mindSeed, clearMindFlash]);

  const odRunKey = useMemo(() => {
    if (!organismDeath) return "";
    const seed = organismDeath.seed ?? 0;
    const mode = organismDeath.revealMode ?? "fade";
    const chunkMs = organismDeath.chunkMs ?? 0;
    const chunkSize = organismDeath.chunkSize ?? 0;
    const title = organismDeath.title ?? "";
    const len = (organismDeath.cipherText ?? "").length;

    // Stable string => effect runs once per payload
    return `${seed}|${mode}|${chunkMs}|${chunkSize}|${len}|${title}`;
  }, [organismDeath]);

  const AUTO_CLEAR_MS = 5000;
  const brainBoostedRef = useRef(false);
  const odRevealedChunkSet = useMemo(
    () => new Set(odRevealedChunkIds),
    [odRevealedChunkIds],
  );

  useEffect(() => {
    if (!organismDeath) return;

    // Pull once per run (stable snapshot)
    const cipherText: string = organismDeath.cipherText ?? "";
    const revealMode = resolveOrganismDeathRevealMode(
      organismDeath.revealMode,
    );
    const chunkMs: number = Number.isFinite(organismDeath.chunkMs)
      ? organismDeath.chunkMs
      : 28;
    const chunkSize: number =
      typeof organismDeath.chunkSize === "number" && organismDeath.chunkSize > 0
        ? organismDeath.chunkSize
        : 5;
    const seed = organismDeath.seed ?? 0;
    const tokens = buildOrganismDeathTokens(cipherText, chunkSize);
    const allTokenIds = tokens
      .filter((token) => token.revealable)
      .map((token) => token.id);
    const revealOrder = shuffleTokenIds(tokens, seed);

    const stepMs = Number.isFinite(chunkMs) && chunkMs >= 0 ? chunkMs : 28;

    const myRunId = ++odRunIdRef.current;
    let cancelled = false;

    const el = scrollRef.current;
    if (!el) return;

    el.style.position = el.style.position || "relative";
    el.scrollTo({ top: 0 });

    let autoClearTimer: number | undefined;

    if (!brainBoostedRef.current) {
      brainBoostedRef.current = true;
      setBrainActivityLevel?.(6);
    }

    async function run() {
      setOdHijacked(true);
      setOdRevealedChunkIds([]);

      await wait(120);
      if (cancelled || odRunIdRef.current !== myRunId) return;

      if (revealMode === "fade") {
        setOdRevealedChunkIds(allTokenIds);

        autoClearTimer = window.setTimeout(() => {
          if (cancelled || odRunIdRef.current !== myRunId) return;
          clearOrganismDeath?.();
          setBrainActivityLevel?.(1);
          brainBoostedRef.current = false;
        }, AUTO_CLEAR_MS);

        return;
      }

      for (const tokenId of revealOrder) {
        if (cancelled || odRunIdRef.current !== myRunId) return;
        setOdRevealedChunkIds((current) => [...current, tokenId]);
        await wait(stepMs);
      }

      if (cancelled || odRunIdRef.current !== myRunId) return;

      autoClearTimer = window.setTimeout(() => {
        if (cancelled || odRunIdRef.current !== myRunId) return;
        clearOrganismDeath?.();
        setBrainActivityLevel?.(1);
        brainBoostedRef.current = false;
      }, AUTO_CLEAR_MS);
    }

    run();

    return () => {
      cancelled = true;
      if (autoClearTimer) window.clearTimeout(autoClearTimer);
      setOdHijacked(false);
      setOdRevealedChunkIds([]);

      if (brainBoostedRef.current) {
        setBrainActivityLevel?.(1);
        brainBoostedRef.current = false;
      }
    };
  }, [clearOrganismDeath, odRunKey, organismDeath, setBrainActivityLevel]);

  const roomAudioLevel = state.worldState.roomAudioLevel?.[roomId] ?? 0;
  const flashlightStatus = getDisplayedFlashlightStatus(state);

  // =========================
  // Render helpers
  // =========================

  const showMindLayer = mindHijacked && hijackMode === "mindFlash";
  const showOdLayer = odHijacked && hijackMode === "organismDeath";

  return (
    <section
      className="game-room-panel"
      style={{ flex: `0 0 ${roomPanelFlexBasis}`, minHeight: 0 }}
      onClick={() => {
        if (restorePromptFocus) {
          restorePromptFocus();
          return;
        }

        inputRef.current?.focus();
      }}
      data-status={activeEffects}
      data-room-is-dark={roomIsDark}
      data-room-ambient-light={roomAmbientLight}
      data-player-can-see={playerCanSee}
      data-player-light-mode={playerLightMode}
      data-flashlight-on={flashlightOn}
      data-underwater={isUnderwater ? "true" : "false"}
      data-visual-effects={resolvedVisualEffectsMode}
      data-mindflash={showMindLayer ? "true" : "false"}
      data-organismdeath={showOdLayer ? "true" : "false"}
    >
      <div className="game-room-inner">
        <RoomStatusPanel
          exits={exits}
          audioLevel={Number.isFinite(roomAudioLevel) ? roomAudioLevel : 0}
          flashlightStatus={flashlightStatus}
        />

        <div className="game-room-textWrap">
          <div ref={scrollRef} className="game-room-text">
            <div className="game-room-desc-clip">
              <div
                className={`game-room-desc ${
                  showMindLayer || showOdLayer ? "is-hijacked" : ""
                }`}
                aria-hidden={showOdLayer ? "true" : "false"}
              >
                {desc}
              </div>
            </div>

            {/* MindFlash overlay (unchanged visuals) */}
            {showMindLayer && (
              <div className="mindflash-layer" aria-hidden="true">
                {flashes.map((f) => (
                  <div
                    key={f.id}
                    className={`mindflash-text ${
                      f.phase === "enter"
                        ? "is-entering"
                        : f.phase === "exit"
                          ? "is-exiting"
                          : ""
                    }`}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  >
                    {f.text}
                  </div>
                ))}
              </div>
            )}

            {/* Organism death overlay */}
            {showOdLayer && (
              <div className="organismdeath-layer" aria-hidden="true">
                <div className="organismdeath-blackout" />
                <div className="organismdeath-content">
                  {odTitle ? (
                    <div className="organismdeath-title">{odTitle}</div>
                  ) : null}

                  <div
                    className={`organismdeath-body ${
                      odRevealMode === "fade"
                        ? "is-fade"
                        : "is-random-chunks"
                    }`}
                  >
                    {odTokens.map((token) => (
                      <span
                        key={token.id}
                        className="organismdeath-token"
                        data-revealable={token.revealable ? "true" : "false"}
                        data-revealed={
                          token.revealable && odRevealedChunkSet.has(token.id)
                            ? "true"
                            : "false"
                        }
                      >
                        {token.text}
                      </span>
                    ))}
                  </div>

                  {/* Optional: if you ever want a click-to-dismiss during dev
                  <button
                    className="organismdeath-dismiss"
                    onClick={() => clearOrganismDeath?.()}
                    type="button"
                  >
                    ...
                  </button>
                  */}
                </div>
              </div>
            )}
          </div>

          <div className="room-more-indicator" aria-hidden="true">
            MORE ▾
          </div>
        </div>
      </div>
    </section>
  );
};
