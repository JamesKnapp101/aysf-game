import { InventoryTree } from "@game/components/InventoryTree";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import * as React from "react";
import "../../styles/quantum-folder.css";

export type InvSort = "none" | "name-asc" | "name-desc";
const EMPTY_ITEM_IDS: string[] = [];

export function QuantumTotePanel({
  state,
}: {
  state: GameState;
  inventoryItems: Item[];
}) {
  const sort: InvSort = "none";
  const [activeTab, setActiveTab] = React.useState<
    "general" | "badges" | "keys"
  >("general");

  const activeIds = state.player.inventory[activeTab] ?? EMPTY_ITEM_IDS;
  const itemsById = React.useMemo(
    () => new Map(state.world.items.map((it) => [it.id, it] as const)),
    [state.world.items],
  );
  const getItemsForIds = React.useCallback(
    (ids: readonly string[]): Item[] =>
      ids.map((id) => itemsById.get(id)).filter(Boolean) as Item[],
    [itemsById],
  );

  const activeItems: Item[] = React.useMemo(() => {
    return getItemsForIds(activeIds);
  }, [activeIds, getItemsForIds]);

  const counts = {
    general: state.player.inventory.general.length,
    badges: state.player.inventory.badges.length,
    keys: state.player.inventory.keys.length,
  };

  const totalCount = counts.general + counts.badges + counts.keys;
  const tabLabel = (t: typeof activeTab) => {
    if (t === "general") return "General";
    if (t === "badges") return "Badges";
    return "Keys";
  };

  return (
    <div className="qtote" style={{ height: "98%" }}>
      <div className="qtote-frameOuter">
        <div className="qtote-frameInner">
          <div className="qtote-top">
            <div className="qtote-brand">
              <span className="qtote-brand-main">OMNI</span>
              <span className="qtote-brand-sub">TOTE</span>
            </div>

            <div className="qtote-title">
              Quantum Escher Field <span className="qtote-tm">&trade;</span>
            </div>
          </div>

          <div className="qtote-toolbar">
            <div className="qtote-tabRow">
              <div
                className="qtote-tabs"
                role="tablist"
                aria-label="Inventory tabs"
              >
                {(["general", "badges", "keys"] as const).map((t) => {
                  const isActive = t === activeTab;
                  const count = counts[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`qtote-tab ${isActive ? "isActive" : ""}`}
                      onClick={() => setActiveTab(t)}
                      title={`${tabLabel(t)} (${count})`}
                    >
                      {tabLabel(t)}{" "}
                      <span className="qtote-tabCount">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="qtote-total" aria-hidden="true">
              Total: {totalCount}
            </div>
          </div>

          <div className="qtote-screenFrame">
            <div className="qtote-screen">
              <InventoryTree
                state={state}
                inventoryItems={activeItems}
                sort={sort}
              />
            </div>
          </div>

          <div className="qtote-footer">
            Infinite Space. &nbsp;Zero Weight.
          </div>
        </div>
      </div>
    </div>
  );
}
