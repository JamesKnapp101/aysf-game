import type { HintUIState, VisibleEntry } from "../types/hintTypes";

export function getVisibleEntries(state: HintUIState): VisibleEntry[] {
  const currentMenu = state.currentPath[state.currentPath.length - 1];

  const entries: VisibleEntry[] = currentMenu.children.map((child) => ({
    type: "node",
    node: child,
  }));

  if (state.currentPath.length > 1) {
    entries.push({ type: "back" });
  }

  return entries;
}
