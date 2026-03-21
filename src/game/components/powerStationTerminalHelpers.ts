import { POWER_SECTION_MAP } from "../constants";
import type { WorldState } from "../types/gameTypes";
import type { SwitchState, SwitchStates } from "../types/itemTypes";

export type SwitchStatus = SwitchState | "unknown";

type NodeBase = {
  id: string;
  label: string;
};

export type MenuTreeNode = NodeBase & {
  kind: "menu";
  children: TreeNode[];
};

export type SwitchNode = NodeBase & {
  kind: "switch";
};

export type StaticNode = NodeBase & {
  kind: "static";
  status: SwitchState;
};

export type OptionNode = SwitchNode | StaticNode;
export type TreeNode = MenuTreeNode | OptionNode;
export type Breadcrumb = { node: MenuTreeNode; selectedIndex: number };
export type BackNode = { id: "__back__"; kind: "back"; label: "BACK" };
export type PowerListItem = TreeNode | BackNode;

export function isMenu(node: TreeNode): node is MenuTreeNode {
  return node.kind === "menu";
}

export function isToggleable(node: TreeNode): node is SwitchNode {
  return node.kind === "switch";
}

export function isBackNode(item: PowerListItem): item is BackNode {
  return item.kind === "back";
}

export function statusText(status: SwitchStatus): string {
  switch (status) {
    case "on":
      return "ON";
    case "off":
      return "OFF";
    case "locked":
      return "LOCKED";
    case "failure":
      return "FAIL";
    default:
      return "--";
  }
}

export function statusGlyph(status: SwitchStatus): string {
  switch (status) {
    case "on":
      return "\u25CF";
    case "off":
      return "\u25CB";
    case "locked":
    case "failure":
      return "\u2716";
    default:
      return "\u2022";
  }
}

export function stripParenNotes(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, "");
}

export function buildInitialSwitchStates(worldState: WorldState): SwitchStates {
  const nextStates = {} as SwitchStates;

  walkTree(POWER_GRID_ROOT, (node) => {
    if (!isToggleable(node)) return;

    const config = POWER_SECTION_MAP[node.id];
    if (!config) {
      nextStates[node.id] = "off";
      return;
    }

    const section = config.section as keyof typeof worldState.powerRestoredSections;
    const isActive = worldState.powerRestoredSections[section];
    nextStates[node.id] = isActive
      ? config.activeWhen
      : invertSwitchState(config.activeWhen);
  });

  return nextStates;
}

