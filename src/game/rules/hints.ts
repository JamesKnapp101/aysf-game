import { getVisibleEntries } from "../selectors/hintSelectors";
import type { HintMenuNode, HintUIState } from "../types/hintTypes";

export function createInitialHintState(rootMenu: HintMenuNode): HintUIState {
  return {
    currentPath: [rootMenu],
    selectedIndex: 0,
    activeHint: undefined,
  };
}

export function moveSelection(state: HintUIState, delta: 1 | -1): HintUIState {
  const entries = getVisibleEntries(state);
  if (entries.length === 0) return state;

  const maxIndex = entries.length - 1;
  let nextIndex = state.selectedIndex + delta;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex > maxIndex) nextIndex = maxIndex;

  return {
    ...state,
    selectedIndex: nextIndex,
  };
}

export function activateSelection(state: HintUIState): HintUIState {
  const entries = getVisibleEntries(state);
  const current = entries[state.selectedIndex];
  if (!current) return state;

  if (current.type === "back") {
    // Pop one menu from the stack
    if (state.currentPath.length <= 1) return state;

    const newPath = state.currentPath.slice(0, -1);
    return {
      ...state,
      currentPath: newPath,
      selectedIndex: 0,
      activeHint: undefined,
    };
  }

  const node = current.node!;
  if (node.kind === "menu") {
    // Drill into submenu
    return {
      ...state,
      currentPath: [...state.currentPath, node],
      selectedIndex: 0,
      activeHint: undefined,
    };
  }

  // Leaf node: show hint text
  return {
    ...state,
    activeHint: node,
  };
}

// For clicking a specific entry index (mouse support)
export function activateByIndex(
  state: HintUIState,
  index: number
): HintUIState {
  const entries = getVisibleEntries(state);
  if (index < 0 || index >= entries.length) return state;

  return activateSelection({
    ...state,
    selectedIndex: index,
  });
}
