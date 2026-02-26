import { InventoryTree } from "@game/components/InventoryTree";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import * as React from "react";
import "../../styles/quantum-folder.css";

export type InvSort = "none" | "name-asc" | "name-desc";

export function QuantumTotePanel({
  state,
  inventoryItems,
}: {
  state: GameState;
  inventoryItems: Item[];
}) {
  const [sort, setSort] = React.useState<InvSort>("none");
  const [activeTab, setActiveTab] = React.useState<
    "general" | "badges" | "keys"
  >("general");

  const activeIds = state.player.inventory[activeTab] ?? [];
  const activeItems: Item[] = React.useMemo(() => {
    const itemsById = new Map(
      state.world.items.map((it) => [it.id, it] as const),
    );
    return activeIds.map((id) => itemsById.get(id)).filter(Boolean) as Item[];
  }, [state.world.items, activeIds]);

  const counts = {
    general: state.player.inventory.general.length,
    badges: state.player.inventory.badges.length,
    keys: state.player.inventory.keys.length,
  };

  const totalCount = counts.general + counts.badges + counts.keys;

  const cycleSort = () => {
    setSort((s) =>
      s === "none" ? "name-asc" : s === "name-asc" ? "name-desc" : "none",
    );
  };

  const sortLabel =
    sort === "none" ? "Sort" : sort === "name-asc" ? "Name ↑" : "Name ↓";

  const tabLabel = (t: typeof activeTab) => {
    if (t === "general") return "General";
    if (t === "badges") return "Badges";
    return "Keys";
  };

  return (
    <div
      className="qtote"
      style={{
        height: "98%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Outer frame */}
      <div
        className="qtote-frameOuter"
        style={{
          border: "2px solid currentColor",
          borderRadius: 18,
          padding: 6,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Inner frame */}
        <div
          className="qtote-frameInner"
          style={{
            border: "2px solid currentColor",
            borderRadius: 16,
            padding: 6,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "hidden",
          }}
        >
          {/* Top branding row */}
          <div
            className="qtote-top"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <div
              className="qtote-brand"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span
                className="qtote-brand-main"
                style={{ fontWeight: 700, padding: "2px", paddingLeft: "2px" }}
              >
                OMNI
              </span>
              <span
                className="qtote-brand-sub"
                style={{ fontSize: 18, fontWeight: 700, opacity: 0.95 }}
              >
                TOTE
              </span>
            </div>

            <div
              className="qtote-title"
              style={{
                textAlign: "right",
                lineHeight: 1,
              }}
            >
              Quantum Escher Field <span className="qtote-tm">™</span>
            </div>
          </div>

          {/* Toolbar pill */}
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

              {/* <div className="qtote-tabsMeta" aria-hidden="true">
                Total: {totalCount}
              </div> */}
            </div>
            <div className="qtote-total" aria-hidden="true">
              Total: {totalCount}
            </div>
            {/* <button className="qtote-sortBtn" onClick={cycleSort} type="button">
              {sortLabel}
            </button> */}
          </div>

          {/* Screen frame */}
          <div
            className="qtote-screenFrame"
            style={{
              border: "2px solid currentColor",
              borderRadius: 16,
              padding: 12,
              flex: "1 1 auto",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div
              className="qtote-screen"
              style={{
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 8,
              }}
            >
              <InventoryTree
                state={state}
                inventoryItems={activeItems}
                sort={sort}
              />
            </div>
          </div>

          {/* Footer tagline */}
          <div
            className="qtote-footer"
            style={{
              flex: "0 0 auto",
              padding: "0 6px",
              opacity: 0.95,
              whiteSpace: "nowrap",
            }}
          >
            Infinite Space. &nbsp;Zero Weight.
          </div>
        </div>
      </div>
    </div>
  );
}
