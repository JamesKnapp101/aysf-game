import type { MenuUIState, VisibleMenuEntry } from "../types/menuTypes";

export function getVisibleMenuEntries(state: MenuUIState): VisibleMenuEntry[] {
  const currentMenu = state.currentPath[state.currentPath.length - 1];

  const entries: VisibleMenuEntry[] = currentMenu.children.map((child) => ({
    type: "node",
    node: child,
  }));

  if (state.currentPath.length > 1) {
    entries.push({ type: "back" });
  }

  return entries;
}
