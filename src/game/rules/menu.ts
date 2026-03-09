import { getVisibleMenuEntries } from "../selectors/menuSelectors";
import type { MenuBranchNode, MenuUIState } from "../types/menuTypes";

export function createInitialMenuState(rootMenu: MenuBranchNode): MenuUIState {
  return {
    currentPath: [rootMenu],
    selectedIndex: 0,
    activeLeaf: undefined,
  };
}

export function moveSelection(state: MenuUIState, delta: 1 | -1): MenuUIState {
  const entries = getVisibleMenuEntries(state);
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

export function activateSelection(state: MenuUIState): MenuUIState {
  const entries = getVisibleMenuEntries(state);
  const current = entries[state.selectedIndex];
  if (!current) return state;

  if (current.type === "back") {
    if (state.currentPath.length <= 1) return state;

    const newPath = state.currentPath.slice(0, -1);
    return {
      ...state,
      currentPath: newPath,
      selectedIndex: 0,
      activeLeaf: undefined,
    };
  }

  const node = current.node;
  if (node.kind === "menu") {
    return {
      ...state,
      currentPath: [...state.currentPath, node],
      selectedIndex: 0,
      activeLeaf: undefined,
    };
  }

  return {
    ...state,
    activeLeaf: node,
  };
}

export function activateByIndex(
  state: MenuUIState,
  index: number,
): MenuUIState {
  const entries = getVisibleMenuEntries(state);
  if (index < 0 || index >= entries.length) return state;

  return activateSelection({
    ...state,
    selectedIndex: index,
  });
}
