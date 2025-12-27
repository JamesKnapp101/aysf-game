import type { Direction } from "../types/roomTypes";
import { RoomCompass } from "./Compass";

import React, { useEffect, useLayoutEffect, useRef } from "react";

type RoomDescriptionPanelProps = {
  desc: string;
  exits: Direction[];
  roomPanelFlexBasis: number | string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  activeEffects: string;
  roomHasLight: boolean;
};

export const RoomDescriptionPanel: React.FC<RoomDescriptionPanelProps> = ({
  desc,
  exits,
  roomPanelFlexBasis,
  inputRef,
  activeEffects,
  roomHasLight,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [desc]);

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

  return (
    <section
      className="game-room-panel"
      style={{ flex: `0 0 ${roomPanelFlexBasis}`, minHeight: 0 }}
      onClick={() => inputRef.current?.focus()}
      data-status={activeEffects}
      data-room-has-light={roomHasLight}
    >
      <div className="game-room-inner">
        <div className="room-compass-float">
          <RoomCompass exits={exits} />
        </div>

        <div ref={scrollRef} className="game-room-text">
          {desc}
        </div>
      </div>
    </section>
  );
};
