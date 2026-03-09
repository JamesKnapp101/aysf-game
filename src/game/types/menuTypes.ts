export type MenuNode = MenuBranchNode | MenuLeafNode;

export interface MenuBranchNode {
  kind: "menu";
  id: string;
  title: string;
  children: MenuNode[];
}

export interface MenuLeafNode {
  kind: "leaf" | "hint";
  id: string;
  title: string;
  description: string;
}

export interface MenuUIState {
  currentPath: MenuBranchNode[];
  selectedIndex: number;
  activeLeaf?: MenuLeafNode;
}

export type VisibleMenuEntry =
  | { type: "node"; node: MenuNode }
  | { type: "back" };
