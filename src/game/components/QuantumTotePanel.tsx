import { InventoryTree } from "@game/components/InventoryTree";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import * as React from "react";

export type InvSort = "none" | "name-asc" | "name-desc";

export function QuantumTotePanel({
  state,
  inventoryItems,
}: {
  state: GameState;
  inventoryItems: Item[];
}) {
  const [sort, setSort] = React.useState<InvSort>("none");

  const itemCount = inventoryItems.length;

  const cycleSort = () => {
    setSort((s) =>
      s === "none" ? "name-asc" : s === "name-asc" ? "name-desc" : "none",
    );
  };

  const sortLabel =
    sort === "none" ? "Sort" : sort === "name-asc" ? "Name ↑" : "Name ↓";

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
              gap: 12,
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
              <span className="qtote-brand-main" style={{ fontWeight: 700 }}>
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
          <div
            className="qtote-toolbar"
            style={{
              border: "2px solid currentColor",
              borderRadius: 12,
              padding: "5px 7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flex: "0 0 auto",
            }}
          >
            <div className="qtote-count" style={{ whiteSpace: "nowrap" }}>
              Item Count: {itemCount}
            </div>

            <button
              className="qtote-sortBtn"
              onClick={cycleSort}
              type="button"
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                font: "inherit",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                opacity: 0.95,
                whiteSpace: "nowrap",
                marginRight: "13px",
                fontSize: "14px",
              }}
              aria-label="Change inventory sort order"
              title="Cycle sort: none → name ascending → name descending"
            >
              {sortLabel}
            </button>
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
                inventoryItems={inventoryItems}
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
            Infinite Space. &nbsp;Zero Weight. &nbsp;OmniTote.
          </div>
        </div>
      </div>
    </div>
  );
}
