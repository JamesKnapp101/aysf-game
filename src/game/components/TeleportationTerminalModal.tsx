import { CrtModal } from "@game/components/CrtModal";
import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import { appendLog } from "@game/engine/handleCommand";
import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { useUIEffectsStore } from "@game/store/store";
import { buildRoomDescription } from "@game/text/roomDescription";
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
    ringColor: "#00ff4a",
    destinations: ["HubCenter", "HydroponicsOne", "BotanicalOne"],
  },
  {
    id: "medical",
    label: "MEDICAL",
    sectionKey: "teleport-pads-blue",
    ringColor: "#2aa7ff",
    destinations: ["Lab", "RemoteMedicalOne"],
  },
  {
    id: "operations",
    label: "OPERATIONS",
    sectionKey: "teleport-pads-maroon",
    ringColor: "#a22d4c",
    destinations: ["Bridge"],
  },
  {
    id: "powerGrid",
    label: "POWER GRID",
    sectionKey: "teleport-pads-yellow",
    ringColor: "#ffe600",
    destinations: ["PowerGrid", "RemotePowerStation"],
  },
  {
    id: "utilities",
    label: "UTILITIES",
    sectionKey: "teleport-pads-violet",
    ringColor: "#8a2be2",
    destinations: ["MainReactorPlatform", "MaintenanceDuct"],
  },
  {
    id: "zoological",
    label: "ZOOLOGICAL",
    sectionKey: "teleport-pads-orange",
    ringColor: "#ff8c00",
    destinations: ["VeterinaryCenter", "OuterRingSouth", "XenobiologyLab"],
  },
  {
    id: "deepStorage",
    label: "DEEP STORAGE",
    sectionKey: "teleport-pads-white",
    ringColor: "#ffffff",
    destinations: ["CryoLab", "GridC3"],
  },
];

const destinationLabelMap = {
  HubCenter: "Hub Center",
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
      // let next = {
      //   ...prev,
      //   player: { ...prev.player, roomId },
      // };
      let next = movePlayerToRoom(prev, roomId);

      next = appendLog(
        next,
        "You feel a tingling in your belly a beat before the world warps around you, blurring together and then snapping back into focus an instant later to reveal someplace entirely different.\n",
      );
      const roomName = `${ROOM_NAME_TOKEN_START}${
        getRoomById(next, next.player.roomId)?.name
      }${ROOM_NAME_TOKEN_END}`;
      next = appendLog(
        next,
        `${roomName}\n${buildRoomDescription(next, roomId, { mode: "log" })}`,
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
          <div className="tterm2-brand">OMNI→BEAM</div>
          <div className="tterm2-title">TRANSLOCATION TERMINAL</div>
        </div>

        <div className="tterm2-panel">
          <div className="tterm2-gridHeader">
            <div className="tterm2-hcell tterm2-hcell-left">RING STATUS</div>
            <div className="tterm2-hcell tterm2-hcell-right">
              <span className="tterm2-hline" aria-hidden="true" />
              <span className="tterm2-hscroll">
                <span className="tterm2-hscrollTrack">
                  <span className="tterm2-htext2">
                    PLEASE SELECT YOUR TRAVEL DESTINATION! SOME DESTINATIONS MAY
                    REQUIRE AUTHORIZATION.
                  </span>
                  <span className="tterm2-htext2" aria-hidden="true">
                    PLEASE SELECT YOUR TRAVEL DESTINATION! SOME DESTINATIONS MAY
                    REQUIRE AUTHORIZATION.
                  </span>
                </span>
              </span>
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
