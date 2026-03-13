export type MenuNode = MenuBranchNode | MenuLeafNode;

export interface MenuBranchNode {
  children: MenuNode[];
  id: string;
  kind: "menu";
  title: string;
}

export interface MenuLeafNode {
  description: string;
  id: string;
  kind: "leaf" | "hint";
  title: string;
}

export interface MenuUIState {
  activeLeaf?: MenuLeafNode;
  currentPath: MenuBranchNode[];
  selectedIndex: number;
}

export type VisibleMenuEntry =
  | { type: "node"; node: MenuNode }
  | { type: "back" };
