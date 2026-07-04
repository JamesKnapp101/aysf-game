import type { GameState } from "@game/types/gameTypes";
import type { Direction } from "@game/types/roomTypes";
import type { FC } from "react";
import { RoomCompass } from "./Compass";
import { ShipMapPanel } from "./ShipMap";

type RoomTelemetryPanelProps = {
  exits: readonly Direction[];
  state: GameState;
};

export const RoomTelemetryPanel: FC<RoomTelemetryPanelProps> = ({
  exits,
  state,
}) => {
  return (
    <aside className="game-telemetry-panel" aria-label="Map">
      <ShipMapPanel state={state} />
      <div className="game-map-compassOverlay" aria-label="Compass">
        <RoomCompass exits={[...exits]} />
      </div>
    </aside>
  );
};
