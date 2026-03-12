import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/power-station-terminal.css";
import { POWER_SECTION_MAP } from "../constants";
import type { GameState, WorldState } from "../types/gameTypes";
import { SwitchStates } from "../types/itemTypes";
import { CrtModal } from "./CrtModal";

type SwitchKind = "switch" | "static";
type SwitchStatus = "on" | "off" | "locked" | "failure" | "unknown";

type NodeBase = {
  id: string;
  label: string;
};

type MenuNode = NodeBase & {
  kind: "menu";
  children: TreeNode[];
};

type OptionNode = NodeBase & {
  kind: SwitchKind;
  status: SwitchStatus;
};

type TreeNode = MenuNode | OptionNode;

type Props = {
  onClose: () => void;
  state: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
};

function isMenu(n: TreeNode): n is MenuNode {
  return n.kind === "menu";
}

function isToggleable(n: TreeNode): n is OptionNode {
  return n.kind === "switch";
}

function statusText(n: TreeNode): string {
  if (isMenu(n)) return "";
  switch (n.status) {
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

function statusGlyph(n: TreeNode): string {
  if (isMenu(n)) return "▶";
  switch (n.status) {
    case "on":
      return "●";
    case "off":
      return "○";
    case "locked":
      return "✖";
    case "failure":
      return "✖";
    default:
      return "•";
  }
}

function normalizeLabelToStatus(label: string): SwitchStatus {
  const lower = label.toLowerCase();
  if (lower.includes("locked")) return "locked";
  if (lower.includes("system failure")) return "failure";
  // default to a valid switch state instead of "unknown"
  return "off";
}

function stripParenNotes(label: string) {
  return label.replace(/\s*\([^)]*\)\s*$/, "");
}

function buildPowerGridTree(state: GameState): MenuNode {
  return {
    id: "power_grid_menu",
    kind: "menu",
    label: "Main Power Distribution",
    children: [
      {
        id: "teleportNetwork",
        kind: "menu",
        label: "TELEPORTATION",
        children: [
          {
            id: "TPADPOWER1",
            kind: "switch",
            label: "Green Network",
            status: state.worldState.powerRestoredSections[
              "teleport-pads-green"
            ]
              ? "on"
              : "off",
          },
          {
            id: "TPADPOWER2",
            kind: "switch",
            label: "White Network",
            status: state.worldState.powerRestoredSections[
              "teleport-pads-white"
            ]
              ? "on"
              : "off",
          },
          {
            id: "TPADPOWER3",
            kind: "switch",
            label: "Blue Network",
            status: state.worldState.powerRestoredSections["teleport-pads-blue"]
              ? "on"
              : "off",
          },
          {
            id: "TPADPOWER4",
            kind: "switch",
            label: "Yellow Network",
            status: state.worldState.powerRestoredSections[
              "teleport-pads-yellow"
            ]
              ? "on"
              : "off",
          },
          {
            id: "TPADPOWER5",
            kind: "switch",
            label: "Brown Network",
            status: state.worldState.powerRestoredSections[
              "teleport-pads-violet"
            ]
              ? "on"
              : "off",
          },
          {
            id: "TPADPOWER6",
            kind: "switch",
            label: "Grey Network",
            status: state.worldState.powerRestoredSections[
              "teleport-pads-maroon"
            ]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl1",
        kind: "menu",
        label: "LEVEL ONE",
        children: [
          {
            id: "Lvl1Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections["gravity-level-one"]
              ? "on"
              : "off",
          },
          {
            id: "Lvl1Lights",
            kind: "switch",
            label: "Level One Lights",
            status: state.worldState.powerRestoredSections["lights-level-one"]
              ? "on"
              : "off",
          },
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
            status: state.worldState.powerRestoredSections["weapons-system"]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl2",
        kind: "menu",
        label: "LEVEL TWO",
        children: [
          {
            id: "Lvl2Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections["gravity-level-two"]
              ? "on"
              : "off",
          },
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
          {
            id: "Lvl3Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections[
              "gravity-level-three"
            ]
              ? "on"
              : "off",
          },
          {
            id: "Lvl3Lights",
            kind: "switch",
            label: "Level Three Lights",
            status: state.worldState.powerRestoredSections["lights-level-three"]
              ? "on"
              : "off",
          },

          {
            id: "ParkSecurity",
            kind: "switch",
            label: "Park Security",
            status: state.worldState.powerRestoredSections["park-security"]
              ? "on"
              : "off",
          },
          {
            id: "Lvl3Terminal",
            kind: "switch",
            label: "Library Terminals",
            status: state.worldState.powerRestoredSections["library-power"]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl4",
        kind: "menu",
        label: "LEVEL FOUR",
        children: [
          {
            id: "Lvl4Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections["gravity-level-four"]
              ? "on"
              : "off",
          },
          {
            id: "Lvl4Lights",
            kind: "switch",
            label: "Level Four Lights",
            status: state.worldState.powerRestoredSections["lights-level-four"]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl5",
        kind: "menu",
        label: "LEVEL FIVE",
        children: [
          {
            id: "Lvl5Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections["gravity-level-five"]
              ? "on"
              : "off",
          },
          {
            id: "Lvl5Lights",
            kind: "switch",
            label: "Level Five Lights",
            status: state.worldState.powerRestoredSections["lights-level-five"]
              ? "on"
              : "off",
          },
          {
            id: "ECore",
            kind: "switch",
            label: "Engine Core Power Lock",
            status: state.worldState.powerRestoredSections[
              "engine-room-power-lock"
            ]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl6",
        kind: "menu",
        label: "LEVEL SIX",
        children: [
          {
            id: "Lvl6Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections["gravity-level-six"]
              ? "on"
              : "off",
          },
          {
            id: "Lvl6Lights",
            kind: "switch",
            label: "Level Six Lights",
            status: state.worldState.powerRestoredSections["lights-level-six"]
              ? "on"
              : "off",
          },

          {
            id: "LoadDockDoor",
            kind: "switch",
            label: "Loading Dock Door",
            status: state.worldState.powerRestoredSections["loading-dock-door"]
              ? "on"
              : "off",
          },
          {
            id: "LoadGrid",
            kind: "switch",
            label: "Loading Grid",
            status: state.worldState.powerRestoredSections["loading-grid"]
              ? "on"
              : "off",
          },
        ],
      },
      {
        id: "lvl7",
        kind: "menu",
        label: "LEVEL SEVEN",
        children: [
          {
            id: "Lvl7Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: state.worldState.powerRestoredSections[
              "gravity-level-seven"
            ]
              ? "on"
              : "off",
          },
          {
            id: "Lvl7Lights",
            kind: "switch",
            label: "Level Seven Lights",
            status: state.worldState.powerRestoredSections["lights-level-seven"]
              ? "on"
              : "off",
          },
          {
            id: "CryoLabs",
            kind: "switch",
            label: "Cryonics Laboratory",
            status: state.worldState.powerRestoredSections["cryo-labs"]
              ? "on"
              : "off",
          },
          {
            id: "Sleepers",
            kind: "switch",
            label: "Cryonics Sleep Chambers",
            status: state.worldState.powerRestoredSections["cryo-sleep"]
              ? "on"
              : "off",
          },
        ],
      },
    ],
  };
}

type Breadcrumb = { node: MenuNode; selectedIndex: number };

function applyPowerFromSwitches(
  worldState: WorldState,
  switchStates: SwitchStates,
): WorldState {
  const nextPower = { ...worldState.powerRestoredSections };

  for (const [switchId, config] of Object.entries(POWER_SECTION_MAP)) {
    const value = switchStates[switchId];
    if (!value) continue;

    const section = config.section as keyof typeof nextPower;
    nextPower[section] = value === config.activeWhen;
  }

  return {
    ...worldState,
    powerRestoredSections: nextPower,
  };
}

export function PowerStationTerminalModal({
  onClose,
  state,
  setGameState,
}: Props) {
  const [root] = useState<TreeNode>(() => buildPowerGridTree(state));
  const [path, setPath] = useState<Breadcrumb[]>([
    { node: root, selectedIndex: 0 },
  ]);

  const [switchStates, setSwitchStates] = useState<SwitchStates>(() => {
    const map = {} as SwitchStates;
    const walk = (n: TreeNode) => {
      if (isMenu(n)) n.children.forEach(walk);
      else {
        // normalize any "unknown" nodes by label, and cast to satisfy SwitchStates typing
        map[n.id] = (
          n.status === "unknown" ? normalizeLabelToStatus(n.label) : n.status
        ) as any;
      }
    };
    walk(root);
    return map;
  });

  const current = path[path.length - 1];
  const currentMenu = current.node;

  const listItems: (
    | TreeNode
    | { id: "__back__"; label: "BACK"; kind: "back" }
  )[] = useMemo(() => {
    const base = currentMenu.children;
    if (path.length > 1) {
      return [
        ...base,
        { id: "__back__", label: "BACK", kind: "back" as const },
      ];
    }
    return base;
  }, [currentMenu.children, path.length]);

  const clampIndex = (i: number) =>
    Math.max(0, Math.min(i, listItems.length - 1));

  const setSelectedIndex = (idx: number) => {
    setPath((prev) => {
      const next = [...prev];
      next[next.length - 1] = {
        ...next[next.length - 1],
        selectedIndex: clampIndex(idx),
      };
      return next;
    });
  };

  const selected = listItems[clampIndex(current.selectedIndex)];

  const openMenu = (menu: MenuNode) => {
    setPath((prev) => [...prev, { node: menu, selectedIndex: 0 }]);
  };

  const goBack = () => {
    setPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const toggleSwitch = (opt: OptionNode) => {
    if (!isToggleable(opt)) return;

    setSwitchStates((prev) => {
      const cur = prev[opt.id] ?? opt.status;
      if (cur === "locked" || cur === "failure") return prev; // don't toggle broken/locked
      const nextVal: SwitchStatus = cur === "on" ? "off" : "on";
      return { ...prev, [opt.id]: nextVal };
    });
  };

  const activateSelected = () => {
    if (!selected) return;

    if ((selected as any).kind === "back") return goBack();

    const node = selected as TreeNode;
    if (isMenu(node)) {
      openMenu(node);
      return;
    }
    if (node.kind === "switch") toggleSwitch(node);
  };

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setGameState((prev) => {
      const nextWorldState = applyPowerFromSwitches(
        prev.worldState,
        switchStates,
      );
      if (nextWorldState === prev.worldState) return prev;
      return { ...prev, worldState: nextWorldState };
    });
  }, [switchStates, setGameState]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(current.selectedIndex - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(current.selectedIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        goBack();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        activateSelected();
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <CrtModal
      title="OMNICONNECT — POWER STATION TERMINAL"
      onClose={onClose}
      width={580}
      height={420}
      showHeader={false}
    >
      <div className="pst-root">
        <div
          className="pst-screen"
          ref={rootRef}
          tabIndex={0}
          role="application"
          aria-label="Power Station Terminal"
          onKeyDown={onKeyDown}
        >
          <div className="pst-topline">
            <div className="pst-title">{currentMenu.label}</div>
            <div className="pst-breadcrumb">
              {path.length === 1
                ? "MENU"
                : path.map((p) => p.node.label).join(" / ")}
            </div>
          </div>

          <div
            className="pst-list"
            role="listbox"
            aria-label="Power distribution options"
          >
            {listItems.map((it, idx) => {
              const isSelected = idx === clampIndex(current.selectedIndex);

              if ((it as any).kind === "back") {
                return (
                  <button
                    key={(it as any).id}
                    type="button"
                    className={`pst-row ${isSelected ? "is-selected" : ""}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      setSelectedIndex(idx);
                      goBack();
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="pst-glyph">◀</span>
                    <span className="pst-label">BACK</span>
                    <span className="pst-status" />
                  </button>
                );
              }

              const node = it as TreeNode;
              const glyph = isMenu(node)
                ? "▶"
                : statusGlyph({
                    ...node,
                    status: switchStates[node.id] ?? (node as any).status,
                  });
              const status = isMenu(node)
                ? ""
                : statusText({
                    ...node,
                    status: switchStates[node.id] ?? (node as any).status,
                  });

              const label = isMenu(node)
                ? node.label
                : stripParenNotes(node.label);

              const canToggle =
                !isMenu(node) &&
                node.kind === "switch" &&
                (switchStates[node.id] ?? node.status) !== "locked" &&
                (switchStates[node.id] ?? node.status) !== "failure";

              const onRowClick = () => {
                setSelectedIndex(idx);
                if (isMenu(node)) openMenu(node);
                else if (node.kind === "switch") toggleSwitch(node);
              };

              const onRowDoubleClick: React.MouseEventHandler<
                HTMLButtonElement
              > = (e) => {
                e.preventDefault();
              };

              return (
                <button
                  key={node.id}
                  type="button"
                  className={`pst-row ${isSelected ? "is-selected" : ""}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={onRowClick}
                  onDoubleClick={onRowDoubleClick}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="pst-glyph" aria-hidden="true">
                    {glyph}
                  </span>

                  <span className="pst-label">{label}</span>

                  <span className="pst-status" aria-hidden="true">
                    {status}
                  </span>

                  {!isMenu(node) && node.kind === "switch" ? (
                    <span className="pst-hint" aria-hidden="true">
                      {canToggle ? "[SPACE]" : ""}
                    </span>
                  ) : (
                    <span className="pst-hint" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pst-footer">
            <div className="pst-help">
              ↑↓ select • SPACE/ENTER open/toggle • ← back • ESC close • mouse
              supported
            </div>
          </div>
        </div>
      </div>
    </CrtModal>
  );
}
