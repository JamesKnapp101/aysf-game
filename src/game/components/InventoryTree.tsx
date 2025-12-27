import React from "react";
import type { GameState } from "../types/gameTypes"; // adjust path
import type { Item } from "../types/itemTypes"; // adjust path
import { getItemById } from "../selectors/itemSelectors";
import { resolveItemByNoun } from "../rules/scope";

type InventoryTreeProps = {
  state: GameState;
  inventoryItems: Item[]; // top-level items the player is carrying
};

/**
 * Renders inventory as:
 * - item
 *   └─ contained item
 *   └─ contained item
 * - next item
 *
 * Notes:
 * - Only shows container contents if the container actually has contents in itemState.containerContents.
 * - If showContentsOnlyIfOpen is true, contents are only shown when the container is open.
 */
export function InventoryTree({ state, inventoryItems }: InventoryTreeProps) {
  const showContentsOnlyIfOpen = true;

  const getItemName = (id: string) => {
    const it = getItemById(state, id);
    let annotation = "";
    if (state.itemState.containerFilled[id]?.[0]) {
      let filledWith = state.itemState.containerFilled[id]?.[0];
      if (filledWith) {
        const liquidItem = getItemById(state, filledWith);
        if (state.itemState.frozenItems[filledWith]) {
          filledWith =
            liquidItem?.meta?.liquid?.frozenName ??
            state.itemState.containerFilled[id]?.[0];
        }
      }
      annotation = `, which is filled with ${filledWith}`;
    }
    if (it?.isWearable && it?.clothingSlot) {
      if (state.itemState.wornByPlayer[it.clothingSlot] === it.id) {
        annotation = ` (worn on your ${it.clothingSlot})`;
      }
    }
    let name = it?.name ?? "";
    const itemName = (name += annotation);
    return itemName ?? id;
  };

  const getContents = (containerId: string): string[] => {
    const ids = state.itemState.containerContents?.[containerId] ?? [];
    if (!ids.length) return [];
    if (!showContentsOnlyIfOpen) return ids;
    return state.itemState.openItems?.[containerId] ? ids : [];
  };

  const getBranchGlyph = (isLast: boolean) => (isLast ? "└─" : "├─");

  return (
    <div className="inv-tree">
      {inventoryItems.length === 0 ? (
        <p className="game-line">You are carrying nothing.</p>
      ) : (
        <>
          <p className="game-line">You are carrying:</p>
          <ul className="game-list inv-tree-list">
            {inventoryItems.map((item) => {
              const contents = item.isContainer ? getContents(item.id) : [];
              let filledWith = state.itemState.containerFilled[item.id]?.[0];
              if (filledWith) {
                const liquidItem = getItemById(state, filledWith);
                if (state.itemState.frozenItems[filledWith]) {
                  filledWith =
                    liquidItem?.meta?.liquid?.frozenName ??
                    state.itemState.containerFilled[item.id]?.[0];
                }
              }
              return (
                <li className="inv-tree-item" key={item.id}>
                  <div className="inv-tree-row">{getItemName(item.id)}</div>

                  {contents.length > 0 && (
                    <ul className="inv-tree-contents">
                      {contents.map((childId, idx) => {
                        const isLast = idx === contents.length - 1;
                        const glyph = getBranchGlyph(isLast);

                        return (
                          <li
                            className="inv-tree-child"
                            key={`${item.id}:${childId}`}
                          >
                            <span className="inv-tree-glyph" aria-hidden="true">
                              {glyph}&nbsp;
                            </span>
                            <span className="inv-tree-child-name">
                              {getItemName(childId)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
