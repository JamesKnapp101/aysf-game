export type HintNode = HintMenuNode | HintLeafNode;

export interface HintMenuNode {
  kind: "menu";
  id: string;
  title: string; // label in the hint list
  children: HintNode[]; // submenus and hints
}

export interface HintLeafNode {
  kind: "hint";
  id: string;
  title: string; // "Hint One", "Hint Two", ...
  description: string; // hint text
}

// UI state for a single hint tree
export interface HintUIState {
  currentPath: HintMenuNode[]; // root -> ... -> current menu
  selectedIndex: number; // index into visible entries
  activeHint?: HintLeafNode; // currently revealed hint
}

// entries for the visible list: child nodes plus synthetic Back
export type VisibleEntry = { type: "node"; node: HintNode } | { type: "back" };
