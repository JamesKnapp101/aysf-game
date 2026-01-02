import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/mind-gun-overlay.css";
import { useUIEffectsStore } from "../store/store";
import type { WorldState } from "../types/gameTypes"; // adjust path
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
  worldState: WorldState;
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

declare function splitMemory(text: string): string[];
declare function wait(ms: number): Promise<void>;
declare function makeRand(seed: number): () => number;
declare function computeLingerMs(text: string): number;

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
  worldState,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const mindFlash = useUIEffectsStore((s) => s.mindFlash);
  const clearMindFlash = useUIEffectsStore((s) => s.clearMindFlash);

  const isMindFlash = Boolean(mindFlash);
  const memoryText = mindFlash?.memory ?? "";
  const seed = mindFlash?.seed ?? Date.now();

  const chunks = useMemo(() => {
    if (!isMindFlash) return [];
    return splitMemory(memoryText);
  }, [isMindFlash, memoryText]);

  const [hijacked, setHijacked] = useState(false);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const runIdRef = useRef(0);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [desc]);

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

  // Mind flash sequence
  useEffect(() => {
    if (!isMindFlash) return;

    const myRunId = ++runIdRef.current;
    let cancelled = false;

    const el = scrollRef.current;
    if (!el) return;

    el.style.position = el.style.position || "relative";

    async function run() {
      setHijacked(true);
      setFlashes([]);
      await wait(START_DELAY_MS);
      if (cancelled || runIdRef.current !== myRunId) return;

      const r = makeRand(seed);
      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i];

        const x = 6 + r() * 72;
        const y = 8 + r() * 72;

        const id = `${seed}-${i}-${Math.floor(r() * 1e9)}`;

        setFlashes([{ id, text, x, y, phase: "enter" }]);
        await wait(FADE_IN_MS);
        if (cancelled || runIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "steady" }]);
        await wait(computeLingerMs(text));
        if (cancelled || runIdRef.current !== myRunId) return;

        setFlashes([{ id, text, x, y, phase: "exit" }]);
        await wait(FADE_OUT_MS);
        if (cancelled || runIdRef.current !== myRunId) return;

        setFlashes([]);
        await wait(GAP_MS);
        if (cancelled || runIdRef.current !== myRunId) return;
      }

      await wait(WIND_DOWN_MS);
      if (cancelled || runIdRef.current !== myRunId) return;

      setFlashes([]);
      setHijacked(false);
      clearMindFlash();
    }

    run();

    return () => {
      cancelled = true;
      setFlashes([]);
      setHijacked(false);
    };
  }, [isMindFlash, chunks, seed, clearMindFlash, desc]);

  // =========================
  // Diagnostics
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
    const t = worldState.roomTemp?.[roomId] ?? "temperate";
    return titleize(t);
  }, [worldState.roomTemp, roomId]);

  const airValue = useMemo(() => {
    const a = worldState.roomAirQuality?.[roomId] ?? "clean";
    return titleize(a);
  }, [worldState.roomAirQuality, roomId]);

  const baseAudioRaw = useMemo(() => {
    const raw = worldState.roomAudioLevel?.[roomId] ?? 0;
    return Number.isFinite(raw) ? raw : 0;
  }, [worldState.roomAudioLevel, roomId]);

  const baseAudioUnit = useMemo(
    () => audioToUnit(baseAudioRaw),
    [baseAudioRaw]
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
      data-mindflash={hijacked ? "true" : "false"}
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
            <div className={`game-room-desc ${hijacked ? "is-hijacked" : ""}`}>
              {desc}
            </div>

            {hijacked && (
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
          </div>

          <div className="room-more-indicator" aria-hidden="true">
            MORE ▾
          </div>
        </div>
      </div>
    </section>
  );
};
