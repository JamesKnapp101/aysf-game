import { getItemById } from "../selectors/itemSelectors";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";

type InventoryTreeProps = {
  state: GameState;
  inventoryItems: Item[];
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

  const startsWithVowelSound = (word: string) => {
    const w = word.trim().toLowerCase();
    if (
      w.startsWith("hour") ||
      w.startsWith("honest") ||
      w.startsWith("heir") ||
      w.startsWith("led")
    )
      return true;
    if (w.startsWith("uni") || w.startsWith("use") || w.startsWith("euro"))
      return false;
    return /^[aeiou]/.test(w);
  };

  const withIndefiniteArticle = (name: string) => {
    const n = name.trim();
    if (!n) return n;

    if (/^(a|an|the|some|your)\b/i.test(n)) return n;

    const article = startsWithVowelSound(n) ? "an" : "a";
    return `${article} ${n}`;
  };

  const isSwitchable = (id: string) => {
    const s = state.itemState.itemSettings?.[id];
    return Boolean(s && typeof (s as any).isOn === "boolean");
  };

  const isOn = (id: string) => {
    const s = state.itemState.itemSettings?.[id];
    return Boolean(
      s && typeof (s as any).isOn === "boolean" && (s as any).isOn
    );
  };

  const getItemLabel = (id: string) => {
    const it = getItemById(state, id);
    const baseName = withIndefiniteArticle(it?.name ?? id);
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
    if (isSwitchable(id) && isOn(id)) {
      annotation += ` (which is on)`;
    }

    return `${baseName}${annotation}`;
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
                  <div className="inv-tree-row">{getItemLabel(item.id)}</div>

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
