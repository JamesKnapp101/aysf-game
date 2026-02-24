import { CrtModal } from "@game/components/CrtModal";
import { inventoryHas } from "@game/rules/state";
import { useUIEffectsStore } from "@game/store/store";
import { GameState } from "@game/types/gameTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/matter-transmitter.css";

type MatterTransmitterModalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
};

type Axis = "x" | "y" | "z";

const MT_HOST_ID = "MatterTransmitter";

const coordKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

function clampWrap(next: number, min: number, max: number): number {
  if (min > max) return next;
  if (next > max) return min;
  if (next < min) return max;
  return next;
}

export function MatterTransmitterModal({
  onClose,
  state,
  setGameState,
}: MatterTransmitterModalProps) {
  const transmitterMeta = (state.world as any)?.meta?.transmitter as
    | {
        coordByRoomId: Record<string, { x: number; y: number; z: number }>;
        roomIdByCoord: Record<string, string>;
      }
    | undefined;

  const coordByRoomId = transmitterMeta?.coordByRoomId ?? {};
  const roomIdByCoord = transmitterMeta?.roomIdByCoord ?? {};

  const axisBounds = useMemo(() => {
    const coords = Object.values(coordByRoomId);
    const xs = coords.map((c) => c.x);
    const ys = coords.map((c) => c.y);
    const zs = coords.map((c) => c.z);

    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 0;
    const minZ = zs.length ? Math.min(...zs) : 0;
    const maxZ = zs.length ? Math.max(...zs) : 0;

    return {
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
      z: { min: minZ, max: maxZ },
    };
  }, [coordByRoomId]);

  const initialCoord = useMemo(() => {
    const playerRoomId = state.player.roomId;
    const playerCoord = coordByRoomId[playerRoomId];
    if (playerCoord) return playerCoord;
    return { x: 0, y: 0, z: 0 };
  }, [state.player.roomId, coordByRoomId]);

  const [x, setX] = useState<number>(initialCoord.x);
  const [y, setY] = useState<number>(initialCoord.y);
  const [z, setZ] = useState<number>(initialCoord.z);

  useEffect(() => {
    const playerCoord = coordByRoomId[state.player.roomId];
    if (!playerCoord) return;
    if (x === 0 && y === 0 && z === 0) {
      setX(playerCoord.x);
      setY(playerCoord.y);
      setZ(playerCoord.z);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.player.roomId]);

  const currentCoordKey = useMemo(() => coordKey(x, y, z), [x, y, z]);

  const targetRoomId = roomIdByCoord[currentCoordKey];
  const targetRoomName = useMemo(() => {
    if (!targetRoomId) return "NONE";
    const r = state.world.rooms.find((rr) => rr.id === targetRoomId);
    return r?.name ?? targetRoomId;
  }, [state.world.rooms, targetRoomId]);

  const plateItemIds = state.itemState.surfaceContents?.[MT_HOST_ID] ?? [];
  const plateItemId = plateItemIds[0];

  const getItemById = (id: string) =>
    state.world.items.find((it) => it.id === id);

  const plateItemName = useMemo(() => {
    if (!plateItemId) return "EMPTY";
    return getItemById(plateItemId)?.name ?? plateItemId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plateItemId, state.world.items]);

  const itemCurrentRoomId = (
    itemId: string,
    s: GameState,
  ): string | undefined => {
    const overridden = s.itemState.itemRoomId?.[itemId];
    if (overridden) return overridden;

    const it = s.world.items.find((x) => x.id === itemId);
    const loc = (it as any)?.location;
    if (typeof loc === "string") return loc;

    return undefined;
  };

  const isCollectable = (itemId: string, s: GameState): boolean => {
    const it = s.world.items.find((x) => x.id === itemId);
    if (!it) return false;

    if ((it as any).scenery === true) return false;
    if ((it as any).isFixture === true) return false;
    if ((it as any).fixed === true) return false;
    if ((it as any).itemCategory !== "collectable") return false;

    return true;
  };

  const targetRoomCollectables = useMemo(() => {
    if (!targetRoomId) return [];

    const ids: string[] = [];

    for (const it of state.world.items) {
      const id = it.id;

      if (plateItemIds.includes(id)) continue;
      if (inventoryHas(state.player.inventory, id)) continue;

      const curRoom = itemCurrentRoomId(id, state);
      if (curRoom !== targetRoomId) continue;

      if (!isCollectable(id, state)) continue;

      const inAnySurface = Object.values(
        state.itemState.surfaceContents ?? {},
      ).some((arr) => (arr ?? []).includes(id));
      const inAnyContainer = Object.values(
        state.itemState.containerContents ?? {},
      ).some((arr) => (arr ?? []).includes(id));
      if (inAnySurface || inAnyContainer) continue;

      ids.push(id);
    }

    return ids.sort((a, b) => {
      const an = getItemById(a)?.named?.(state) ?? getItemById(a)?.name ?? a;
      const bn = getItemById(b)?.named?.(state) ?? getItemById(b)?.name ?? b;
      return an.localeCompare(bn);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetRoomId,
    state.world.items,
    state.itemState.itemRoomId,
    state.itemState.surfaceContents,
    state.itemState.containerContents,
    state.player.inventory,
    plateItemIds,
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    if (!selectedItemId) return;
    if (!targetRoomCollectables.includes(selectedItemId)) {
      setSelectedItemId("");
    }
  }, [targetRoomCollectables, selectedItemId]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const bump = (axis: Axis, dir: 1 | -1) => {
    const b = axisBounds[axis];
    if (axis === "x") setX((v) => clampWrap(v + dir, b.min, b.max));
    if (axis === "y") setY((v) => clampWrap(v + dir, b.min, b.max));
    if (axis === "z") setZ((v) => clampWrap(v + dir, b.min, b.max));
  };

  const canTransmit = useMemo(() => {
    if (!targetRoomId) return false;

    if (plateItemId) return true;

    if (!selectedItemId) return false;
    if (!targetRoomCollectables.length) return false;

    return targetRoomCollectables.includes(selectedItemId);
  }, [plateItemId, selectedItemId, targetRoomCollectables, targetRoomId]);

  const modeLabel = useMemo(() => {
    if (plateItemId) return "SENDING";
    if (selectedItemId) return "RECEIVING";
    return "IDLE";
  }, [plateItemId, selectedItemId]);

  const triggerFx = () => {
    try {
      useUIEffectsStore.getState().triggerTeleportFlash();
    } catch {}
  };

  const handleTransmit = () => {
    if (!targetRoomId) return;

    let didMove = false;

    setGameState((prev) => {
      const prevPlate = prev.itemState.surfaceContents?.[MT_HOST_ID] ?? [];
      const prevPlateItemId = prevPlate[0];

      // --- SENDING: move plate item into target room
      if (prevPlateItemId) {
        didMove = true;

        const nextSurfaceContents = {
          ...(prev.itemState.surfaceContents ?? {}),
        };
        nextSurfaceContents[MT_HOST_ID] = prevPlate.slice(1);

        const nextItemRoomId = { ...(prev.itemState.itemRoomId ?? {}) };
        nextItemRoomId[prevPlateItemId] = targetRoomId;

        const nextInventory = inventoryHas(
          prev.player.inventory,
          prevPlateItemId,
        )
          ? {
              general: prev.player.inventory.general.filter(
                (id) => id !== prevPlateItemId,
              ),
              badges: prev.player.inventory.badges.filter(
                (id) => id !== prevPlateItemId,
              ),
              keys: prev.player.inventory.keys.filter(
                (id) => id !== prevPlateItemId,
              ),
            }
          : prev.player.inventory;

        const cleanFromLists = (lists?: Record<string, string[]>) => {
          if (!lists) return lists;
          const out: Record<string, string[]> = {};
          for (const [host, arr] of Object.entries(lists)) {
            out[host] = (arr ?? []).filter((id) => id !== prevPlateItemId);
          }
          return out;
        };

        const nextContainerContents =
          cleanFromLists(prev.itemState.containerContents) ?? {};
        const nextUnderContents =
          cleanFromLists(prev.itemState.underContents) ?? {};
        const nextSearchableContents =
          cleanFromLists(prev.itemState.searchableContents) ?? {};

        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: nextInventory,
          },
          itemState: {
            ...prev.itemState,
            surfaceContents: nextSurfaceContents,
            itemRoomId: nextItemRoomId,
            containerContents: nextContainerContents,
            underContents: nextUnderContents,
            searchableContents: nextSearchableContents,
          },
        };
      }

      // --- RECEIVING: move selected item from target room onto transmitter surface
      if (!selectedItemId) return prev;

      const curRoom = (prev.itemState.itemRoomId?.[selectedItemId] ??
        (prev.world.items.find((it) => it.id === selectedItemId) as any)
          ?.location) as string | undefined;

      if (curRoom !== targetRoomId) return prev;

      didMove = true;

      const nextSurfaceContents = { ...(prev.itemState.surfaceContents ?? {}) };
      nextSurfaceContents[MT_HOST_ID] = [selectedItemId];

      const nextItemRoomId = { ...(prev.itemState.itemRoomId ?? {}) };
      nextItemRoomId[selectedItemId] = prev.player.roomId;

      const cleanFromLists = (lists?: Record<string, string[]>) => {
        if (!lists) return lists;
        const out: Record<string, string[]> = {};
        for (const [host, arr] of Object.entries(lists)) {
          out[host] = (arr ?? []).filter((id) => id !== selectedItemId);
        }
        return out;
      };

      const nextContainerContents =
        cleanFromLists(prev.itemState.containerContents) ?? {};
      const nextUnderContents =
        cleanFromLists(prev.itemState.underContents) ?? {};
      const nextSearchableContents =
        cleanFromLists(prev.itemState.searchableContents) ?? {};

      return {
        ...prev,
        itemState: {
          ...prev.itemState,
          surfaceContents: nextSurfaceContents,
          itemRoomId: nextItemRoomId,
          containerContents: nextContainerContents,
          underContents: nextUnderContents,
          searchableContents: nextSearchableContents,
        },
      };
    });

    if (didMove) {
      triggerFx();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (!targetRoomId) return;
    if (plateItemId) return; // disabled in sending mode
    if (targetRoomCollectables.length === 0) return;

    const idx = selectedItemId
      ? targetRoomCollectables.indexOf(selectedItemId)
      : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = Math.min(targetRoomCollectables.length - 1, idx + 1);
      setSelectedItemId(targetRoomCollectables[nextIdx] ?? "");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIdx = Math.max(0, idx - 1);
      setSelectedItemId(targetRoomCollectables[nextIdx] ?? "");
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setSelectedItemId(targetRoomCollectables[0] ?? "");
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setSelectedItemId(
        targetRoomCollectables[targetRoomCollectables.length - 1] ?? "",
      );
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setSelectedItemId("");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Enter triggers transmit if valid
      if (canTransmit) handleTransmit();
      return;
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
        {/* Top logo / banner */}
        <div className="mt-top">
          <div className="mt-top-left">
            <span className="mt-brand-omni">OMNI</span>
            <span className="mt-brand-dot">·</span>
            <span className="mt-brand-port">PORT</span>
          </div>
          <div className="mt-top-right">
            <span className="mt-bars">|||</span>
            <span className="mt-title">MATTER TRANSCEIVER</span>
          </div>
        </div>

        {/* Main body */}
        <div className="mt-body">
          {/* Left: coordinates */}
          <section className="mt-left" aria-label="Coordinates">
            <div className="mt-panel-header" title={targetRoomId ?? ""}>
              <div className="mt-target-label">TARGET LOCATION:</div>
              <div className="mt-target-value">{targetRoomName}</div>
            </div>

            <div className="mt-coords">
              <div className="mt-axis">
                <button
                  className="mt-arrow"
                  onClick={() => bump("x", 1)}
                  aria-label="Increase X"
                >
                  ▲
                </button>
                <div className="mt-digit" aria-label="X coordinate">
                  {x}
                </div>
                <button
                  className="mt-arrow"
                  onClick={() => bump("x", -1)}
                  aria-label="Decrease X"
                >
                  ▼
                </button>
              </div>

              <div className="mt-axis">
                <button
                  className="mt-arrow"
                  onClick={() => bump("y", 1)}
                  aria-label="Increase Y"
                >
                  ▲
                </button>
                <div className="mt-digit" aria-label="Y coordinate">
                  {y}
                </div>
                <button
                  className="mt-arrow"
                  onClick={() => bump("y", -1)}
                  aria-label="Decrease Y"
                >
                  ▼
                </button>
              </div>

              <div className="mt-axis">
                <button
                  className="mt-arrow"
                  onClick={() => bump("z", 1)}
                  aria-label="Increase Z"
                >
                  ▲
                </button>
                <div className="mt-digit" aria-label="Z coordinate">
                  {z}
                </div>
                <button
                  className="mt-arrow"
                  onClick={() => bump("z", -1)}
                  aria-label="Decrease Z"
                >
                  ▼
                </button>
              </div>
            </div>

            <div className="mt-subline">
              <span className="mt-sub-label">COORD:</span>
              <span className="mt-sub-value">{currentCoordKey}</span>
              <span className="mt-sub-spacer" />
              <span className="mt-sub-label">MODE:</span>
              <span className="mt-sub-value">{modeLabel}</span>
            </div>
          </section>

          {/* Right: plate + list + transmit */}
          <section className="mt-right" aria-label="Transmission controls">
            <div className="mt-plate">
              <div className="mt-plate-label">TX/RX PLATE</div>
              <div className="mt-plate-value">{plateItemName}</div>
            </div>

            <div className="mt-list-wrap">
              <div className="mt-list-label">TARGET ITEMS</div>

              {/* Scrollable single-select list */}
              <div
                ref={listRef}
                className={[
                  "mt-picklist",
                  !targetRoomId ? "is-disabled" : "",
                  plateItemId ? "is-disabled" : "",
                  targetRoomCollectables.length === 0 ? "is-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="listbox"
                aria-label="Target item list"
                aria-disabled={
                  !targetRoomId ||
                  !!plateItemId ||
                  targetRoomCollectables.length === 0
                }
                tabIndex={
                  !targetRoomId ||
                  !!plateItemId ||
                  targetRoomCollectables.length === 0
                    ? -1
                    : 0
                }
                onKeyDown={handleListKeyDown}
              >
                <div
                  className={[
                    "mt-pickrow",
                    selectedItemId === "" ? "is-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="option"
                  aria-selected={selectedItemId === ""}
                  onClick={() => setSelectedItemId("")}
                >
                  <span className="mt-pickname">No Selection</span>
                </div>

                {targetRoomCollectables.map((id) => {
                  const name =
                    getItemById(id)?.named?.(state) ??
                    getItemById(id)?.name ??
                    id;
                  const selected = selectedItemId === id;

                  return (
                    <div
                      key={id}
                      className={["mt-pickrow", selected ? "is-selected" : ""]
                        .filter(Boolean)
                        .join(" ")}
                      role="option"
                      aria-selected={selected}
                      onClick={() => setSelectedItemId(id)}
                      title={id}
                    >
                      <span className="mt-pickname">{name}</span>
                    </div>
                  );
                })}
              </div>

              {!targetRoomId ? (
                <div className="mt-hint">No room at these coordinates.</div>
              ) : targetRoomCollectables.length === 0 ? (
                <div className="mt-hint">No transmittable items detected.</div>
              ) : plateItemId ? (
                <div className="mt-hint">
                  Plate occupied. Transmission will send.
                </div>
              ) : (
                <div className="mt-hint">Highlight an item to receive.</div>
              )}
            </div>

            <button
              className="mt-transmit"
              onClick={handleTransmit}
              disabled={!canTransmit}
              aria-label="Transmit"
            >
              TRANSMIT
            </button>
          </section>
        </div>
      </div>
    </CrtModal>
  );
}