export function getListItems(
  currentMenu: MenuTreeNode,
  depth: number,
): PowerListItem[] {
  if (depth > 1) {
    return [
      ...currentMenu.children,
      { id: "__back__", kind: "back", label: "BACK" },
    ];
  }

  return currentMenu.children;
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export function getBreadcrumbText(path: Breadcrumb[]): string {
  if (path.length === 1) return "MENU";
  return path.map((crumb) => crumb.node.label).join(" / ");
}

export function getNodeStatus(
  node: OptionNode,
  switchStates: SwitchStates,
): SwitchStatus {
  if (node.kind === "static") return node.status;
  return switchStates[node.id] ?? "unknown";
}

export function canToggleNode(
  node: TreeNode,
  switchStates: SwitchStates,
): boolean {
  if (!isToggleable(node)) return false;
  const status = switchStates[node.id] ?? "unknown";
  return status !== "locked" && status !== "failure";
}

export function applyPowerFromSwitches(
  worldState: WorldState,
  switchStates: SwitchStates,
): WorldState {
  let didChange = false;
  const nextPower = { ...worldState.powerRestoredSections };

  for (const [switchId, config] of Object.entries(POWER_SECTION_MAP)) {
    const value = switchStates[switchId];
    if (!value) continue;

    const section = config.section as keyof typeof nextPower;
    const nextValue = value === config.activeWhen;
    if (nextPower[section] === nextValue) continue;

    nextPower[section] = nextValue;
    didChange = true;
  }

  if (!didChange) return worldState;

  return {
    ...worldState,
    powerRestoredSections: nextPower,
  };
}

function invertSwitchState(state: SwitchState): SwitchState {
  if (state === "on") return "off";
  if (state === "off") return "on";
  return "off";
}

function walkTree(node: TreeNode, visit: (node: TreeNode) => void): void {
  visit(node);
  if (!isMenu(node)) return;
  node.children.forEach((child) => walkTree(child, visit));
}

export const POWER_GRID_ROOT: MenuTreeNode = {
  id: "power_grid_menu",
  kind: "menu",
  label: "Main Power Distribution",
  children: [
    {
      id: "teleportNetwork",
      kind: "menu",
      label: "TELEPORTATION",
      children: [
        { id: "TPADPOWER1", kind: "switch", label: "Green Network" },
        { id: "TPADPOWER2", kind: "switch", label: "White Network" },
        { id: "TPADPOWER3", kind: "switch", label: "Blue Network" },
        { id: "TPADPOWER4", kind: "switch", label: "Yellow Network" },
        { id: "TPADPOWER5", kind: "switch", label: "Brown Network" },
        { id: "TPADPOWER6", kind: "switch", label: "Grey Network" },
      ],
    },
    {
      id: "lvl1",
      kind: "menu",
      label: "LEVEL ONE",
      children: [
        { id: "Lvl1Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl1Lights", kind: "switch", label: "Level One Lights" },
        {
          id: "Lvl1Sheilds",
          kind: "static",
          label: "Main Shields (locked: Bridge access only)",
          status: "locked",
        },
        {
          id: "Elevators",
          kind: "static",
          label: "Elevators (system failure)",
          status: "failure",
        },
        {
          id: "Lvl1Weapons",
          kind: "switch",
          label: "Primary Weapons System",
        },
      ],
    },
    {
      id: "lvl2",
      kind: "menu",
      label: "LEVEL TWO",
      children: [
        { id: "Lvl2Grav", kind: "switch", label: "Artificial Gravity Field" },
        {
          id: "Lvl2Lights",
          kind: "static",
          label: "Level Two Lights (system failure)",
          status: "failure",
        },
      ],
    },
    {
      id: "lvl3",
      kind: "menu",
      label: "LEVEL THREE",
      children: [
        { id: "Lvl3Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl3Lights", kind: "switch", label: "Level Three Lights" },
        { id: "ParkSecurity", kind: "switch", label: "Park Security" },
        { id: "Lvl3Terminal", kind: "switch", label: "Library Terminals" },
      ],
    },
    {
      id: "lvl4",
      kind: "menu",
      label: "LEVEL FOUR",
      children: [
        { id: "Lvl4Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl4Lights", kind: "switch", label: "Level Four Lights" },
      ],
    },
    {
      id: "lvl5",
      kind: "menu",
      label: "LEVEL FIVE",
      children: [
        { id: "Lvl5Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl5Lights", kind: "switch", label: "Level Five Lights" },
        { id: "ECore", kind: "switch", label: "Engine Core Power Lock" },
      ],
    },
    {
      id: "lvl6",
      kind: "menu",
      label: "LEVEL SIX",
      children: [
        { id: "Lvl6Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl6Lights", kind: "switch", label: "Level Six Lights" },
        { id: "LoadDockDoor", kind: "switch", label: "Loading Dock Door" },
        { id: "LoadGrid", kind: "switch", label: "Loading Grid" },
      ],
    },
    {
      id: "lvl7",
      kind: "menu",
      label: "LEVEL SEVEN",
      children: [
        { id: "Lvl7Grav", kind: "switch", label: "Artificial Gravity Field" },
        { id: "Lvl7Lights", kind: "switch", label: "Level Seven Lights" },
        { id: "CryoLabs", kind: "switch", label: "Cryonics Laboratory" },
        { id: "Sleepers", kind: "switch", label: "Cryonics Sleep Chambers" },
      ],
    },
  ],
};
