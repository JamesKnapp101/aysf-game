import { buildRoomDescription } from "@game/text/roomDescription";
import type { GameState } from "@game/types/gameTypes";
import type { Direction } from "@game/types/roomTypes";
import { useEffect } from "react";
import {
  formatDeepStorageCoord,
  getCurrentDeepStorageDock,
  getDeepStorageAvailableDirections,
  getDeepStorageState,
} from "src/world/maps/levelSeven/deepStorage";
import "../../styles/components/deep-storage-suit-overlay.css";

type DeepStorageSuitOverlayProps = {
  onCommand: (input: string) => void;
  onHome: () => void;
  state: GameState;
};

const NAV_BUTTONS: Array<{
  direction: Extract<Direction, "north" | "south" | "east" | "west">;
  rotation: number;
}> = [
  { direction: "north", rotation: 0 },
  { direction: "east", rotation: 90 },
  { direction: "south", rotation: 180 },
  { direction: "west", rotation: 270 },
];

const ARROW_KEY_DIRECTIONS: Partial<
  Record<string, Extract<Direction, "north" | "south" | "east" | "west">>
> = {
  ArrowUp: "north",
  ArrowRight: "east",
  ArrowDown: "south",
  ArrowLeft: "west",
};

function NavIcon({ rotation }: { rotation: number }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon
        points="50,12 18,72 82,72"
        transform={`rotate(${rotation} 50 50)`}
      />
    </svg>
  );
}

export function DeepStorageSuitOverlay({
  onCommand,
  onHome,
  state,
}: DeepStorageSuitOverlayProps) {
  const storage = getDeepStorageState(state);
  const coordLabel = formatDeepStorageCoord(storage.coord);
  const dock = getCurrentDeepStorageDock(state);
  const availableDirections = getDeepStorageAvailableDirections(state);
  const roomName =
    state.world.rooms.find((room) => room.id === state.player.roomId)?.name ??
    state.player.roomId;
  const description = buildRoomDescription(state, state.player.roomId, {
    mode: "panel",
    forceFull: true,
    omitItems: true,
  });
  const temp = state.player.vitals.temperature.toFixed(1);
  const oxygen = Math.max(
    0,
    Math.min(100, Math.round(state.player.vitals.oxygen)),
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = ARROW_KEY_DIRECTIONS[event.key];
      if (!direction || !availableDirections[direction]) return;

      event.preventDefault();
      onCommand(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [availableDirections, onCommand]);

  return (
    <div
      className="deep-storage-suit"
      role="dialog"
      aria-label="Cryonic suit visor"
      data-dock-ready={dock ? "true" : "false"}
      data-visual-effects={state.uiState.visualEffectsMode ?? "full"}
    >
      <div className="deep-storage-hud-line deep-storage-hud-line--top" />
      <div className="deep-storage-hud-line deep-storage-hud-line--bottom" />
      <div className="deep-storage-visor" aria-live="polite">
        <span className="deep-storage-helmet-label">HELMET VIEW</span>
        <div className="deep-storage-visor-ring deep-storage-visor-ring--outer" />
        <div className="deep-storage-visor-ring deep-storage-visor-ring--inner" />
        <div className="deep-storage-visor-glass">
          <div className="deep-storage-readout deep-storage-readout--left">
            <span>GRID COORDS</span>
            <strong>{coordLabel}</strong>
          </div>
          <div className="deep-storage-readout deep-storage-readout--right">
            <span>BODY TEMP</span>
            <strong>{temp} F</strong>
          </div>
          <div className="deep-storage-readout deep-storage-readout--oxygen">
            <span>OXYGEN</span>
            <strong>{oxygen}%</strong>
            <div className="deep-storage-oxygen-bar" aria-hidden="true">
              <div
                className="deep-storage-oxygen-bar-fill"
                style={{ width: `${oxygen}%` }}
              />
            </div>
          </div>
          <div className="deep-storage-port-text">
            <div className="deep-storage-room-name">
              {roomName} - {coordLabel}
            </div>
            <div className="deep-storage-room-description">{description}</div>
          </div>
        </div>
      </div>
      <div className="deep-storage-dock-status">
        <span>{dock ? "DOCK READY" : "SEAL LOCKED"}</span>
        <strong>{dock?.label ?? "NO CRADLE"}</strong>
      </div>
      <button
        className="deep-storage-home"
        onClick={onHome}
        title="Return to Stasis Dock"
        type="button"
      >
        HOME
      </button>
      <button
        className="deep-storage-remove"
        disabled={!dock}
        onClick={() => onCommand("remove suit")}
        title={dock ? "Remove suit" : "Dock required"}
        type="button"
      >
        REMOVE SUIT
      </button>
      <div className="deep-storage-nav" aria-label="Suit navigation pad">
        {NAV_BUTTONS.map(({ direction, rotation }) => (
          <button
            key={direction}
            aria-label={`Move ${direction}`}
            className={`deep-storage-nav-button deep-storage-nav-button--${direction}`}
            disabled={!availableDirections[direction]}
            onClick={() => onCommand(direction)}
            title={direction}
            type="button"
          >
            <NavIcon rotation={rotation} />
          </button>
        ))}
        <div className="deep-storage-nav-core" aria-hidden="true">
          <span>{coordLabel}</span>
        </div>
      </div>
    </div>
  );
}
