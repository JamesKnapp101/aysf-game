import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/mind-gun-overlay.css";
import "../../styles/organism-death-overlay.css";
import { useUIEffectsStore } from "../store/store";
import type { GameState } from "../types/gameTypes"; // adjust path
import type { Direction } from "../types/roomTypes";
import { RoomCompass } from "./Compass";

type RoomDescriptionPanelProps = {
  desc: string;
  exits: Direction[];
  roomPanelFlexBasis: number | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  activeEffects: string;
  roomIsDark: boolean;
  roomAmbientLight: boolean;
  playerCanSee: boolean;
  playerLightMode: string;
  flashlightOn: string;
  roomId: string;
  state: GameState;
  setBrainActivityLevel?: (val: number) => void;
};

type Flash = {
  id: string;
  text: string;
  x: number;
  y: number;
  phase: "enter" | "steady" | "exit";
};

const START_DELAY_MS = 220;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 160;
const GAP_MS = 260;
const WIND_DOWN_MS = 220;
const MIN_LINGER_MS = 700;
const MAX_LINGER_MS = 2600;
const MS_PER_WORD = 220;

function computeLingerMs(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  const raw = wordCount * MS_PER_WORD;

  return Math.max(MIN_LINGER_MS, Math.min(MAX_LINGER_MS, raw));
}

function splitMemory(memory: string): string[] {
  return memory
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
}

