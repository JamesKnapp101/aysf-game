import { CrtModal } from "@game/components/CrtModal";
import { getLockerModels, lockerFoundText, openLocker, type LockerType } from "@game/rules/lockers";
import type { GameState } from "@game/types/gameTypes";
import React, { useState } from "react";
import "../../styles/components/locker-modal.css";

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

  const lockerModels = getLockerModels(state, type);

  const handleLockerClick = async (lockerIndex: number) => {
    const result = await new Promise<ReturnType<typeof openLocker>>((resolve) => {
      setGameState((previous) => {
        const opened = openLocker(previous, type, lockerIndex);
        resolve(opened);
        return opened.state;
      });
    });
    if (result.foundItemIds.length) {
      setPopup({ open: true, lockerIndex, itemIds: result.foundItemIds });
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
                  return (
                    <li key={id} className="ml-popupItem">
                      {lockerFoundText(state, id)}
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
