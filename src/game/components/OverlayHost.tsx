import { lazy, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { enqueueNotifications } from "@game/rules/notifications";
import { useUIOverlayStore } from "../store/store";
import type { GameState } from "../types/gameTypes";
import type { CoolerMode } from "../types/itemTypes";
import { CoolerModal } from "./CoolerModal";
import { CrtModal } from "./CrtModal";
import { HelpModal } from "./HelpModal";
import { MessageMachineModal } from "./MessageMachineModal";
import { ReaderModal } from "./ReaderModal";

type RunAction = (verb: string, args?: Record<string, unknown>) => void;

const LazyPowerStationTerminalModal = lazy(() =>
  import("./PowerStationTerminalModal").then((mod) => ({
    default: mod.PowerStationTerminalModal,
  })),
);
const LazyHydroponicsAdminTerminalModal = lazy(() =>
  import("./HydroponicsAdminTerminalModal").then((mod) => ({
    default: mod.HydroponicsAdminTerminalModal,
  })),
);
const LazyMatterTransmitterModal = lazy(() =>
  import("@game/components/MatterTransmitterModal").then((mod) => ({
    default: mod.MatterTransmitterModal,
  })),
);
const LazyMensLockerModal = lazy(() =>
  import("@game/components/LockerModal").then((mod) => ({
    default: mod.MensLockerModal,
  })),
);
const LazyWomensLockerModal = lazy(() =>
  import("@game/components/LockerModal").then((mod) => ({
    default: mod.WomensLockerModal,
  })),
);
const LazyCameraGunViewerModal = lazy(() =>
  import("./CameraGunModal").then((mod) => ({
    default: mod.CameraGunViewerModal,
  })),
);
const LazyTeleportationTerminalModal = lazy(() =>
  import("@game/components/TeleportationTerminalModal").then((mod) => ({
    default: mod.TeleportationTerminalModal,
  })),
);
const LazyGamePreserveTerminalModal = lazy(() =>
  import("@game/components/GamePreserveTerminalModal").then((mod) => ({
    default: mod.GamePreserveTerminalModal,
  })),
);

function OverlayLoadingModal({
  onClose,
  title = "Loading",
}: {
  onClose: () => void;
  title?: string;
}) {
  return (
    <CrtModal title={title} onClose={onClose} width={420}>
      <div style={{ padding: "1rem", textAlign: "center" }}>Loading...</div>
    </CrtModal>
  );
}

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
    if (closed.postCloseMessage) {
      setGameState((prev) => ({
        ...prev,
        log: [...prev.log, closed.postCloseMessage as string],
      }));
    }

    if (closed.postCloseNotifications && closed.postCloseNotifications.length > 0) {
      setGameState((prev) =>
        enqueueNotifications(prev, closed.postCloseNotifications ?? []),
      );
    }
  };

  switch (overlay.kind) {
    case "help":
      return <HelpModal onClose={onClose} />;

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

    case "power-station-terminal": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Terminal" />
          }
        >
          <LazyPowerStationTerminalModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    case "hydroponics-admin-terminal": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal
              onClose={onClose}
              title="Loading Hydroponics Terminal"
            />
          }
        >
          <LazyHydroponicsAdminTerminalModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    case "matter-transmitter": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal
              onClose={onClose}
              title="Loading Transmitter"
            />
          }
        >
          <LazyMatterTransmitterModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    case "mens-lockers": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Lockers" />
          }
        >
          <LazyMensLockerModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    case "womens-lockers": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Lockers" />
          }
        >
          <LazyWomensLockerModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
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
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Viewer" />
          }
        >
          <LazyCameraGunViewerModal
            state={state}
            currentView={overlay.currentViewIndex ?? 0}
            onCycleView={onCycleView}
            onRunCommand={onRunCommand}
            onClose={onClose}
          />
        </Suspense>
      );
    }

    case "teleportation-terminal": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Terminal" />
          }
        >
          <LazyTeleportationTerminalModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    case "game-preserve-terminal": {
      return (
        <Suspense
          fallback={
            <OverlayLoadingModal onClose={onClose} title="Loading Preserve Terminal" />
          }
        >
          <LazyGamePreserveTerminalModal
            onClose={onClose}
            state={state}
            setGameState={setGameState}
          />
        </Suspense>
      );
    }

    default:
      return null;
  }
}
