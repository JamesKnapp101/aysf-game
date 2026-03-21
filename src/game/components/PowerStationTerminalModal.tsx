import { useEffect, useMemo, useRef, useState, type KeyboardEventHandler } from "react";
import "../../styles/components/power-station-terminal.css";
import type { GameState } from "../types/gameTypes";
import type { SwitchStates } from "../types/itemTypes";
import { CrtModal } from "./CrtModal";
import { PowerStationTerminalScreen } from "./PowerStationTerminalScreen";
import {
  applyPowerFromSwitches,
  buildInitialSwitchStates,
  clampIndex,
  getBreadcrumbText,
  getListItems,
  isBackNode,
  isMenu,
  isToggleable,
  POWER_GRID_ROOT,
  type Breadcrumb,
  type MenuTreeNode,
  type PowerListItem,
  type TreeNode,
} from "./powerStationTerminalHelpers";

type Props = {
  onClose: () => void;
  state: GameState;
  setGameState: (updater: (prev: GameState) => GameState) => void;
};

export function PowerStationTerminalModal({
  onClose,
  state,
  setGameState,
}: Props) {
  const [path, setPath] = useState<Breadcrumb[]>([
    { node: POWER_GRID_ROOT, selectedIndex: 0 },
  ]);
  const [switchStates, setSwitchStates] = useState<SwitchStates>(() =>
    buildInitialSwitchStates(state.worldState),
  );

  const current = path[path.length - 1];
  const currentMenu = current.node;
  const listItems = useMemo(
    () => getListItems(currentMenu, path.length),
    [currentMenu, path.length],
  );
  const selectedIndex = clampIndex(current.selectedIndex, listItems.length);
  const selectedItem = listItems[selectedIndex];
  const breadcrumbText = useMemo(() => getBreadcrumbText(path), [path]);

  const setSelectedIndex = (index: number) => {
    setPath((prev) => {
      const next = [...prev];
      next[next.length - 1] = {
        ...next[next.length - 1],
        selectedIndex: clampIndex(index, listItems.length),
      };
      return next;
    });
  };

  const openMenu = (menu: MenuTreeNode) => {
    setPath((prev) => [...prev, { node: menu, selectedIndex: 0 }]);
  };

  const goBack = () => {
    setPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const toggleSwitch = (node: TreeNode) => {
    if (!isToggleable(node)) return;

    setSwitchStates((prev) => {
      const currentStatus = prev[node.id] ?? "off";
      if (currentStatus === "locked" || currentStatus === "failure") {
        return prev;
      }

      return {
        ...prev,
        [node.id]: currentStatus === "on" ? "off" : "on",
      };
    });
  };

  const activateItem = (item: PowerListItem | undefined) => {
    if (!item) return;

    if (isBackNode(item)) {
      goBack();
      return;
    }

    if (isMenu(item)) {
      openMenu(item);
      return;
    }

    toggleSwitch(item);
  };

  const activateIndex = (index: number) => {
    const nextIndex = clampIndex(index, listItems.length);
    setSelectedIndex(nextIndex);
    activateItem(listItems[nextIndex]);
  };

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setGameState((prev) => {
      const nextWorldState = applyPowerFromSwitches(prev.worldState, switchStates);
      if (nextWorldState === prev.worldState) return prev;
      return { ...prev, worldState: nextWorldState };
    });
  }, [setGameState, switchStates]);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex(current.selectedIndex - 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex(current.selectedIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        goBack();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        activateItem(selectedItem);
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <CrtModal
      title="OMNICONNECT - POWER STATION TERMINAL"
      onClose={onClose}
      width={580}
      height={420}
      showHeader={false}
    >
      <PowerStationTerminalScreen
        breadcrumbText={breadcrumbText}
        currentMenu={currentMenu}
        listItems={listItems}
        onActivateIndex={activateIndex}
        onKeyDown={onKeyDown}
        onSelectIndex={setSelectedIndex}
        rootRef={rootRef}
        selectedIndex={selectedIndex}
        switchStates={switchStates}
      />
    </CrtModal>
  );
}
