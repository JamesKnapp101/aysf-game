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
}: {
  runAction: RunAction;
  state: GameState;
}) {
  const overlay = useUIOverlayStore((s) => s.overlay);
  const closeOverlay = useUIOverlayStore((s) => s.closeOverlay);

  if (overlay.kind === "none") return null;

  switch (overlay.kind) {
    case "reader":
      return (
        <ReaderModal
          title={overlay.title}
          body={overlay.body}
          onClose={closeOverlay}
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
          onClose={closeOverlay}
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
          onClose={closeOverlay}
        />
      );
    }

    case "plt-viewer": {
      return <PLTModal onClose={closeOverlay} state={state} />;
    }

    case "camera-gun-viewer": {
      // "VIEW" button: cycle view index via your action
      const onCycleView = (currentViewIndex: number) => {
        runAction("cycleCameraGunView", { currentViewIndex });
      };

      // "WATCH" button: run the parser command "wait"
      const onRunCommand = (rawCommand: string) => {
        runAction("command", { input: rawCommand });
      };

      return (
        <CameraGunViewerModal
          state={state}
          currentView={overlay.currentViewIndex ?? 0}
          onCycleView={onCycleView}
          onRunCommand={onRunCommand}
          onClose={closeOverlay}
        />
      );
    }

    default:
      return null;
  }
}
