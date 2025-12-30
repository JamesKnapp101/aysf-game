import type { Direction } from "../types/roomTypes";
import { RoomCompass } from "./Compass";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/components/mind-gun-overlay.css";
import { useUIEffectsStore } from "../store/store";

type RoomDescriptionPanelProps = {
  desc: string;
  exits: Direction[];
  roomPanelFlexBasis: number | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  activeEffects: string;
  roomHasLight: boolean;
};

type Flash = {
  id: string;
  text: string;
  x: number;
  y: number;
  phase: "enter" | "steady" | "exit";
};

const START_DELAY_MS = 220;
const FADE_IN_MS = 260;
const FADE_OUT_MS = 320;
const LINGER_MS = 1200;
const GAP_MS = 220;
const WIND_DOWN_MS = 160;

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

export const RoomDescriptionPanel: React.FC<RoomDescriptionPanelProps> = ({
  desc,
  exits,
  roomPanelFlexBasis,
  inputRef,
  activeEffects,
  roomHasLight,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ---- mind flash effect hook-up (NOT modal overlays) ----
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

  // Existing scroll-to-top behavior (keep)
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [desc]);

  // Existing overflow detector (keep)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      el.dataset.overflow = overflow ? "true" : "false";
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
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

    // ensure the flash layer positions relative to the room text box
    el.style.position = el.style.position || "relative";

    async function run() {
      setHijacked(true);
      setFlashes([]);
      // allow blur to visually kick in
      await wait(START_DELAY_MS);
      if (cancelled || runIdRef.current !== myRunId) return;

      const r = makeRand(seed);

      // Show one chunk at a time; fade in -> linger -> fade out -> gap
      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i];

        // Keep within bounds so text doesn’t clip too much.
        const x = 6 + r() * 72; // 6%..78%
        const y = 8 + r() * 72; // 8%..80%

        const id = `${seed}-${i}-${Math.floor(r() * 1e9)}`;

        // enter
        setFlashes([{ id, text, x, y, phase: "enter" }]);
        await wait(FADE_IN_MS);
        if (cancelled || runIdRef.current !== myRunId) return;

        // steady
        setFlashes([{ id, text, x, y, phase: "steady" }]);
        const lingerMs = computeLingerMs(text);
        await wait(lingerMs);

        if (cancelled || runIdRef.current !== myRunId) return;

        // exit
        setFlashes([{ id, text, x, y, phase: "exit" }]);
        await wait(FADE_OUT_MS);
        if (cancelled || runIdRef.current !== myRunId) return;

        // gap
        setFlashes([]);
        await wait(GAP_MS);
        if (cancelled || runIdRef.current !== myRunId) return;
      }

      // wind down
      await wait(WIND_DOWN_MS);
      if (cancelled || runIdRef.current !== myRunId) return;

      setFlashes([]);
      setHijacked(false);

      // clear the effect so normal room view is restored
      clearMindFlash();
    }

    run();

    return () => {
      cancelled = true;
      setFlashes([]);
      setHijacked(false);
    };
  }, [isMindFlash, chunks, seed, clearMindFlash, desc]);

  return (
    <section
      className="game-room-panel"
      style={{ flex: `0 0 ${roomPanelFlexBasis}`, minHeight: 0 }}
      onClick={() => inputRef.current?.focus()}
      data-status={activeEffects}
      data-room-has-light={roomHasLight}
      data-mindflash={hijacked ? "true" : "false"}
    >
      <div className="game-room-inner">
        <div className="room-compass-float">
          <RoomCompass exits={exits} />
        </div>

        <div ref={scrollRef} className="game-room-text">
          {/* normal room description */}
          <div className={`game-room-desc ${hijacked ? "is-hijacked" : ""}`}>
            {desc}
          </div>

          {/* flash layer */}
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
      </div>
    </section>
  );
};
