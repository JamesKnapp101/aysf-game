import { CrtModal } from "@game/components/CrtModal";
import { getItemById } from "@game/helpers/itemHelpers";
import { GameState } from "@game/types/gameTypes";
import React, { useMemo, useState } from "react";
import "../../styles/components/locker-modal.css";

type LockerType = "men" | "women";

type LockerModalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  type: LockerType;
};

type FoundPopup = {
  open: boolean;
  lockerIndex: number;
  itemIds: string[];
};

const LOCKER_COUNT = 16;

function lockerIdFor(type: LockerType, index: number): string {
  return type === "men" ? `menLocker${index}` : `womenLocker${index}`;
}

function appendLog(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  text: string
) {
  setGameState((prev: any) => {
    if (Array.isArray(prev?.log)) return { ...prev, log: [...prev.log, text] };
    if (Array.isArray(prev?.logLines))
      return { ...prev, logLines: [...prev.logLines, text] };
    if (Array.isArray(prev?.uiState?.logLines)) {
      return {
        ...prev,
        uiState: {
          ...prev.uiState,
          logLines: [...prev.uiState.logLines, text],
        },
      };
    }
    if (Array.isArray(prev?.storyLog?.entries)) {
      return {
        ...prev,
        storyLog: {
          ...prev.storyLog,
          entries: [...prev.storyLog.entries, { text }],
        },
      };
    }

    console.warn(
      "appendLog: couldn't find a log array on state; message:",
      text
    );
    return prev;
  });
}

function getAllInventoryItems(state: any): any[] {
  // Legacy path used by your prior modal (world items w/ location === "INVENTORY")
  const items: any[] =
    state?.world?.items ?? state?.worldState?.items ?? state?.items ?? [];
  return items.filter((it) => it?.location === "INVENTORY");
}

function playerHasKeyForLocker(
  state: any,
  type: LockerType,
  lockerIndex: number
): boolean {
  const inv = getAllInventoryItems(state);
  return inv.some(
    (it) =>
      it?.meta?.lockerType === type && it?.meta?.lockerIndex === lockerIndex
  );
}

function moveItemIdsToWorldInventoryLocation(
  prev: any,
  itemIds: string[]
): any {
  // Keeps your previous behavior: set item.location = "INVENTORY" if items live in world list
  const items: any[] = prev?.world?.items ?? prev?.items ?? [];
  if (!Array.isArray(items) || items.length === 0) return prev;

  const idSet = new Set(itemIds);
  const updated = items.map((it) =>
    idSet.has(it.id) ? { ...it, location: "INVENTORY" } : it
  );

  if (prev.world?.items)
    return { ...prev, world: { ...prev.world, items: updated } };
  return { ...prev, items: updated };
}

function moveItemIdsToPlayerInventoryArray(prev: any, itemIds: string[]): any {
  // NEW behavior you requested: also push into state.player.inventory
  // Assumes inventory is an array of item ids. If yours is different, tweak here.
  const currentInv: string[] = Array.isArray(prev?.player?.inventory)
    ? prev.player.inventory
    : [];

  const invSet = new Set(currentInv);
  const nextInv = [...currentInv];
  for (const id of itemIds) {
    if (!invSet.has(id)) {
      invSet.add(id);
      nextInv.push(id);
    }
  }

  return {
    ...prev,
    player: {
      ...prev.player,
      inventory: nextInv,
    },
  };
}

