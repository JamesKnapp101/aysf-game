import { CrtModal } from "@game/components/CrtModal";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { useEffect, useMemo, useState } from "react";
import "../../styles/components/matter-transmitter.css";
import {
  MatterTransmitterCoordinatePanel,
  MatterTransmitterHeader,
  MatterTransmitterTransferPanel,
} from "./MatterTransmitterPanels";
import {
  applyMatterTransmission,
  buildMatterTransmitterOptions,
  canTransmitToTarget,
  clampWrap,
  coordKey,
  EMPTY_COORD_BY_ROOM_ID,
  EMPTY_ROOM_ID_BY_COORD,
  getAxisBounds,
  getInitialCoord,
  getItemDisplayName,
  getModeLabel,
  getPlateItemIds,
  getRoomName,
  getTargetRoomCollectableIds,
  getTransferHint,
  type Axis,
  type TransmitterMeta,
} from "./matterTransmitterHelpers";

type MatterTransmitterModalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
};

export function MatterTransmitterModal({
  onClose,
  state,
  setGameState,
}: MatterTransmitterModalProps) {
  const transmitterMeta = state.world.meta?.transmitter as
    | TransmitterMeta
    | undefined;

  const coordByRoomId =
    transmitterMeta?.coordByRoomId ?? EMPTY_COORD_BY_ROOM_ID;
  const roomIdByCoord =
    transmitterMeta?.roomIdByCoord ?? EMPTY_ROOM_ID_BY_COORD;

  const axisBounds = useMemo(
    () => getAxisBounds(coordByRoomId),
    [coordByRoomId],
  );
  const initialCoord = useMemo(
    () => getInitialCoord(state.player.roomId, coordByRoomId),
    [state.player.roomId, coordByRoomId],
  );

  const [x, setX] = useState<number>(initialCoord.x);
  const [y, setY] = useState<number>(initialCoord.y);
  const [z, setZ] = useState<number>(initialCoord.z);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    const playerCoord = coordByRoomId[state.player.roomId];
    if (!playerCoord) return;

    if (x === 0 && y === 0 && z === 0) {
      setX(playerCoord.x);
      setY(playerCoord.y);
      setZ(playerCoord.z);
    }
  }, [coordByRoomId, state.player.roomId, x, y, z]);

  const currentCoordKey = useMemo(() => coordKey(x, y, z), [x, y, z]);
  const targetRoomId = roomIdByCoord[currentCoordKey];
  const targetRoomName = useMemo(
    () => getRoomName(state.world, targetRoomId),
    [state.world, targetRoomId],
  );

  const plateItemIds = getPlateItemIds(state);
  const plateItemId = plateItemIds[0];
  const plateItemName = plateItemId
    ? getItemDisplayName(state.world, state, plateItemId)
    : "EMPTY";

  const targetRoomCollectables = useMemo(
    () => getTargetRoomCollectableIds(state, targetRoomId, plateItemIds),
    [plateItemIds, state, targetRoomId],
  );
  const targetItems = useMemo(
    () => buildMatterTransmitterOptions(state, targetRoomCollectables),
    [state, targetRoomCollectables],
  );

  useEffect(() => {
    if (!selectedItemId) return;
    if (!targetRoomCollectables.includes(selectedItemId)) {
      setSelectedItemId("");
    }
  }, [selectedItemId, targetRoomCollectables]);

  const bump = (axis: Axis, dir: 1 | -1) => {
    const bounds = axisBounds[axis];
    if (axis === "x") setX((value) => clampWrap(value + dir, bounds.min, bounds.max));
    if (axis === "y") setY((value) => clampWrap(value + dir, bounds.min, bounds.max));
    if (axis === "z") setZ((value) => clampWrap(value + dir, bounds.min, bounds.max));
  };

  const canTransmit = canTransmitToTarget(
    targetRoomId,
    plateItemId,
    selectedItemId,
    targetRoomCollectables,
  );
  const modeLabel = getModeLabel(plateItemId, selectedItemId);
  const hintText = getTransferHint(
    targetRoomId,
    targetRoomCollectables.length,
    plateItemId,
  );

  const handleTransmit = () => {
    if (!targetRoomId) return;

    let didMove = false;

    setGameState((prev) => {
      const result = applyMatterTransmission(prev, targetRoomId, selectedItemId);
      didMove = result.didMove;
      return result.nextState;
    });

    if (didMove) {
      try {
        useUIEffectsStore.getState().triggerTeleportFlash();
      } catch {
        // UI effects are optional; transmission still succeeds without the flash.
      }
    }
  };

  return (
    <CrtModal
      title="Matter Transmitter"
      onClose={onClose}
      width={910}
      showHeader={false}
    >
      <div
        className="mt-root"
        role="application"
        aria-label="Matter Transmitter"
      >
        <MatterTransmitterHeader />

        <div className="mt-body">
          <MatterTransmitterCoordinatePanel
            currentCoordKey={currentCoordKey}
            modeLabel={modeLabel}
            onBump={bump}
            targetRoomId={targetRoomId}
            targetRoomName={targetRoomName}
            x={x}
            y={y}
            z={z}
          />
          <MatterTransmitterTransferPanel
            canTransmit={canTransmit}
            hintText={hintText}
            onSelectItemId={setSelectedItemId}
            onTransmit={handleTransmit}
            plateItemId={plateItemId}
            plateItemName={plateItemName}
            selectedItemId={selectedItemId}
            targetItems={targetItems}
            targetRoomId={targetRoomId}
          />
        </div>
      </div>
    </CrtModal>
  );
}