// tiny deterministic RNG so flashes feel consistent per run
function makeRand(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

function titleize(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function audioToUnit(raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return clamp(raw / 10, 0, 1);
}

export const RoomDescriptionPanel: React.FC<RoomDescriptionPanelProps> = ({
  desc,
  exits,
  roomPanelFlexBasis,
  inputRef,
  activeEffects,
  roomIsDark,
  roomAmbientLight,
  playerCanSee,
  playerLightMode,
  flashlightOn,
  roomId,
  state,
  setBrainActivityLevel,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
  const mindSeed = mindFlash?.seed ?? Date.now();

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
  const odRevealMode: "fade" | "type" =
    organismDeath?.revealMode === "type" ? "type" : "fade";

  const [odHijacked, setOdHijacked] = useState(false);
  const [odShown, setOdShown] = useState(0);
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
    if (!isMindFlash) {
      if (flashes.length > 0) {
        setFlashes([]);
      }
      setMindHijacked(false);
      return;
    }

    const myRunId = ++mindRunIdRef.current;
    let cancelled = false;

    const el = scrollRef.current;
    if (!el) return;

    el.style.position = el.style.position || "relative";

    async function run() {
      setMindHijacked(true);
      setFlashes([]);
      await wait(START_DELAY_MS);
      if (cancelled || mindRunIdRef.current !== myRunId) return;

      const r = makeRand(mindSeed);
      for (let i = 0; i < mindChunks.length; i++) {
        const text = mindChunks[i];

        const x = 6 + r() * 72;
        const y = 8 + r() * 72;

        const id = `${mindSeed}-${i}-${Math.floor(r() * 1e9)}`;

        setFlashes([{ id, text, x, y, phase: "enter" }]);
        await wait(FADE_IN_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "steady" }]);
        await wait(computeLingerMs(text));
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "exit" }]);
        await wait(FADE_OUT_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;

        setFlashes([]);
        await wait(GAP_MS);
        if (cancelled || mindRunIdRef.current !== myRunId) return;
      }

      await wait(WIND_DOWN_MS);
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

  useEffect(() => {
    if (!organismDeath) {
      setOdHijacked(false);
      setOdShown(0);

      if (brainBoostedRef.current) {
        setBrainActivityLevel?.(1);
        brainBoostedRef.current = false;
      }
      return;
    }

    // Pull once per run (stable snapshot)
    const cipherText: string = organismDeath.cipherText ?? "";
    const revealMode: "fade" | "type" =
      organismDeath.revealMode === "type" ? "type" : "fade";
    const chunkMs: number = Number.isFinite(organismDeath.chunkMs)
      ? organismDeath.chunkMs
      : 28;
    const chunkSize: number = Number.isFinite(organismDeath.chunkSize)
      ? organismDeath.chunkSize
      : 14;

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
      setOdShown(0);

      await wait(120);
      if (cancelled || odRunIdRef.current !== myRunId) return;

      if (revealMode === "fade") {
        // show immediately
        setOdShown(cipherText.length);

        autoClearTimer = window.setTimeout(() => {
          if (cancelled || odRunIdRef.current !== myRunId) return;
          clearOrganismDeath?.();
          setBrainActivityLevel?.(1);
          brainBoostedRef.current = false;
        }, AUTO_CLEAR_MS);

        return;
      }

      // type/chunk reveal
      const total = cipherText.length;
      let shown = 0;

      while (!cancelled && odRunIdRef.current === myRunId && shown < total) {
        shown = Math.min(total, shown + chunkSize);
        setOdShown(shown);
        await wait(chunkMs);
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
      setOdShown(0);

      if (brainBoostedRef.current) {
        setBrainActivityLevel?.(1);
        brainBoostedRef.current = false;
      }
    };
  }, [odRunKey, clearOrganismDeath]);

  // =========================
  // Diagnostics (unchanged)
  // =========================

  const lightValue = useMemo(() => {
    const flashlightIsOn =
      flashlightOn === "true" || flashlightOn === "on" || flashlightOn === "1";

    if (roomIsDark && playerLightMode === "none") return "None";
    if (flashlightIsOn || playerLightMode === "flashlight") return "Low";
    if (roomAmbientLight || playerLightMode === "ambient") return "Ambient";
    return "Ambient";
  }, [
    flashlightOn,
    playerCanSee,
    roomIsDark,
    roomAmbientLight,
    playerLightMode,
  ]);

  const tempValue = useMemo(() => {
    const t = state.worldState.roomTemp?.[roomId] ?? "temperate";
    return titleize(t);
  }, [state.worldState.roomTemp, roomId]);

  const airValue = useMemo(() => {
    const a = state.worldState.roomAirQuality?.[roomId] ?? "clean";
    return titleize(a);
  }, [state.worldState.roomAirQuality, roomId]);

  const baseAudioRaw = useMemo(() => {
    const raw = state.worldState.roomAudioLevel?.[roomId] ?? 0;
    return Number.isFinite(raw) ? raw : 0;
  }, [state.worldState.roomAudioLevel, roomId]);

  const baseAudioUnit = useMemo(
    () => audioToUnit(baseAudioRaw),
    [baseAudioRaw],
  );

  const AUDIO_BARS = 12;
  const baseBars = useMemo(() => {
    return clamp(Math.round(baseAudioUnit * AUDIO_BARS), 0, AUDIO_BARS);
  }, [baseAudioUnit]);

  const [litBars, setLitBars] = useState(0);

  useEffect(() => {
    if (baseBars <= 0) {
      setLitBars(0);
      return;
    }

    setLitBars(baseBars);

    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const delay = 250 + Math.random() * 650;

      timeoutId = window.setTimeout(() => {
        if (cancelled) return;

        if (Math.random() < 0.3) {
          const delta = Math.random() < 0.65 ? 1 : -1;

          const bumped = clamp(baseBars + delta, 0, AUDIO_BARS);
          setLitBars(bumped);

          window.setTimeout(() => {
            if (cancelled) return;
            setLitBars(baseBars);
            scheduleNext();
          }, 160);
        } else {
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [baseBars]);

  // =========================
  // Render helpers
  // =========================

  const showMindLayer = mindHijacked && hijackMode === "mindFlash";
  const showOdLayer = odHijacked && hijackMode === "organismDeath";

  const odVisibleText =
    odRevealMode === "type" ? odCipherText.slice(0, odShown) : odCipherText;

  return (
    <section
      className="game-room-panel"
      style={{ flex: `0 0 ${roomPanelFlexBasis}`, minHeight: 0 }}
      onClick={() => inputRef.current?.focus()}
      data-status={activeEffects}
      data-room-is-dark={roomIsDark}
      data-room-ambient-light={roomAmbientLight}
      data-player-can-see={playerCanSee}
      data-player-light-mode={playerLightMode}
      data-flashlight-on={flashlightOn}
      data-mindflash={showMindLayer ? "true" : "false"}
      data-organismdeath={showOdLayer ? "true" : "false"}
    >
      <div className="game-room-inner">
        <div className="room-compass-float">
          <RoomCompass exits={exits} />

          <div className="room-diagnostics" aria-label="Room diagnostics">
            <div className="room-diag-row" data-kind="light">
              <div className="room-diag-label">Light:</div>
              <div className="room-diag-valueInline">{lightValue}</div>
            </div>

            <div className="room-diag-row" data-kind="temp">
              <div className="room-diag-label">Temp:</div>
              <div className="room-diag-valueInline">{tempValue}</div>
            </div>

            <div className="room-diag-row" data-kind="air">
              <div className="room-diag-label">Air:</div>
              <div className="room-diag-valueInline">{airValue}</div>
            </div>

            <div className="room-diag-block" data-kind="audio">
              <div className="room-diag-title">AUDIO</div>
              <div className="room-diag-meter" aria-hidden="true">
                {Array.from({ length: AUDIO_BARS }).map((_, i) => {
                  const on = baseBars > 0 && i < litBars;
                  return (
                    <div
                      key={i}
                      className="room-audio-bar"
                      data-on={on ? "true" : "false"}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="game-room-textWrap">
          <div ref={scrollRef} className="game-room-text">
            <div
              className={`game-room-desc ${
                showMindLayer || showOdLayer ? "is-hijacked" : ""
              }`}
              aria-hidden={showOdLayer ? "true" : "false"}
            >
              {desc}
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
                      odRevealMode === "fade" ? "is-fade" : "is-type"
                    }`}
                  >
                    {odVisibleText}
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
