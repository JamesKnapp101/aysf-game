import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/power-station-terminal.css";
import type { GameState } from "../types/gameTypes";
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
      return "⛔";
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
  return "unknown";
}

function stripParenNotes(label: string) {
  return label.replace(/\s*\([^)]*\)\s*$/, "");
}

function buildPowerGridTree(): MenuNode {
  return {
    id: "power_grid_menu",
    kind: "menu",
    label: "Main Power Distribution",
    children: [
      {
        id: "lvl1",
        kind: "menu",
        label: "LEVEL ONE",
        children: [
          {
            id: "Lvl1Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: "on",
          },
          {
            id: "Lvl1Lights",
            kind: "switch",
            label: "Level One Lights",
            status: "on",
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
            id: "TPADPOWER",
            kind: "switch",
            label: "Teleportation Pads",
            status: "off",
          },
          {
            id: "Lvl1Weapons",
            kind: "switch",
            label: "Primary Weapons System",
            status: "on",
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
            status: "on",
          },
          {
            id: "Lvl2Lights",
            kind: "static",
            label: "Level Two Lights (system failure)",
            status: "failure",
          },
          {
            id: "Lvl2TPADS",
            kind: "static",
            label: "Teleportation Pads (system failure)",
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
            status: "on",
          },
          {
            id: "Lvl3Lights",
            kind: "switch",
            label: "Level Three Lights",
            status: "on",
          },
          {
            id: "HubSecurity",
            kind: "switch",
            label: "Hub Security",
            status: "on",
          },
          {
            id: "Lvl3Terminal",
            kind: "switch",
            label: "Library Terminals",
            status: "off",
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
            status: "on",
          },
          {
            id: "Lvl4Lights",
            kind: "switch",
            label: "Level Four Lights",
            status: "on",
          },
        ],
      },

      {
        id: "lvl5",
        kind: "menu",
        label: "LEVEL FIVE",
        children: [
          {
            id: "Lvl5Lights",
            kind: "switch",
            label: "Level Five Lights",
            status: "off",
          },
          {
            id: "Lvl5Grav",
            kind: "switch",
            label: "Artificial Gravity Field",
            status: "on",
          },
          {
            id: "ECore",
            kind: "switch",
            label: "Engine Core Power Lock",
            status: "on",
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
            status: "on",
          },
          {
            id: "Lvl6Lights",
            kind: "switch",
            label: "Level Six Lights",
            status: "on",
          },
          {
            id: "LoadDockDoor",
            kind: "switch",
            label: "Loading Dock Door",
            status: "on",
          },
          {
            id: "LoadGrid",
            kind: "switch",
            label: "Loading Grid",
            status: "off",
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
            status: "on",
          },
          {
            id: "Lvl7Lights",
            kind: "switch",
            label: "Level Seven Lights",
            status: "on",
          },
          {
            id: "CryoLabs",
            kind: "switch",
            label: "Cryonics Laboratory",
            status: "on",
          },
          {
            id: "Sleepers",
            kind: "switch",
            label: "Cryonics Sleep Chambers",
            status: "on",
          },
        ],
      },
    ],
  };
}

type Breadcrumb = { node: MenuNode; selectedIndex: number };

export function PowerStationTerminalModal({ onClose, state }: Props) {
  void state;

  const root = useMemo(() => buildPowerGridTree(), []);
  const [path, setPath] = useState<Breadcrumb[]>([
    { node: root, selectedIndex: 0 },
  ]);

  const [switchStates, setSwitchStates] = useState<
    Record<string, SwitchStatus>
  >(() => {
    const map: Record<string, SwitchStatus> = {};
    const walk = (n: TreeNode) => {
      if (isMenu(n)) n.children.forEach(walk);
      else {
        if (n.status === "unknown") {
          map[n.id] = normalizeLabelToStatus(n.label);
        } else {
          map[n.id] = n.status;
        }
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
