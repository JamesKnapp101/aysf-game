export type HintNode = HintMenuNode | HintLeafNode;

export interface HintMenuNode {
  kind: "menu";
  id: string;
  title: string;
  children: HintNode[];
}

export interface HintLeafNode {
  kind: "hint";
  id: string;
  title: string;
  description: string;
}

export interface HintUIState {
  currentPath: HintMenuNode[];
  selectedIndex: number;
  activeHint?: HintLeafNode;
}

export type VisibleEntry = { type: "node"; node: HintNode } | { type: "back" };
