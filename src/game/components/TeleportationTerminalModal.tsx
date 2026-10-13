import { CrtModal } from "@game/components/CrtModal";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import React, { useEffect, useMemo, useRef } from "react";
import { destinationLabelMap, isRingOnline, MARQUEE_MESSAGE, prepareTerminalTeleport, RINGS, type RingConfig, type RingId } from "../rules/teleportationTerminal";
import "../../styles/teleport-terminal.css";

type TeleportationTerminalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

function ScrollingBannerMessage() {
  const repeats = Array.from({ length: 3 }, (_, index) => index);

  return (
    <span className="tterm2-hscroll" aria-label={MARQUEE_MESSAGE}>
      <span className="tterm2-hscrollTrack" aria-hidden="true">
        {[0, 1].map((group) => (
          <span className="tterm2-hscrollGroup" key={group}>
            {repeats.map((repeat) => (
              <span className="tterm2-hscrollText" key={`${group}-${repeat}`}>
                {MARQUEE_MESSAGE}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

export function TeleportationTerminalModal({
  onClose,
  state,
  setGameState,
}: TeleportationTerminalProps) {
  const title = "Translocation Terminal";

  const ringOnline = useMemo(() => {
    const map: Record<RingId, boolean> = {
      botanical: isRingOnline(state, "teleport-pads-green"),
      medical: isRingOnline(state, "teleport-pads-blue"),
      operations: isRingOnline(state, "teleport-pads-maroon"),
      powerGrid: isRingOnline(state, "teleport-pads-yellow"),
      utilities: isRingOnline(state, "teleport-pads-violet"),
      zoological: isRingOnline(state, "teleport-pads-orange"),
      deepStorage: isRingOnline(state, "teleport-pads-white"),
    };
    return map;
  }, [state]);

  const cancelled = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);
  const closeTerminal = () => {
    cancelled.current = true;
    onClose();
  };
  const teleportTo = async (ring: RingConfig, roomId: string) => {
    if (pending.current || cancelled.current) return;
    pending.current = true;
    try {
      const prepared = await prepareTerminalTeleport(state, ring.id, roomId);
      if (cancelled.current) return;
      // Production's setter is synchronous; awaiting the updater also supports
      // ordinary React setters without moving completion effects into a reducer.
      const result = await new Promise<ReturnType<typeof prepared.complete>>((resolve) => {
        setGameState((previous) => {
          const completed = cancelled.current
            ? { state: previous, messages: [], teleported: false }
            : prepared.complete(previous);
          resolve(completed);
          return completed.state;
        });
      });
      if (result.teleported && !cancelled.current) {
        useUIEffectsStore.getState().triggerTeleportFlash();
        closeTerminal();
      }
    } finally {
      pending.current = false;
    }
  };

  return (
    <CrtModal
      title={title}
      onClose={closeTerminal}
      width={1550}
      height={750}
      showHeader={false}
    >
      <div className="tterm2-root" role="document" aria-label={title}>
        <div className="tterm2-banner">
          <div className="tterm2-brandBlock">
            <div className="tterm2-brand">OMNI JAUNT</div>
            <div className="tterm2-brandSub">POINT TO POINT TRANSIT</div>
          </div>
          <div className="tterm2-bannerSpacer" aria-hidden="true" />
          <div className="tterm2-titleBlock">
            <div className="tterm2-title">TRANSLOCATION TERMINAL</div>
            <div className="tterm2-titleSub">RING DESTINATION MATRIX</div>
          </div>
        </div>

        <div className="tterm2-panel">
          <div className="tterm2-gridHeader">
            <div className="tterm2-hcell tterm2-hcell-left">RING STATUS</div>
            <div className="tterm2-hcell tterm2-hcell-right">
              <span className="tterm2-hline" aria-hidden="true" />
              <ScrollingBannerMessage />
              <span className="tterm2-hline" aria-hidden="true" />
            </div>
          </div>

          <div className="tterm2-gridBody">
            {RINGS.map((ring) => {
              const online = ringOnline[ring.id];
              return (
                <div
                  key={ring.id}
                  className="tterm2-row"
                  style={
                    {
                      "--ringColor": ring.ringColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="tterm2-statusCell">
                    <span
                      className={[
                        "tterm2-dot",
                        online ? "isOnline" : "isOffline",
                      ].join(" ")}
                      aria-label={`${ring.label} ring ${online ? "ONLINE" : "OFFLINE"}`}
                    />
                    <span
                      className={[
                        "tterm2-statusText",
                        online ? "isOnline" : "isOffline",
                      ].join(" ")}
                    >
                      {online ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>

                  <div className="tterm2-destCell">
                    <div className="tterm2-zoneLabel">{ring.label}</div>

                    <div
                      className="tterm2-steps"
                      aria-label={`${ring.label} destinations`}
                    >
                      {ring.destinations.map((dest, idx) => (
                        <button
                          key={`${ring.id}-${dest}-${idx}`}
                          type="button"
                          className={[
                            "tterm2-step",
                            idx === 0 ? "isFirst" : "",
                            idx === ring.destinations.length - 1
                              ? "isLast"
                              : "",
                            online ? "isOnline" : "isOffline",
                          ].join(" ")}
                          disabled={!online}
                          onClick={() => {
                            void teleportTo(ring, dest);
                          }}
                        >
                          <span className="tterm2-stepText">
                            {
                              destinationLabelMap[
                                dest as keyof typeof destinationLabelMap
                              ]
                            }
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tterm2-foot">
            SELECT A DESTINATION ON ANY{" "}
            <span className="tterm2-footAccent">ONLINE</span> RING.
          </div>
        </div>
      </div>
    </CrtModal>
  );
}
