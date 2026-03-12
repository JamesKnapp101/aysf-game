import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVisibleMenuEntries } from "../selectors/menuSelectors";
import {
  activateByIndex,
  createInitialMenuState,
  moveSelection,
} from "../rules/menu";
import type {
  MenuBranchNode,
  MenuLeafNode,
  MenuUIState,
  VisibleMenuEntry,
} from "../types/menuTypes";

type MenuProps = {
  rootMenu: MenuBranchNode;
  emptyDetailMessage?: string;
  onLeafActivated?: (leaf: MenuLeafNode) => void;
};

export const Menu: React.FC<MenuProps> = ({
  rootMenu,
  emptyDetailMessage = "Select an item to see more information.",
  onLeafActivated,
}) => (
  <MenuInner
    key={rootMenu.id}
    rootMenu={rootMenu}
    emptyDetailMessage={emptyDetailMessage}
    onLeafActivated={onLeafActivated}
  />
);

function MenuInner({
  rootMenu,
  emptyDetailMessage = "Select an item to see more information.",
  onLeafActivated,
}: MenuProps) {
  const [state, setState] = useState<MenuUIState>(() =>
    createInitialMenuState(rootMenu),
  );

  const entries: VisibleMenuEntry[] = useMemo(
    () => getVisibleMenuEntries(state),
    [state],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const currentMenu = state.currentPath[state.currentPath.length - 1];

  const activateEntry = useCallback(
    (index: number) => {
      const entry = entries[index];
      if (entry?.type === "node" && entry.node.kind !== "menu") {
        onLeafActivated?.(entry.node);
      }

      setState((prev) => activateByIndex(prev, index));
    },
    [entries, onLeafActivated],
  );

  const activateCurrentSelection = useCallback(() => {
    activateEntry(state.selectedIndex);
  }, [activateEntry, state.selectedIndex]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setState((prev) => moveSelection(prev, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setState((prev) => moveSelection(prev, 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateCurrentSelection();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (state.currentPath.length <= 1) return;

      const backIndex = entries.length - 1;
      const hasBack = entries[backIndex]?.type === "back";
      if (!hasBack) return;

      activateEntry(backIndex);
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="hints-tab-container"
    >
      <div className="hints-breadcrumb">
        <p className="crt-color-header">{currentMenu.title}</p>
      </div>
      <div className="hints-menu">
        <ul className="hints-menu-list">
          {entries.map((entry, idx) => {
            const isSelected = idx === state.selectedIndex;
            const label = entry.type === "back" ? "BACK" : entry.node.title;

            return (
              <li
                key={entry.type === "back" ? "back" : entry.node.id}
                className={
                  "hints-menu-item" +
                  (isSelected ? " hints-menu-item--selected" : "")
                }
                onMouseEnter={() =>
                  setState((prev) => ({
                    ...prev,
                    selectedIndex: idx,
                  }))
                }
                onClick={() => activateEntry(idx)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="hints-detail">
        {state.activeLeaf ? (
          <>
            <div className="hints-detail-title">{state.activeLeaf.title}</div>
            <div className="hints-detail-body">
              {state.activeLeaf.description}
            </div>
          </>
        ) : (
          <div className="hints-detail-empty">{emptyDetailMessage}</div>
        )}
      </div>
    </div>
  );
}
