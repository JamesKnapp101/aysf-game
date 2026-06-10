import { CrtModal } from "@game/components/CrtModal";
import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import { appendLog } from "@game/engine/log";
import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { useUIEffectsStore } from "@game/store/store";
import { buildTranscriptRoomDescription } from "@game/text/roomDescription";
import { GameState } from "@game/types/gameTypes";
import React, { useMemo } from "react";
import "../../styles/teleport-terminal.css";

type TeleportationTerminalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

type RingKey =
  | "teleport-pads-green"
  | "teleport-pads-blue"
  | "teleport-pads-maroon"
  | "teleport-pads-yellow"
  | "teleport-pads-violet"
  | "teleport-pads-white"
  | "teleport-pads-orange";

type RingId =
  | "botanical"
  | "deepStorage"
  | "medical"
  | "operations"
  | "powerGrid"
  | "utilities"
  | "zoological";

type RingConfig = {
  id: RingId;
  label: string;
  sectionKey: RingKey;
  ringColor: string;
  destinations: string[];
};

const RINGS: RingConfig[] = [
  {
    id: "botanical",
    label: "BOTANICAL",
    sectionKey: "teleport-pads-green",
    ringColor: "#24ff68",
    destinations: ["ParkCenter", "HydroponicsOne", "BotanicalOne"],
  },
  {
    id: "medical",
    label: "MEDICAL",
    sectionKey: "teleport-pads-blue",
    ringColor: "#38a7ff",
    destinations: ["Lab", "RemoteMedicalOne"],
  },
  {
    id: "operations",
    label: "OPERATIONS",
    sectionKey: "teleport-pads-maroon",
    ringColor: "#ff3d45",
    destinations: ["Bridge"],
  },
  {
    id: "powerGrid",
    label: "POWER GRID",
    sectionKey: "teleport-pads-yellow",
    ringColor: "#ffdf38",
    destinations: ["PowerGrid", "RemotePowerStation"],
  },
  {
    id: "utilities",
    label: "UTILITIES",
    sectionKey: "teleport-pads-violet",
    ringColor: "#b15cff",
    destinations: ["MainReactorPlatform", "MaintenanceDuct"],
  },
  {
    id: "zoological",
    label: "ZOOLOGICAL",
    sectionKey: "teleport-pads-orange",
    ringColor: "#ff982f",
    destinations: ["VeterinaryCenter", "OuterRingSouth", "XenobiologyLab"],
  },
  {
    id: "deepStorage",
    label: "DEEP STORAGE",
    sectionKey: "teleport-pads-white",
    ringColor: "#f4f7ff",
    destinations: ["CryoLab", "GridC3"],
  },
];

const destinationLabelMap = {
  ParkCenter: "Park Center",
  HydroponicsOne: "Hydroponics",
  BotanicalOne: "Botanical",
  Lab: "Medical Lab",
  RemoteMedicalOne: "Remote Medical Facility",
  Bridge: "Command Portal",
  PowerGrid: "Power Station",
  RemotePowerStation: "Remote Power Station",
  MainReactorPlatform: "Main Platform",
  MaintenanceDuct: "Maintenance",
  VeterinaryCenter: "Veterinary Center",
  OuterRingSouth: "Aviary",
  CryoLab: "Deep Lab",
  GridC3: "Grid",
  XenobiologyLab: "Xenobiology Lab",
};

const MARQUEE_MESSAGE =
  "PLEASE SELECT YOUR TRAVEL DESTINATION! SOME DESTINATIONS MAY REQUIRE AUTHORIZATION.";

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

function isRingOnline(state: GameState, key: RingKey): boolean {
  return Boolean((state.worldState.powerRestoredSections as any)?.[key]);
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

  const teleportTo = (roomId: string) => {
    setGameState((prev) => {
      const wasVisitedBeforeTeleport = Boolean(
        (prev.worldState.visitedRooms ?? {})[roomId],
      );
      let next = movePlayerToRoom(prev, roomId);
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          visitedRooms: {
            ...next.worldState.visitedRooms,
            [roomId]: true,
          },
        },
      };

      next = appendLog(
        next,
        "You feel a tingling in your belly a beat before the world warps around you, blurring together and then snapping back into focus an instant later to reveal someplace entirely different.\n",
      );
      const roomName = `${ROOM_NAME_TOKEN_START}${
        getRoomById(next, next.player.roomId)?.name
      }${ROOM_NAME_TOKEN_END}`;
      const roomTranscriptDesc = buildTranscriptRoomDescription(next, roomId, {
        isFirstVisit: !wasVisitedBeforeTeleport,
      });
      next = appendLog(
        next,
        [roomName, roomTranscriptDesc].filter(Boolean).join("\n"),
      );
      return next;
    });
    useUIEffectsStore.getState().triggerTeleportFlash();
    onClose();
  };

  return (
    <CrtModal
      title={title}
      onClose={onClose}
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
                          onClick={() => teleportTo(dest)}
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
