import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  createInitialHintState,
  getVisibleEntries,
} from "../game/selectors/hintSelectors";
import type {
  HintMenuNode,
  HintUIState,
  VisibleEntry,
} from "../game/types/hintTypes";
import {
  activateByIndex,
  activateSelection,
  moveSelection,
} from "../game/rules/hints";

interface HintsTabProps {
  rootMenu: HintMenuNode;
}

export const HintsTab: React.FC<HintsTabProps> = ({ rootMenu }) => {
  const [state, setState] = useState<HintUIState>(() =>
    createInitialHintState(rootMenu)
  );

  // Reset state when we switch to a different hint tree (e.g., new level)
  useEffect(() => {
    setState(createInitialHintState(rootMenu));
  }, [rootMenu.id]);

  const entries: VisibleEntry[] = useMemo(
    () => getVisibleEntries(state),
    [state]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Optional: auto-focus the tab when mounted so arrow keys work immediately
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const currentMenu = state.currentPath[state.currentPath.length - 1];

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setState((prev) => moveSelection(prev, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setState((prev) => moveSelection(prev, 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setState((prev) => activateSelection(prev));
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Treat Escape as "Back" if possible
      setState((prev) => {
        if (prev.currentPath.length <= 1) return prev;
        // simulate selecting the Back entry (last index)
        const entries = getVisibleEntries(prev);
        const backIndex = entries.length - 1;
        const hasBack = entries[backIndex]?.type === "back";
        if (!hasBack) return prev;

        return activateByIndex(prev, backIndex);
      });
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="hints-tab-container"
    >
      {/* Breadcrumb / path */}
      <div className="hints-breadcrumb">
        <p className="crt-color-header">{currentMenu.title}</p>
      </div>
      {/* Menu list */}
      <div className="hints-menu">
        <ul className="hints-menu-list">
          {entries.map((entry, idx) => {
            const isSelected = idx === state.selectedIndex;
            const label = entry.type === "back" ? "BACK" : entry.node!.title;

            return (
              <li
                key={entry.type === "back" ? "back" : entry.node!.id}
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
                onClick={() => setState((prev) => activateByIndex(prev, idx))}
              >
                {label}
              </li>
            );
          })}
        </ul>
      </div>
      {/* Active hint content */}
      <div className="hints-detail">
        {state.activeHint ? (
          <>
            <div className="hints-detail-title">{state.activeHint.title}</div>
            <div className="hints-detail-body">
              {state.activeHint.description}
            </div>
          </>
        ) : (
          <div className="hints-detail-empty">
            Select a hint to see more information.
          </div>
        )}
      </div>
    </div>
  );
};
