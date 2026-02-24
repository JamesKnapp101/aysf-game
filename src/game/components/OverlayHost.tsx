import {
  MensLockerModal,
  WomensLockerModal,
} from "@game/components/LockerModal";
import { MatterTransmitterModal } from "@game/components/MatterTransmitterModal";
import { TeleportationTerminalModal } from "@game/components/TeleportationTerminalModal";
import type { Dispatch, SetStateAction } from "react";
import { PowerStationTerminalModal } from "../components/PowerStationTerminalModal";
import { useUIOverlayStore } from "../store/store";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";
import { CameraGunViewerModal } from "./CameraGunModal";
import { CoolerModal } from "./CoolerModal";
import { MessageMachineModal } from "./MessageMachineModal";
import { PLTModal } from "./PLTModal";
import { ReaderModal } from "./ReaderModal";

type RunAction = (verb: string, args?: Record<string, unknown>) => void;

export function OverlayHost({
  runAction,
  state,
  setGameState,
}: {
  runAction: RunAction;
  state: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
}) {
  const overlay = useUIOverlayStore((s) => s.overlay);
  const closeOverlay = useUIOverlayStore((s) => s.closeOverlay);

  if (overlay.kind === "none") return null;

  // Wrap close so we can do post-close transcript messages
  const onClose = () => {
    // Capture what we're closing *before* closing it.
    const closed = overlay;

    closeOverlay();

    // If the overlay defines a post-close message, append it to transcript AFTER close.
    if (closed.kind === "reader" && closed.postCloseMessage) {
      setGameState((prev) => ({
        ...prev,
        log: [...prev.log, closed.postCloseMessage as string],
      }));
    }
  };

  switch (overlay.kind) {
    case "reader":
      return (
        <ReaderModal
          title={overlay.title}
          body={overlay.body}
          onClose={onClose}
        />
      );

    case "cooler": {
      const onSetMode = (mode: CoolerMode) => {
        runAction("setCoolerMode", { mode });
      };

      return (
        <CoolerModal
          mode={overlay.mode ?? "off"}
          onSetMode={onSetMode}
          onClose={onClose}
        />
      );
    }

    case "message-machine": {
      return (
        <MessageMachineModal
          messages={overlay.messages ?? "off"}
          messagesPlayedById={overlay.messagesPlayedById ?? {}}
          onMarkPlayed={(messageId) => {
            runAction("markMessagePlayed", { messageId });
          }}
          onClose={onClose}
        />
      );
    }

    case "plt-viewer": {
      return <PLTModal onClose={onClose} state={state} />;
    }

    case "power-station-terminal": {
      return (
        <PowerStationTerminalModal
          onClose={onClose}
          state={state}
          setGameState={setGameState}
        />
      );
    }

    case "matter-transmitter": {
      return (
        <MatterTransmitterModal
          onClose={onClose}
          state={state}
          setGameState={setGameState}
        />
      );
    }

    case "mens-lockers": {
      return (
        <MensLockerModal
          onClose={onClose}
          state={state}
          setGameState={setGameState}
        />
      );
    }

    case "womens-lockers": {
      return (
        <WomensLockerModal
          onClose={onClose}
          state={state}
          setGameState={setGameState}
        />
      );
    }

    case "camera-gun-viewer": {
      const onCycleView = (currentViewIndex: number) => {
        runAction("cycleCameraGunView", { currentViewIndex });
      };
      const onRunCommand = (rawCommand: string) => {
        runAction("command", { input: rawCommand });
      };

      return (
        <CameraGunViewerModal
          state={state}
          currentView={overlay.currentViewIndex ?? 0}
          onCycleView={onCycleView}
          onRunCommand={onRunCommand}
          onClose={onClose}
        />
      );
    }

    case "teleportation-terminal": {
      return (
        <TeleportationTerminalModal
          onClose={onClose}
          state={state}
          setGameState={setGameState}
        />
      );
    }

    default:
      return null;
  }
}
