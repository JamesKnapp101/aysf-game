import React from "react";
import type { GameState } from "../types/gameTypes"; // adjust path
import type { Item } from "../types/itemTypes"; // adjust path
import { getItemById } from "../selectors/itemSelectors";

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
    return it?.name ?? id;
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

              return (
                <li className="inv-tree-item" key={item.id}>
                  <div className="inv-tree-row">{item.name}</div>

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