export function LockerModal({
  onClose,
  state,
  setGameState,
  type,
}: LockerModalProps) {
  const [popup, setPopup] = useState<FoundPopup>({
    open: false,
    lockerIndex: 0,
    itemIds: [],
  });

  const contentsMap = (
    type === "men"
      ? state.worldState?.mensLockerContents
      : state.worldState?.womensLockerContents
  ) as Record<string, string[]>;

  const openedMap = (
    type === "men"
      ? state.worldState?.mensLockersOpened
      : state.worldState?.womensLockersOpened
  ) as Record<string, boolean>;

  const lockerModels = useMemo(() => {
    const cMap = contentsMap ?? {};
    const oMap = openedMap ?? {};
    return Array.from({ length: LOCKER_COUNT }, (_, i) => {
      const idx = i + 1;
      const lockerId = lockerIdFor(type, idx);
      const contents = cMap[lockerId] ?? [];
      const opened = Boolean(oMap[lockerId]);
      return { idx, lockerId, contents, opened };
    });
  }, [contentsMap, openedMap, type]);

  const handleLockerClick = (lockerIndex: number) => {
    const lockerId = lockerIdFor(type, lockerIndex);
    const alreadyOpened = Boolean(openedMap?.[lockerId]);
    const contents: string[] = contentsMap?.[lockerId] ?? [];

    if (alreadyOpened) {
      if (!contents?.length) appendLog(setGameState, "It's empty.");
      else setPopup({ open: true, lockerIndex, itemIds: contents });
      return;
    }

    const hasKey = playerHasKeyForLocker(state as any, type, lockerIndex);
    if (!hasKey) {
      appendLog(setGameState, "It won't budge.");
      return;
    }

    // Mark opened + move contents + clear locker
    setGameState((prev: any) => {
      let next = prev;

      const openedKey =
        type === "men" ? "mensLockersOpened" : "womensLockersOpened";
      const contentsKey =
        type === "men" ? "mensLockerContents" : "womensLockerContents";

      const prevOpened = (prev.worldState?.[openedKey] ?? {}) as Record<
        string,
        boolean
      >;

      next = {
        ...next,
        worldState: {
          ...next.worldState,
          [openedKey]: {
            ...prevOpened,
            [lockerId]: true,
          },
        },
      };

      if (contents?.length) {
        // 1) Old system: mark items as located in INVENTORY in the world list (if you use it)
        next = moveItemIdsToWorldInventoryLocation(next, contents);
        // 2) New system: push item ids into state.player.inventory
        next = moveItemIdsToPlayerInventoryArray(next, contents);
      }

      // Clear contents after opening
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          [contentsKey]: {
            ...next.worldState?.[contentsKey],
            [lockerId]: [],
          },
        },
      };

      return next;
    });

    if (contents?.length) {
      setPopup({ open: true, lockerIndex, itemIds: contents });
    } else {
      appendLog(setGameState, "It's empty.");
    }
  };

  const closePopup = () =>
    setPopup({ open: false, lockerIndex: 0, itemIds: [] });

  const title = type === "men" ? "MEN'S LOCKERS" : "WOMEN'S LOCKERS";
  const aria = type === "men" ? "Men's locker grid" : "Women's locker grid";

  return (
    <CrtModal
      title={title}
      onClose={onClose}
      width={640}
      height={520}
      showHeader={false}
    >
      <div className="ml-root">
        <div className="ml-help">Click a locker to try it.</div>

        <div className="ml-grid" role="grid" aria-label={aria}>
          {lockerModels.map(({ idx, lockerId, opened }) => {
            const isOpen = opened;
            return (
              <button
                key={lockerId}
                type="button"
                className={`ml-locker ${isOpen ? "is-open" : "is-closed"}`}
                onClick={() => handleLockerClick(idx)}
                aria-label={`Locker ${idx}${isOpen ? ", opened" : ""}`}
              >
                <div className="ml-door">
                  <div className="ml-plate" aria-hidden="true">
                    {idx}
                  </div>
                </div>

                <div className="ml-handleStrip" aria-hidden="true">
                  <div className="ml-handleBar" />
                  <div className="ml-keyhole" />
                </div>
              </button>
            );
          })}
        </div>

        {popup.open ? (
          <div
            className="ml-popupBackdrop"
            role="presentation"
            onClick={closePopup}
          >
            <div
              className="ml-popup"
              role="dialog"
              aria-modal="true"
              aria-label="Locker contents"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="ml-popupList">
                {popup.itemIds.map((id) => {
                  const name = getItemById(state, id)?.name ?? id;
                  return (
                    <li key={id} className="ml-popupItem">
                      {`Inside the locker you find a ${name}`}
                    </li>
                  );
                })}
              </ul>

              <div className="ml-popupActions">
                <button
                  type="button"
                  className="ml-popupBtn"
                  onClick={closePopup}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CrtModal>
  );
}

/**
 * Variant wrappers (optional, but handy if you still want them)
 */
export function MensLockerModal(props: Omit<LockerModalProps, "type">) {
  return <LockerModal {...props} type="men" />;
}

export function WomensLockerModal(props: Omit<LockerModalProps, "type">) {
  return <LockerModal {...props} type="women" />;
}
