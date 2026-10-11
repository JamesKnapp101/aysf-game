import {
  getInventoryItemLabel,
  getInventoryVisibleContents,
} from "../text/inventoryPresentation";
import { getItemById } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

export type InvSort = "none" | "name-asc" | "name-desc";
type InventoryTreeProps = {
  state: GameState;
  inventoryItems: Item[];
  sort?: InvSort;
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
 * - Contents are only shown when the container is open.
 */

export function InventoryTree({
  state,
  inventoryItems,
  sort,
}: InventoryTreeProps) {
  const getSortName = (id: string) => {
    const it = getItemById(state, id);
    return (it?.named?.(state, it) ?? it?.name ?? id).trim().toLowerCase();
  };

  const isContainerId = (id: string) =>
    Boolean(getItemById(state, id)?.isContainer);

  const sortIds = (ids: string[]) => {
    if (!sort || sort === "none") return ids;

    const dir = sort === "name-asc" ? 1 : -1;

    const copy = [...ids];
    copy.sort((a, b) => {
      // Containers first (file-explorer style)
      const ac = isContainerId(a) ? 0 : 1;
      const bc = isContainerId(b) ? 0 : 1;
      if (ac !== bc) return ac - bc;

      const an = getSortName(a);
      const bn = getSortName(b);
      if (an < bn) return -1 * dir;
      if (an > bn) return 1 * dir;

      // tie-breaker for stability
      return a.localeCompare(b) * dir;
    });

    return copy;
  };

  const getItemLabel = (id: string) => getInventoryItemLabel(state, id);

  const getBranchGlyph = (isLast: boolean) => (isLast ? "└─" : "├─");

  const topIds = sortIds(inventoryItems.map((it) => it.id));

  return (
    <div className="inv-tree">
      {inventoryItems.length === 0 ? (
        <p className="game-line"></p>
      ) : (
        <>
          <ul className="game-list inv-tree-list">
            {topIds.map((itemId) => {
              const item = getItemById(state, itemId);
              if (!item) return null;

              const contents = getInventoryVisibleContents(state, item).map((child) => child.id);
              const sortedContents = sortIds(contents);

              return (
                <li className="inv-tree-item" key={item.id}>
                  <div className="inv-tree-row">{getItemLabel(item.id)}</div>

                  {sortedContents.length > 0 && (
                    <ul className="inv-tree-contents">
                      {sortedContents.map((childId, idx) => {
                        if (!getItemById(state, childId)) return null;
                        const isLast = idx === sortedContents.length - 1;
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
                              {getItemLabel(childId)}
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
